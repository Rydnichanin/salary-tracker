const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '..', 'serviceAccountKey.json');

if (!fs.existsSync(keyPath)) {
  console.error('Service account key not found at', keyPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Можно переопределить через env:
// process.env.DAILY_AMOUNT, process.env.USER_ID
const dailyAmount = Number(process.env.DAILY_AMOUNT) || 15000;
const userId = process.env.USER_ID || 'main';

async function run() {
  try {
    const increment = admin.firestore.FieldValue.increment(dailyAmount);

    await Promise.all([
      db.doc(`salaryData/${userId}`).set({ paidOut: increment }, { merge: true }),
      db.doc(`users/${userId}`).set({ salary: increment }, { merge: true }),
    ]);

    console.log(`Daily salary added: ${dailyAmount} to ${userId}`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating daily salary:', err);
    process.exit(1);
  }
}

run();
