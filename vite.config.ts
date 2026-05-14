import 'dotenv/config'
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// OpenRouter (локальный dev): https://openrouter.ai/docs
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || 'google/gemma-4-31b-it:free'

function wellnessApiPlugin() {
  return {
    name: 'wellness-api',
    configureServer(server) {
      server.middlewares.use('/api/wellness-advice', async (req, res, next) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Use POST' }))
          return
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', async () => {
          try {
            const { weather } = JSON.parse(body || '{}')
            if (!weather?.current || !weather?.location || !weather?.astronomy) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Нужны данные погоды (weather).' }))
              return
            }
            const apiKey = process.env.OPENROUTER_API_KEY
            if (!apiKey) {
              res.statusCode = 503
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'OPENROUTER_API_KEY не задан в .env' }))
              return
            }
            const { location, current, astronomy } = weather
            const prompt = `Ты — помощник по самочувствию. Дай краткий персональный совет по самочувствию на основе погоды. Пиши по-русски, дружелюбно и по делу, 2–4 предложения.

Данные погоды:
- Город: ${location.name}, ${location.country}
- Температура: ${current.temp_c}°C (ощущается как ${current.feelslike_c}°C)
- Условия: ${current.condition.text}
- Влажность: ${current.humidity}%
- Давление: ${current.pressure_mb} мбар
- Ветер: ${current.wind_kph} км/ч
- Фаза луны: ${astronomy.moon_phase}

Напиши только текст совета, без заголовков и лишнего.`;
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
                messages: [{ role: 'user', content: prompt }],
              }),
            })
            const text = await response.text()
            if (!response.ok) {
              res.statusCode = 502
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: text.slice(0, 200) || `OpenRouter ${response.status}` }))
              return
            }
            const data = JSON.parse(text)
            const content = data?.choices?.[0]?.message?.content?.trim()
            if (!content) {
              const fallback =
                'Погодные условия могут влиять на самочувствие. Следите за давлением, влажностью и перепадами температуры. При недомогании обратитесь к врачу.'
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ advice: fallback }))
              return
            }
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ advice: content }))
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: (err as Error).message || 'Ошибка' }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    wellnessApiPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
