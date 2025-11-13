# Firebase Integration for Salary Tracker

This document describes the Firebase integration setup for the Salary Tracker application.

## Features

This application uses the following Firebase services:

- **Firebase Hosting**: Host the application
- **Firebase Authentication**: Google Sign-In for user authentication
- **Cloud Firestore**: Store transaction data in the cloud

## Setup

### Prerequisites

1. Node.js and npm installed
2. Firebase CLI installed: `npm install -g firebase-tools`

### Configuration

The Firebase configuration is already set up in `index.html` with the following project:

- **Project ID**: gold-11fa4

### Deployment

1. Login to Firebase:
   ```bash
   firebase login
   ```

2. Deploy to Firebase Hosting:
   ```bash
   firebase deploy
   ```

3. Your app will be available at: https://gold-11fa4.web.app

## Firebase Services Used

### Authentication

The app uses Google Sign-In for authentication. Users must sign in before they can:
- Add transactions
- View their transaction history
- See their salary balance

### Firestore

Transaction data is stored in Firestore with the following structure:

```
users/{userId}/transactions/{transactionId}
  - date: string (YYYY-MM-DD)
  - amount: number (positive for advances, negative for payments)
  - timestamp: timestamp
```

### Hosting

The app is configured to be hosted on Firebase Hosting with:
- Public directory: `./` (root)
- Single-page app rewrites to `/index.html`
- Ignored files: `firebase.json`, hidden files, `node_modules`

## Security Rules

Make sure to set up appropriate Firestore security rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/transactions/{transaction} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Local Development

To test locally:

```bash
firebase serve
```

Then open http://localhost:5000 in your browser.
