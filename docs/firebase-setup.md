# Firebase Setup And Cost Guardrails

This project can run in two modes:

- Demo local mode: no `.env` file, no Firebase usage, no cloud cost.
- Firebase mode: Firestore stores pools, bets, payment status, and results.

## Cost Guardrails

Before deploying this app with real users:

1. Use a separate Firebase project for this bolão, not the buffet/CRM project.
2. Create a Google Cloud budget alert before deploying. Budget alerts are only warnings, not hard caps.
3. Check Firestore, Auth, and Hosting usage after every test event.
4. Keep Pix receipts outside the app for now, sent through WhatsApp.
5. Do not enable Firebase Storage unless there is a new explicit decision and a billing review.

## Firebase Console Checklist

1. Create a new Firebase project dedicated to the bolão.
2. Add a Web app and copy the config values into `.env`.
3. Enable Authentication and turn on Anonymous sign-in.
4. Enable Firestore.
5. Do not enable Cloud Storage for this version.
6. Deploy `firestore.rules`.
7. Create an admin document at `admins/{yourAuthUid}` before using organizer actions in Firebase mode.

## Local Environment

Copy `.env.example` to `.env` and fill:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

Run:

```bash
npm install
npm run dev
```

## Deploy

Build first:

```bash
npm run build
```

Then deploy with Firebase CLI:

```bash
firebase deploy
```

Do not add Storage/upload features until billing and budget alerts are reviewed again.
