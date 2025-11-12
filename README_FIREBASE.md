# Интеграция с Firebase — краткая инструкция

1) Создайте проект в Firebase Console: https://console.firebase.google.com/
2) В разделе Project settings -> Your apps -> Add web app — получите конфигурацию и вставьте её в файл src/firebase.js, заменив поля <REPLACE_...>.
3) Включите Authentication -> Sign-in method -> Anonymous (или Email/Google по желанию).
4) Включите Firestore Database (начните в режиме тестирования для разработки).
   Пример правил для разработки (доступ только авторизованным пользователям):
   ```
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
5) Локально — просто откройте index.html в браузере (если используете модульные импорты с CDN, то нужно запускать через локальный сервер).
   Пример: python -m http.server 8000
   Затем откройте http://localhost:8000
6) Для деплоя используйте Firebase Hosting:
   - Установите CLI: npm i -g firebase-tools
   - Выполните: firebase login
   - Инициализация: firebase init hosting (выберите existing project)
   - Деплой: firebase deploy --only hosting

Если хотите, я могу:
- Вставить реальные значения firebaseConfig (если вы пришлёте их) и запушить изменения в ветку feature/firebase-integration;
- Или создать PR сразу (мне нужен доступ записи в репо, у вас он есть — дай знать и я запушу).