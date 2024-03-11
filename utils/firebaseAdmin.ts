import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../firebase-service.json')),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export const db = admin.firestore();