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
 * ENVIRONMENT VARIABLES:
 * - DAILY_RATE: The daily accrual amount (default: 15000)
 *   Set via: firebase functions:config:set app.daily_rate=15000
 * 
 * BILLING NOTE:
 * Scheduled functions require the Firebase Blaze (pay-as-you-go) plan.
 * Ensure billing is enabled before deployment.
 */

const admin = require('firebase-admin');
const functions = require('firebase-functions');

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

/**
 * Scheduled Cloud Function: dailyAdd
 * 
 * Runs every day at 00:05 Moscow time (Europe/Moscow timezone)
 * Automatically adds the daily rate to the balance if not already added for today.
 * 
 * Function behavior:
 * 1. Computes today's date as YYYY-MM-DD
 * 2. Checks if an entry for today already exists
 * 3. If no entry exists, uses a transaction to:
 *    - Read the current balance
 *    - Add DAILY_RATE to the balance
 *    - Create a new entry document with source: 'automatic', service: 'cron'
 * 4. Skips if an entry for today already exists (prevents duplicates)
 */
exports.dailyAdd = functions.pubsub
  .schedule('every day 00:05')
  .timeZone('Europe/Moscow')
  .onRun(async (context) => {
    try {
      console.log('dailyAdd function started at', new Date().toISOString());
      
      // Get DAILY_RATE from environment or use default
      const DAILY_RATE = Number(process.env.DAILY_RATE) || 15000;
      console.log('Using DAILY_RATE:', DAILY_RATE);
      
      // Compute today's date as YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      console.log('Processing date:', today);
      
      // Reference to balance document and entries collection
      const balanceDocRef = db.collection('salaryData').doc('balance');
      const entriesRef = balanceDocRef.collection('entries');
      
      // Check if an entry for today already exists
      const existingEntryQuery = await entriesRef
        .where('dateString', '==', today)
        .limit(1)
        .get();
      
      if (!existingEntryQuery.empty) {
        console.log('Entry for today already exists, skipping daily accrual');
        return null;
      }
      
      console.log('No entry found for today, proceeding with daily accrual');
      
      // Use transaction to atomically update balance and create entry
      await db.runTransaction(async (transaction) => {
        // Read current balance
        const balanceDoc = await transaction.get(balanceDocRef);
        let currentBalance = 0;
        
        if (balanceDoc.exists) {
          const data = balanceDoc.data();
          currentBalance = typeof data.balance === 'number' ? data.balance : 0;
        }
        
        console.log('Current balance:', currentBalance);
        
        // Calculate new balance
        const newBalance = currentBalance + DAILY_RATE;
        console.log('New balance will be:', newBalance);
        
        // Update balance
        transaction.set(balanceDocRef, { balance: newBalance }, { merge: true });
        
        // Create new entry document
        const newEntryRef = entriesRef.doc();
        transaction.set(newEntryRef, {
          serverCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
          dateString: today,
          amount: DAILY_RATE,
          source: 'automatic',
          service: 'cron'
        });
        
        console.log('Transaction prepared: balance update and entry creation');
      });
      
      console.log('dailyAdd completed successfully for', today);
      return null;
      
    } catch (error) {
      console.error('Error in dailyAdd function:', error);
      // Re-throw to mark the function execution as failed
      throw error;
    }
  });
