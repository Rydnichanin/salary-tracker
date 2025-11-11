# salary-tracker

Проект переведён на npm + Vite и интегрирован с Firebase (Auth + Firestore). Готово к локальной разработке и деплою на Firebase Hosting.

Как запустить локально:
1. Убедитесь, что у вас установлен Node.js (LTS).
2. Установите зависимости:
   npm install
3. Запуск dev-сервера:
   npm run dev
4. Сборка:
   npm run build
   Результат сборки в dist/ — эта папка используется в firebase.json для хостинга.

Firebase:
- .firebaserc содержит projectId (gold-11fa4).
- firebase.json настроен на публикацию dist/ и rewrite на index.html.
- Для автоматического деплоя через GitHub Actions понадобится сервисный аккаунт и секрет FIREBASE_SERVICE_ACCOUNT.

Важно:
- firebaseConfig уже встроен в src/main.js (используется client-side apiKey). Для CI/CD и автоматического деплоя никому не нужно хранить сервисный аккаунт в репозитории.
