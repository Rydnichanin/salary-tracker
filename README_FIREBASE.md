# Firebase integration — Salary Tracker

This repository is a static single-file web app. The PR adds Firebase integration examples for Hosting, Authentication (Google) and Firestore.

Steps to finish setup:

1. Create a Firebase project at https://console.firebase.google.com/
2. In Project settings -> General -> Your apps, register a Web app and copy the config (apiKey, authDomain, projectId, etc.).
3. Replace placeholders in index.html firebaseConfig with your real values.
4. Install Firebase CLI locally: `npm i -g firebase-tools` and login: `firebase login`.
5. Initialize (optional) and deploy: `firebase init hosting` (choose existing project) then `firebase deploy`.

Security notes:
- Configure Firestore rules to allow only authenticated users to write/read their own records, e.g.:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /salaries/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}
```
