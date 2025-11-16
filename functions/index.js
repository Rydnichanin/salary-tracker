const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.dailySalaryUpdate = functions.pubsub
  .schedule("0 22 * * *") // каждый день в 22:00
  .timeZone("Asia/Almaty")
  .onRun(async () => {
    const dailyAmount = 15000;
    const userId = "main"; // ID документа salaryData/main

    const db = admin.firestore();
    const salaryRef = db.doc(`salaryData/${userId}`);
    const balanceRef = db.doc(`users/${userId}`);

    try {
      // Используем FieldValue.increment и set с merge: true — безопаснее:
      // инкремент атомарен и создаст поля/документы при необходимости.
      const increment = admin.firestore.FieldValue.increment(dailyAmount);

      await Promise.all([
        salaryRef.set({ paidOut: increment }, { merge: true }),
        balanceRef.set({ salary: increment }, { merge: true }),
      ]);

      console.log(`Daily salary added: ${dailyAmount} to ${userId}`);
      return null;
    } catch (error) {
      console.error("Error updating daily salary:", error);
      // пробрасываем ошибку, чтобы платформа отметила неудачное выполнение, если нужно
      throw error;
    }
  });
