const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Scheduled Cloud Function that runs daily at 00:05 Moscow time.
 * Atomically adds DAILY_RATE to salaryData/balance and creates an entry.
 * Idempotent: skips if an entry for today already exists.
 */
exports.dailyAdd = functions
    .pubsub
    .schedule("every day 00:05")
    .timeZone("Europe/Moscow")
    .onRun(async (context) => {
      const db = admin.firestore();
      
      // Get DAILY_RATE from environment variable or use default
      const DAILY_RATE = parseInt(process.env.DAILY_RATE || "15000", 10);
      
      // Get today's date string in YYYY-MM-DD format
      const today = new Date();
      const dateString = today.toISOString().split("T")[0];
      
      console.log(`dailyAdd triggered for ${dateString}, DAILY_RATE: ${DAILY_RATE}`);
      
      const balanceDocRef = db.doc("salaryData/balance");
      const entriesColRef = balanceDocRef.collection("entries");
      
      try {
        // Use transaction for atomicity
        await db.runTransaction(async (transaction) => {
          // Check if an entry for today already exists (idempotent check)
          const existingEntriesQuery = entriesColRef
              .where("dateString", "==", dateString)
              .limit(1);
          
          const existingEntriesSnapshot = await transaction.get(existingEntriesQuery);
          
          if (!existingEntriesSnapshot.empty) {
            console.log(`Entry for ${dateString} already exists, skipping.`);
            return; // Skip if entry exists
          }
          
          // Read current balance
          const balanceDoc = await transaction.get(balanceDocRef);
          let currentBalance = 0;
          
          if (balanceDoc.exists) {
            const data = balanceDoc.data();
            currentBalance = typeof data.balance === "number" ? 
              data.balance : 0;
          }
          
          // Calculate new balance
          const newBalance = currentBalance + DAILY_RATE;
          
          // Update balance
          transaction.set(balanceDocRef, {
            balance: newBalance,
          }, {merge: true});
          
          // Create new entry
          const newEntryRef = entriesColRef.doc();
          transaction.set(newEntryRef, {
            serverCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
            dateString: dateString,
            amount: DAILY_RATE,
            source: "automatic",
            service: "cron",
          });
          
          console.log(`Successfully added ${DAILY_RATE} to balance. ` +
            `New balance: ${newBalance}`);
        });
        
        return null;
      } catch (error) {
        console.error("Error in dailyAdd function:", error);
        throw error;
      }
    });
