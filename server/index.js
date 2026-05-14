import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true, msg: 'Server running' }));

// OpenRouter: https://openrouter.ai/docs
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || 'google/gemma-4-31b-it:free';

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
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'OPENROUTER_API_KEY не задан. В .env: OPENROUTER_API_KEY=sk-or-v1-...',
    });
  }

  const { weather } = req.body;
  if (!weather?.current || !weather?.location || !weather?.astronomy) {
    return res.status(400).json({ error: 'Нужны данные погоды (weather).' });
  }

  const userPrompt = buildPrompt(weather);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'https://localhost',
        'X-Title': 'Wellness Weather App',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let message = `OpenRouter: ${response.status}`;
      if (response.status === 429) message = 'Превышен лимит запросов. Попробуй позже.';
      else if (response.status === 401) message = 'Неверный API-ключ OpenRouter.';
      else if (errText) message = errText.slice(0, 300);
      return res.status(response.status >= 500 ? 502 : response.status).json({ error: message });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    const fallback =
      'Погодные условия могут влиять на самочувствие. Следите за давлением, влажностью и перепадами температуры. При недомогании обратитесь к врачу.';

    if (!content) {
      console.warn('[wellness] OpenRouter пустой ответ:', JSON.stringify(data).slice(0, 400));
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
