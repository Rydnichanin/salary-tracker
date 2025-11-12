// Инициализация Firebase (модуль, импортируется в index.html)
// Замените поля в firebaseConfig на значения из вашей Firebase Console
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.24.0/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged, } from 'https://www.gstatic.com/firebasejs/9.24.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.24.0/firebase-firestore.js';

let app;
export let auth;
export let db;

export async function initFirebase() {
  if (app) return;
  const firebaseConfig = {
    apiKey: "<REPLACE_API_KEY>",
    authDomain: "<REPLACE_AUTH_DOMAIN>",
    projectId: "<REPLACE_PROJECT_ID>",
    storageBucket: "<REPLACE_STORAGE_BUCKET>",
    messagingSenderId: "<REPLACE_MESSAGING_SENDER_ID>",
    appId: "<REPLACE_APP_ID>"
  };
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

// Вспомогательная функция: если нет пользователя — логиним анонимно
export async function signInAnonymouslyIfNeeded() {
  if (!auth) throw new Error('Firebase не инициализирован');
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) return resolve(user);
      signInAnonymously(auth)
        .then(() => resolve(auth.currentUser))
        .catch(reject);
    }, reject);
  });
}