# Salary Tracker Firebase Cloud Functions

This directory contains Firebase Cloud Functions for the Salary Tracker application.

## Functions

### dailyAdd

A scheduled Cloud Function that runs daily at 00:05 Moscow time to automatically add the daily rate to the salary balance.

**Features:**
- **Atomic Operations**: Uses Firestore transactions to ensure balance and entry are updated together
- **Idempotent**: Checks if an entry for today already exists before adding (prevents duplicates)
- **Configurable**: Uses `DAILY_RATE` environment variable (defaults to 15000)
- **Timezone**: Scheduled for Europe/Moscow timezone

**Entry Structure:**
```javascript
{
  serverCreatedAt: serverTimestamp(),
  dateString: 'YYYY-MM-DD',
  amount: 15000,
  source: 'automatic',
  service: 'cron'
}
```

## Setup

### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project configured
- Node.js 18 or later

### Installation

1. Navigate to the functions directory:
```bash
cd functions
```

2. Install dependencies:
```bash
npm install
```

### Deployment

Deploy only the dailyAdd function:
```bash
firebase deploy --only functions:dailyAdd
```

Deploy all functions:
```bash
firebase deploy --only functions
```

### Configuration

Set the DAILY_RATE environment variable (optional):
```bash
firebase functions:config:set daily.rate="20000"
firebase deploy --only functions:dailyAdd
```

Or use environment variables in Firebase Console:
1. Go to Firebase Console > Functions
2. Select your function
3. Add environment variable: `DAILY_RATE=20000`

### Local Testing

Run functions locally with Firebase Emulator:
```bash
npm run serve
```

### Monitoring

View function logs:
```bash
firebase functions:log
```

Or view in Firebase Console > Functions > Logs

## Development

### Code Style
This project uses ESLint with Google style configuration.

Run linter:
```bash
npm run lint
```

### Function Triggers

The `dailyAdd` function uses a Pub/Sub schedule trigger:
- **Schedule**: `every day 00:05`
- **Timezone**: `Europe/Moscow`

### Testing Schedule

To test the function manually without waiting for the schedule:
1. Go to Firebase Console > Functions
2. Find the `dailyAdd` function
3. Click "Test function" or use the Firebase CLI to call it

## Security

- Uses Firebase Admin SDK with elevated privileges
- Ensure proper IAM roles are configured for the service account
- Environment variables are stored securely in Firebase

## Troubleshooting

**Function not triggering:**
- Check Cloud Scheduler in Google Cloud Console
- Verify timezone is correct
- Check function logs for errors

**Duplicate entries:**
- Function is idempotent and checks for existing entries
- If duplicates occur, check the dateString query logic

**Permission errors:**
- Ensure Firebase Admin SDK has proper permissions
- Check service account roles in IAM

## Files

- `index.js` - Main function implementations
- `package.json` - Dependencies and scripts
- `.gitignore` - Excluded files (node_modules, etc.)
