import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

function adminApp() {
  const existing = getApps().find(a => a.name === 'admin');
  if (existing) return existing;
  return initializeApp(
    {
      credential: cert({
        projectId:   process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey:  (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
      }),
    },
    'admin'
  );
}

// These are functions — only called at runtime inside route handlers, never at build time
export const adminDb   = () => getFirestore(adminApp());
export const adminAuth = () => getAuth(adminApp());
