# MeetGrid Frontend

Простой интерфейс для MVP MeetGrid — мобильная SPA на React + Vite, подключённая к FastAPI + Redis бэкенду.

## Быстрый старт

1. Установите зависимости:
   ```bash
   npm install
   ```
2. Запустите dev-сервер:
   ```bash
   npm run dev
   ```
   По умолчанию Vite поднимает сервер на `http://localhost:5173`.

## Сборка

```bash
npm run build
```

## Тестирование

- Юнит/интеграционные тесты (Jest):
  ```bash
  npm run test
  ```
- Cypress-интерфейс (ручной режим):
  ```bash
  npm run cypress:open
  ```

## Структура

- `src/routes/` — конфигурация роутов `react-router-dom`.
- `src/pages/` — экранные компоненты (`Landing`, `TopicCreate`, `TopicMain`, `TopicAdmin`).
- `src/components/` — переиспользуемые UI-блоки (формы, карточки, модальные окна).
- `src/store/` — Redux Toolkit слайсы и хуки.
- `src/services/` — API-обёртки для `/api/v1/topic`.
- `src/hooks/` и `src/utils/` — вспомогательные хуки и утилиты.
- `src/assets/` — шрифты, иконки, статические картинки.
- `docs/calendar-styling.md` — краткое описание палитры и responsive-стратегий календаря.

Поддерживается русскоязычный UI, мобильная верстка, Ant Design + React Big Calendar, а также строгий TypeScript.
