# Firebase Integration Guide

This document explains how Firebase is integrated into the Salary Tracker application.

## Firebase Services Used

1. **Firebase Hosting** - Hosts the web application
2. **Firebase Authentication** - Google Sign-In for user authentication
3. **Cloud Firestore** - Stores user transaction data in the cloud

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

1. Deploy to Firebase Hosting:
   ```bash
   firebase deploy
   ```

2. Your app will be available at: `https://gold-11fa4.web.app`

## Firebase Configuration

The Firebase configuration is set up with project ID: `gold-11fa4`

### Firebase Services Configuration

- **Authentication**: Enabled Google Sign-In provider
- **Firestore**: Database rules allow authenticated users to read/write their own data
- **Hosting**: Configured to serve from root directory with SPA rewrites

## Application Features

### Authentication
- Users can sign in with Google
- Sign-out functionality
- User state persistence

### Data Persistence
- Transactions are stored in Firestore under `/users/{userId}/transactions`
- Data syncs across devices
- Real-time updates when data changes

## Security

Firestore security rules ensure:
- Users can only access their own transaction data
- Authentication is required for all database operations
- Data validation on the server side

## Local Development

To test locally:
```bash
firebase serve
```

This will start a local server at `http://localhost:5000`

## Troubleshooting

### Authentication Issues
- Ensure Google Sign-In is enabled in Firebase Console
- Check that authorized domains include your hosting domain

### Firestore Issues
- Verify Firestore is enabled in your Firebase project
- Check security rules in Firebase Console
- Ensure user is authenticated before accessing Firestore

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting)
- [Firebase Auth Guide](https://firebase.google.com/docs/auth)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
