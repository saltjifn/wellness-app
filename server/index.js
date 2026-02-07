import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
// Для APK (Capacitor): origin может быть capacitor://localhost
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Проверка: открой http://localhost:3001/api/health в браузере
app.get('/api/health', (req, res) => res.json({ ok: true, msg: 'Server running' }));

// Модели: https://console.upstage.ai/docs/models
const UPSTAGE_URL = 'https://api.upstage.ai/v1/chat/completions';
const UPSTAGE_MODEL = process.env.UPSTAGE_MODEL || 'solar-pro3-260126';

function buildPrompt(weather) {
  const { location, current, astronomy } = weather;
  return `Ты — помощник по самочувствию. Дай краткий персональный совет по самочувствию на основе погоды. Пиши по-русски, дружелюбно и по делу, 2–4 предложения.

Данные погоды:
- Город: ${location.name}, ${location.country}
- Температура: ${current.temp_c}°C (ощущается как ${current.feelslike_c}°C)
- Условия: ${current.condition.text}
- Влажность: ${current.humidity}%
- Давление: ${current.pressure_mb} мбар
- Ветер: ${current.wind_kph} км/ч
- Фаза луны: ${astronomy.moon_phase}

Напиши только текст совета, без заголовков и лишнего.`;
}

app.all('/api/wellness-advice', (req, res, next) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  next();
});

app.post('/api/wellness-advice', async (req, res) => {
  const apiKey = process.env.UPSTAGE_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'UPSTAGE_API_KEY не задан. В .env добавь: UPSTAGE_API_KEY=up_...',
    });
  }

  const { weather } = req.body;
  if (!weather?.current || !weather?.location || !weather?.astronomy) {
    return res.status(400).json({ error: 'Нужны данные погоды (weather).' });
  }

  const userPrompt = buildPrompt(weather);

  try {
    const response = await fetch(UPSTAGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: UPSTAGE_MODEL,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let message = `Upstage error: ${response.status}`;
      if (response.status === 429) message = 'Превышен лимит запросов. Попробуй позже.';
      else if (response.status === 401) message = 'Неверный API-ключ Upstage.';
      else if (errText) message = errText.slice(0, 200);
      return res.status(response.status >= 500 ? 502 : response.status).json({ error: message });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    const fallback =
      'Погодные условия могут влиять на самочувствие. Следите за давлением, влажностью и перепадами температуры. При недомогании обратитесь к врачу.';

    if (!content) {
      console.warn('[wellness] Upstage вернул пустой ответ:', JSON.stringify(data).slice(0, 300));
      return res.json({ advice: fallback });
    }

    return res.json({ advice: content });
  } catch (err) {
    const message =
      err.cause?.code === 'ENOTFOUND' || err.code === 'ENOTFOUND'
        ? 'Нет доступа к интернету.'
        : (err.message || 'Ошибка при запросе к модели.');
    return res.status(502).json({ error: message });
  }
});

app.use((req, res) => {
  console.log('[404]', req.method, req.url);
  res.status(404).json({ error: 'Not found', path: req.url });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Wellness API: http://localhost:${PORT}`);
  console.log('  GET  http://localhost:' + PORT + '/api/health — проверка');
  console.log('  POST http://localhost:' + PORT + '/api/wellness-advice');
});
