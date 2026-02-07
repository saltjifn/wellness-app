import { useState, useEffect, useRef } from 'react';
import type { WeatherData } from './useWeather';

// Render free tier «засыпает» — первый запрос может идти до 60 сек
const REQUEST_TIMEOUT_MS = 65_000;

const FALLBACK_ADVICE =
  'Погодные условия могут влиять на самочувствие. Следите за давлением, влажностью и перепадами температуры. При недомогании обратитесь к врачу.';

function getWellnessApiUrl(): string {
  if (typeof import.meta.env !== 'undefined' && import.meta.env.VITE_WELLNESS_API_URL) {
    const url = (import.meta.env.VITE_WELLNESS_API_URL as string).trim().replace(/\/$/, '');
    if (url) return url;
  }
  // Dev: API встроен в Vite. Prod/APK: нужен VITE_WELLNESS_API_URL.
  return '';
}

function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(id)
  );
}

export function useWellnessAdvice(weather: WeatherData | null) {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const lastKeyRef = useRef<string | null>(null);

  const retry = () => setRetryCount((c) => c + 1);

  useEffect(() => {
    if (!weather) {
      lastKeyRef.current = null;
      setAdvice(null);
      setError(null);
      return;
    }

    const key = `${weather.location.name}-${weather.current.temp_c}-${weather.current.humidity}`;
    if (retryCount === 0 && lastKeyRef.current === key) return;
    lastKeyRef.current = key;
    setAdvice(null);
    setError(null);
    setLoading(true);

    const base = getWellnessApiUrl();
    const url = base ? `${base}/api/wellness-advice` : '/api/wellness-advice';

    let cancelled = false;

    fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weather }),
      },
      REQUEST_TIMEOUT_MS
    )
      .then(async (res) => {
        const text = await res.text();
        if (cancelled) return { advice: null };
        if (!text) {
          throw new Error(
            res.status === 502 || res.status === 504
              ? 'Сервер не отвечает. Запусти в отдельном терминале: npm run dev:server'
              : 'Пустой ответ. Запусти сервер: npm run dev:server'
          );
        }
        let data: { advice?: string; error?: string };
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Сервер вернул не JSON. Запущен ли npm run dev:server?');
        }
        if (!res.ok) throw new Error((data as { error?: string })?.error || res.statusText);
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        const text = (data as { advice?: string })?.advice?.trim();
        setAdvice(text || FALLBACK_ADVICE);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        let msg: string;
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            msg = 'Сервер долго не отвечает (до 65 сек). Проверь интернет или подожди — Render может «просыпаться».';
          } else if (err.message === 'Failed to fetch' || err.message?.includes('fetch')) {
            msg = 'Нет доступа к интернету. Проверь Wi‑Fi или мобильные данные и нажми «Повторить».';
          } else {
            msg = err.message;
          }
        } else {
          msg = 'Ошибка запроса';
        }
        setError(msg);
        setAdvice(FALLBACK_ADVICE);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [weather, retryCount]);

  return {
    advice: advice ?? (error ? FALLBACK_ADVICE : null),
    loading,
    error,
    retry,
  };
}
