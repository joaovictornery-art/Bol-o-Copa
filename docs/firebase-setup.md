# Firebase Setup And Cost Guardrails

This project can run in two modes:

- Demo local mode: no `.env` file, no Firebase usage, no cloud cost.
- Firebase mode: Firestore stores pools/bets and Storage stores Pix receipts.

## Cost Guardrails

Before enabling Firebase Storage or deploying this app with real users:

1. Use a separate Firebase project for this bolão, not the buffet/CRM project.
2. Review whether Storage requires Blaze billing in your Firebase Console.
3. Create a Google Cloud budget alert before deploying. Budget alerts are only warnings, not hard caps.
4. Keep receipt uploads limited to 2 MB. This is enforced in the UI and in `storage.rules`.
5. Keep accepted receipt types limited to image files and PDF. This is enforced in `storage.rules`.
6. Check Firestore, Storage, Auth, and Hosting usage after every test event.
7. Delete old receipt files after the game if they are no longer needed.

## Firebase Console Checklist

1. Create a new Firebase project dedicated to the bolão.
2. Add a Web app and copy the config values into `.env`.
3. Enable Authentication and turn on Anonymous sign-in.
4. Enable Firestore.
5. Enable Cloud Storage only when you are ready to review billing.
6. Deploy `firestore.rules` and `storage.rules`.
7. Create an admin document at `admins/{yourAuthUid}` before using organizer actions in Firebase mode.

## Local Environment

Copy `.env.example` to `.env` and fill:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
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

Do not deploy Storage for real users until billing and budget alerts are reviewed.
