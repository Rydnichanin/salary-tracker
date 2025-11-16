const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.dailySalaryUpdate = functions.pubsub
  .schedule("0 22 * * *") // каждый день в 22:00
  .timeZone("Asia/Almaty")
  .onRun(async () => {
    const dailyAmount = 15000;

    const userId = "main"; // ← твой ID документа salaryData/main

    const salaryRef = admin.firestore().doc(`salaryData/${userId}`);
    const balanceRef = admin.firestore().doc(`users/${userId}`);

    const salarySnap = await salaryRef.get();
    const balanceSnap = await balanceRef.get();

    const currentPaidOut = salarySnap.data()?.paidOut || 0;
    const currentBalance = balanceSnap.data()?.salary || 0;

    const newPaidOut = currentPaidOut + dailyAmount;
    const newBalance = currentBalance + dailyAmount;

    await salaryRef.update({ paidOut: newPaidOut });
    await balanceRef.update({ salary: newBalance });

    console.log("Daily salary added:", dailyAmount);

    return null;
  });
