# Как сделать, чтобы ИИ-советы работали на телефоне (APK)

## Суть

В APK только статический сайт. Сервер с ИИ не встроен. Поэтому телефон должен ходить за советами в интернет — на твой сервер, который ты один раз выложишь на Render.

---

## Часть 1: Выложить сервер на Render (один раз)

### Шаг 1.1. Зарегистрироваться и создать проект

1. Зайди на **https://render.com**
2. Нажми **Get Started** → зарегистрируйся (можно через GitHub).
3. В Dashboard нажми **New +** → **Web Service**.

### Шаг 1.2. Подключить репозиторий

Если проект ещё не на GitHub:

1. Зайди на **https://github.com** и создай новый репозиторий (например `wellness-app`).
2. В папке проекта `vvv` в терминале:
   ```powershell
   cd C:\Users\OJIECbKA\Desktop\vvv
   git init
   git add .
   git commit -m "initial"
   git branch -M main
   git remote add origin https://github.com/ТВОЙ_ЛОГИН/wellness-app.git
   git push -u origin main
   ```
   (подставь свой логин и имя репо).

В Render:

1. **Connect a repository** → выбери свой GitHub и репозиторий с проектом.
2. Если Render просит доступ — разреши.

### Шаг 1.3. Настроить Web Service

Заполни поля:

| Поле | Значение |
|------|----------|
| **Name** | `wellness-api` (или любое) |
| **Region** | любой (например Frankfurt) |
| **Branch** | `main` |
| **Root Directory** | оставь пустым |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### Шаг 1.4. Добавить переменные окружения

Внизу страницы — блок **Environment Variables**. Добавь:

| Key | Value |
|-----|-------|
| `UPSTAGE_API_KEY` | `up_A4G6RO33pt2vDuwo19AUWihoPXSvz` (твой ключ из .env) |
| `UPSTAGE_MODEL` | `solar-pro3-260126` (если нужно) |

Нажми **Add**.

### Шаг 1.5. Создать сервис

Нажми **Create Web Service**. Render начнёт сборку. Подожди 2–5 минут.

### Шаг 1.6. Получить URL

Когда сборка закончится (зелёный статус), вверху страницы будет **URL**, например:

```
https://wellness-api-xxxx.onrender.com
```

Скопируй этот URL — он нужен для приложения.

---

## Часть 2: Прописать URL в приложении и собрать APK

### Шаг 2.1. Добавить URL в .env

Открой файл `.env` в корне проекта и добавь строку (подставь свой URL из Render):

```env
VITE_WELLNESS_API_URL=https://wellness-api-xxxx.onrender.com
```

Не ставь слэш в конце. Сохрани файл.

### Шаг 2.2. Собрать приложение

В терминале:

```powershell
cd C:\Users\OJIECbKA\Desktop\vvv
npm run build
```

Vite встроит `VITE_WELLNESS_API_URL` в код при сборке.

### Шаг 2.3. Обновить Android-проект и собрать APK

```powershell
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

### Шаг 2.4. Найти APK

Файл лежит здесь:

```
C:\Users\OJIECbKA\Desktop\vvv\android\app\build\outputs\apk\debug\app-debug.apk
```

Скопируй его на телефон и установи. ИИ-советы будут ходить на твой сервер в интернете.

---

## Важно

- **Бесплатный тариф Render** — сервис «засыпает» после ~15 минут без запросов. Первый запрос после этого может идти 30–60 секунд (пока сервер просыпается).
- **Ключ в Render** — его видит только сервер, не приложение. В APK ключа нет.
- После изменения URL в `.env` всегда заново выполняй `npm run build`, затем `npx cap sync android` и пересборку APK.

---

## Часть 3: Как обновить сервер и что значит «ничего не происходит»

### Где выполнять команды

Все команды вводятся в **терминале** — в Cursor нажми **Ctrl+`** (или **Terminal → New Terminal**). Внизу откроется окно, куда можно вводить команды.

### Как обновить сервер на Render

Когда ты меняешь `server/index.js` (или любой код), нужно **отправить изменения на GitHub**. Render автоматически пересоберёт сервер после каждого push.

1. Открой терминал (Ctrl+`).
2. Перейди в папку проекта: `cd C:\Users\OJIECbKA\Desktop\vvv`
3. Выполни по очереди:
   ```
   git add .
   git commit -m "обновление"
   git push
   ```

Render подхватит изменения и пересоберёт сервис (обычно 2–5 минут).

### Проверка: всё ли работает

1. **Сервер на Render**  
   Открой в браузере: `https://wellness-app-tijm.onrender.com/api/health`  
   Должно быть: `{"ok":true,"msg":"Server running"}`

2. **APK на телефоне**  
   - Убедись, что в `.env` есть `VITE_WELLNESS_API_URL=https://wellness-app-tijm.onrender.com`
   - После изменения `.env` обязательно выполни: `npm run build` → `npx cap sync android` → `cd android` → `.\gradlew.bat assembleDebug`
   - Установи новый APK на телефон

3. **Интернет на телефоне**  
   Проверь, что включены Wi‑Fi или мобильные данные.
