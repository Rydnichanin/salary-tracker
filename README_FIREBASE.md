# Firebase Integration for Salary Tracker

This document describes the Firebase integration added to the Salary Tracker application.

## Overview

The application now uses Firebase for:
- **Authentication**: Google Sign-In for user authentication
- **Firestore**: Cloud database to store user transactions
- **Hosting**: Deploy the application to Firebase Hosting

## Firebase Configuration

The Firebase project configuration is set up with:
- **Project ID**: `gold-11fa4`
- **Auth Domain**: `gold-11fa4.firebaseapp.com`

## Features

### 1. Authentication (Google Sign-In)

Users can sign in with their Google account to sync their salary transaction data across devices.

**Key Functions:**
- `signInWithGoogle()`: Opens Google Sign-In popup
- `signOut()`: Signs the user out
- `auth.onAuthStateChanged()`: Monitors authentication state changes

### 2. Firestore Database

When authenticated, transactions are stored in Firestore under the user's collection:
- Path: `/users/{userId}/transactions/{transactionId}`
- Each transaction contains: `date` and `amount`

**Key Functions:**
- `loadTransactionsFromFirestore()`: Loads user's transactions from Firestore
- `saveTransactionToFirestore()`: Saves a transaction to Firestore
- `deleteTransactionFromFirestore()`: Deletes a transaction from Firestore

### 3. Local Storage Fallback

When not signed in, the application continues to use LocalStorage for data persistence, ensuring offline functionality.

## Setup Instructions

### Prerequisites

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

### Deployment

To deploy the application to Firebase Hosting:

```bash
firebase deploy
```

Or deploy only hosting:
```bash
firebase deploy --only hosting
```

### Firestore Security Rules

Add these security rules in the Firebase Console to protect user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/transactions/{transactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Authentication Setup

1. Go to Firebase Console → Authentication
2. Enable Google Sign-In provider
3. Add authorized domains for your hosting

## File Structure

```
.
├── index.html          # Main application with Firebase integration
├── firebase.json       # Firebase Hosting configuration
├── .firebaserc        # Firebase project configuration
└── README_FIREBASE.md # This file
```

## Firebase Configuration Files

### firebase.json

Configures Firebase Hosting:
- Sets `./` as the public directory
- Ignores unnecessary files
- Redirects all routes to index.html

### .firebaserc

Specifies the default Firebase project ID (`gold-11fa4`)

## Usage

1. **Without Authentication**: Use the app as before with LocalStorage
2. **With Authentication**: 
   - Click "Sign in with Google"
   - All transactions will sync to Firestore
   - Access your data from any device

## Data Migration

When a user signs in for the first time, their LocalStorage data is not automatically migrated. To implement migration:

1. After successful sign-in, check for LocalStorage data
2. Upload existing transactions to Firestore
3. Clear LocalStorage once migration is complete

## Troubleshooting

### Authentication Issues
- Ensure your domain is authorized in Firebase Console
- Check that the Google Sign-In provider is enabled
- Verify the Firebase configuration values are correct

### Firestore Issues
- Check Firestore security rules
- Verify the user is authenticated
- Check browser console for error messages

## API Keys Security

The Firebase API keys in the configuration are safe to expose publicly as they are meant for client-side use. Security is enforced through:
- Firebase Security Rules
- Authentication requirements
- Domain restrictions (configured in Firebase Console)

## Next Steps

Consider adding:
- Email/password authentication
- Data export functionality
- Offline data sync improvements
- Real-time updates using Firestore listeners
