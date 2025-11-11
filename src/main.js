// src/main.js — основной код приложения (использует firebase из npm и chart.js)
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import Chart from "chart.js/auto";

// ---- Firebase config (вставлено из ранее предоставленного) ----
const firebaseConfig = {
  apiKey: "AIzaSyDNk1We9du5BJyrgGbQrkqd7tSDscneIOA",
  authDomain: "gold-11fa4.firebaseapp.com",
  projectId: "gold-11fa4",
  storageBucket: "gold-11fa4.firebasestorage.app",
  messagingSenderId: "226774330161",
  appId: "1:226774330161:web:d1e1c93ade5dcea31d5e10",
  measurementId: "G-7MLLBN1YZ4"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
let analytics;
try { analytics = getAnalytics(app); } catch (e) { console.warn("Analytics not available:", e); }
const auth = getAuth(app);
const db = getFirestore(app);

// ----- Настройки приложения -----
let rate = 15000;
let startDate = new Date("2025-10-23");

// ----- Состояние -----
let transactions = JSON.parse(localStorage.getItem('transactions')) || []; // формат: {id?, date, amount}
let editingIndex = -1;
let currentUser = null;

// ----- DOM элементы -----
const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');
const signUpBtn = document.getElementById('signUpBtn');
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const userInfoEl = document.getElementById('userInfo');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');

// ----- Auth handlers -----
signUpBtn.addEventListener('click', async () => {
  const email = emailEl.value.trim(), pw = passwordEl.value;
  if (!email || !pw) return alert("Введите email и пароль.");
  try {
    await createUserWithEmailAndPassword(auth, email, pw);
    alert('Регистрация успешна. Вы автоматически залогинены.');
  } catch (e) { alert('Ошибка регистрации: ' + e.message); }
});
signInBtn.addEventListener('click', async () => {
  const email = emailEl.value.trim(), pw = passwordEl.value;
  if (!email || !pw) return alert("Введите email и пароль.");
  try {
    await signInWithEmailAndPassword(auth, email, pw);
  } catch (e) { alert('Ошибка входа: ' + e.message); }
});
signOutBtn.addEventListener('click', async () => {
  await signOut(auth);
});

// слушаем изменение авторизации
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    userInfoEl.textContent = `Залогинен: ${user.email}`;
    signOutBtn.style.display = "inline-block";
    signInBtn.style.display = "none";
    signUpBtn.style.display = "none";
    await loadTransactionsFromFirestore();
  } else {
    userInfoEl.textContent = 'Не залогинен';
    signOutBtn.style.display = "none";
    signInBtn.style.display = "inline-block";
    signUpBtn.style.display = "inline-block";
    transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    editingIndex = -1;
    updateDisplay();
  }
});

// ----- Firestore взаимодействия -----
function userTransactionsCollection(uid) {
  return collection(db, `users/${uid}/transactions`);
}

async function loadTransactionsFromFirestore() {
  if (!currentUser) return;
  try {
    const col = userTransactionsCollection(currentUser.uid);
    const snapshot = await getDocs(col);
    transactions = snapshot.docs.map(d => ({ id: d.id, date: d.data().date, amount: d.data().amount }));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    editingIndex = -1;
    updateDisplay();
  } catch (e) {
    console.error("Ошибка загрузки из Firestore:", e);
    alert("Не удалось загрузить транзакции из Firestore.");
  }
}

async function addTransactionToFirestore(t) {
  if (!currentUser) throw new Error("No user");
  const col = userTransactionsCollection(currentUser.uid);
  const ref = await addDoc(col, { date: t.date, amount: t.amount });
  return ref.id;
}

async function updateTransactionInFirestore(id, t) {
  if (!currentUser) throw new Error("No user");
  const d = doc(db, `users/${currentUser.uid}/transactions`, id);
  await updateDoc(d, { date: t.date, amount: t.amount });
}

async function deleteTransactionFromFirestore(id) {
  if (!currentUser) throw new Error("No user");
  const d = doc(db, `users/${currentUser.uid}/transactions`, id);
  await deleteDoc(d);
}

// ----- Подсчёт баланса по дням -----
function calculateBalance() {
    let today = new Date();
    let daysWorked = Math.floor((today - startDate)/(1000*60*60*24)) + 1;
    if (daysWorked < 1) daysWorked = 1;
    let balanceByDay = [];
    let total = 0;

    for (let i=0; i<daysWorked; i++) {
        total += rate;
        let currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        transactions.forEach(t => {
            let tDate = new Date(t.date);
            if (tDate.toDateString() === currentDate.toDateString()) total -= t.amount;
        });
        balanceByDay.push({date: new Date(currentDate), balance: total});
    }
    return balanceByDay;
}

// ----- Управление транзакциями (добавление/редакт) -----
saveBtn.addEventListener('click', addOrSaveTransaction);
cancelBtn.addEventListener('click', cancelEdit);

async function addOrSaveTransaction() {
    const dateInput = document.getElementById('transDate').value;
    const amount = parseFloat(document.getElementById('change').value);
    if (!dateInput || isNaN(amount)) return alert("Заполните дату и сумму.");

    if (editingIndex >= 0) {
        const existing = transactions[editingIndex];
        const updated = { ...existing, date: dateInput, amount: amount };
        transactions[editingIndex] = updated;
        if (currentUser && existing.id) {
            try { await updateTransactionInFirestore(existing.id, updated); } catch(e){ alert('Ошибка обновления в Firestore'); }
        } else if (currentUser && !existing.id) {
            try {
              const newId = await addTransactionToFirestore(updated);
              transactions[editingIndex].id = newId;
            } catch(e){ alert('Ошибка добавления в Firestore'); }
        }
        editingIndex = -1;
    } else {
        const newT = { date: dateInput, amount: amount };
        if (currentUser) {
            try {
              const newId = await addTransactionToFirestore(newT);
              newT.id = newId;
              transactions.push(newT);
            } catch(e){ alert('Ошибка добавления в Firestore'); transactions.push(newT); }
        } else {
            transactions.push(newT);
        }
    }

    localStorage.setItem('transactions', JSON.stringify(transactions));
    clearForm();
    updateDisplay();
}

// ----- Редактирование/удаление -----
function startEdit(i) {
    const t = transactions[i];
    document.getElementById('transDate').value = t.date;
    document.getElementById('change').value = t.amount;
    editingIndex = i;
    document.getElementById('saveBtn').textContent = "Сохранить изменение";
    document.getElementById('cancelBtn').style.display = "inline-block";
}

function cancelEdit() {
    editingIndex = -1;
    clearForm();
    document.getElementById('saveBtn').textContent = "Добавить транзакцию";
    document.getElementById('cancelBtn').style.display = "none";
}

async function deleteTransaction(i) {
    if (!confirm("Удалить эту транзакцию?")) return;
    const t = transactions[i];
    if (currentUser && t.id) {
        try { await deleteTransactionFromFirestore(t.id); } catch (e) { alert("Ошибка удаления из Firestore."); }
    }
    transactions.splice(i,1);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    if (editingIndex === i) cancelEdit();
    else if (editingIndex > i) editingIndex--;
    updateDisplay();
}

// ----- UI вспомогалки -----
function clearForm() {
    document.getElementById('transDate').value = "";
    document.getElementById('change').value = "";
    document.getElementById('saveBtn').textContent = "Добавить транзакцию";
    document.getElementById('cancelBtn').style.display = "none";
}

function updateDisplay() {
    let historyHTML = "<h3>История транзакций:</h3>";
    if (transactions.length === 0) {
        historyHTML += "<div>Транзакций нет</div>";
    } else {
        transactions.forEach((t,i)=>{
            const sign = t.amount > 0 ? '+' : '-';
            const abs = Math.abs(t.amount).toLocaleString('ru-RU');
            historyHTML += `<div class="history-item">
                <div class="history-left">${t.date}: ${sign}${abs}</div>
                <div class="history-actions">
                  <button class="small-btn" onclick="window.startEditFromGlobal(${i})">Редактировать</button>
                  <button class="small-btn" onclick="window.deleteTransactionFromGlobal(${i})">Удалить</button>
                </div>
            </div>`;
        });
    }
    document.getElementById('history').innerHTML = historyHTML;

    let balanceByDay = calculateBalance();
    let totalBalance = balanceByDay[balanceByDay.length-1]?.balance || 0;
    document.getElementById('result').innerHTML = `<h3>Итог: ${totalBalance.toLocaleString('ru-RU')} тенге</h3>`;

    drawChart(balanceByDay);
}

// expose functions to window for inline onclick handlers in generated HTML
window.startEditFromGlobal = startEdit;
window.deleteTransactionFromGlobal = deleteTransaction;

// ----- Chart -----
function drawChart(balanceByDay) {
    const ctx = document.getElementById('salaryChart').getContext('2d');
    if(window.salaryChartInstance) window.salaryChartInstance.destroy();
    window.salaryChartInstance = new Chart(ctx,{ 
        type:'line',
        data:{
            labels: balanceByDay.map(b=>b.date.toISOString().split('T')[0]),
            datasets:[{
                label:'Баланс',
                data: balanceByDay.map(b=>b.balance),
                borderColor:'green',
                fill:false,
                tension:0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// ----- Инициализация -----
updateDisplay();

// Экспорт для тестов/дальнейшего использования (не обязательно)
export { app, auth, db };