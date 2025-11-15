/**
 * Firebase Cloud Functions for salary-tracker
 *
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Ensure Firebase billing is enabled (Blaze plan required for scheduled functions)
 * 2. From the project root:
 *    cd functions && npm install
 * 3. Deploy the function:
 *    firebase deploy --only functions:dailyAdd
 *
 * CONFIG:
 * - DAILY_RATE (recommended via functions config):
 *     firebase functions:config:set app.daily_rate=18000
 *   Function reads functions.config().app.daily_rate, then process.env.DAILY_RATE, then default 15000.
 *
 * BILLING NOTE:
 * Scheduled functions require the Firebase Blaze (pay-as-you-go) plan.
 * Ensure billing is enabled before deployment.
 */

const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp();
const db = admin.firestore();

exports.dailyAdd = functions.pubsub
  .schedule('every day 10:30')
  .timeZone('Europe/Moscow')
  .onRun(async (context) => {
    try {
      console.log('dailyAdd started at', new Date().toISOString());

      const DAILY_RATE = Number(functions.config().app && functions.config().app.daily_rate) || Number(process.env.DAILY_RATE) || 15000;
      console.log('Using DAILY_RATE:', DAILY_RATE);

      const today = new Date().toISOString().split('T')[0];
      console.log('Processing date:', today);

      const balanceDocRef = db.collection('salaryData').doc('balance');
      const entriesRef = balanceDocRef.collection('entries');

      // Если запись за сегодня уже есть — пропускаем
      const existingEntryQuery = await entriesRef.where('dateString', '==', today).limit(1).get();
      if (!existingEntryQuery.empty) {
        console.log('Entry for today already exists, skipping');
        return null;
      }

      // Транзакция: атомарно обновляем баланс и счётчики, создаём запись истории
      await db.runTransaction(async (transaction) => {
        const balanceDoc = await transaction.get(balanceDocRef);

        if (balanceDoc.exists) {
          // Если документ уже есть — инкрементируем поля
          transaction.update(balanceDocRef, {
            balance: admin.firestore.FieldValue.increment(DAILY_RATE),
            paid: admin.firestore.FieldValue.increment(DAILY_RATE),       // «выплачено»
            daysCount: admin.firestore.FieldValue.increment(1)            // «число» — сколько раз начисляли
          });
        } else {
          // Если документа нет — создаём начальные поля
          transaction.set(balanceDocRef, {
            balance: DAILY_RATE,
            paid: DAILY_RATE,
            daysCount: 1
          }, { merge: true });
        }

        // Создаём запись в истории (entries)
        const newEntryRef = entriesRef.doc();
        transaction.set(newEntryRef, {
          serverCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
          dateString: today,
          amount: DAILY_RATE,
          source: 'automatic',
          service: 'cron'
        });

        console.log('Prepared transaction: increment balance, paid, daysCount and create entry');
      });

      console.log('dailyAdd completed successfully for', today);
      return null;
    } catch (error) {
      console.error('Error in dailyAdd:', error);
      throw error;
    }
  });
