import fs from 'node:fs';
import path from 'node:path';
import admin from 'firebase-admin';
import { env } from './env.js';

let firebaseDatabase = null;
let firebaseInitAttempted = false;

const parseServiceAccountJson = (rawJson) => {
  if (!rawJson) {
    return null;
  }

  const parsed = JSON.parse(rawJson);

  if (parsed.private_key) {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  }

  return parsed;
};

const readServiceAccount = () => {
  if (env.firebase.serviceAccountJson) {
    return parseServiceAccountJson(env.firebase.serviceAccountJson);
  }

  if (!env.firebase.serviceAccountPath) {
    return null;
  }

  const credentialPath = path.isAbsolute(env.firebase.serviceAccountPath)
    ? env.firebase.serviceAccountPath
    : path.resolve(process.cwd(), env.firebase.serviceAccountPath);

  return parseServiceAccountJson(fs.readFileSync(credentialPath, 'utf8'));
};

export const getFirebaseDatabase = () => {
  if (firebaseDatabase || firebaseInitAttempted) {
    return firebaseDatabase;
  }

  firebaseInitAttempted = true;

  if (!env.firebase.databaseURL) {
    return null;
  }

  try {
    const serviceAccount = readServiceAccount();

    if (!admin.apps.length) {
      admin.initializeApp({
        ...(serviceAccount ? { credential: admin.credential.cert(serviceAccount) } : {}),
        databaseURL: env.firebase.databaseURL,
      });
    }

    firebaseDatabase = admin.database();
    return firebaseDatabase;
  } catch (error) {
    console.error('Firebase admin initialization failed:', error.message);
    return null;
  }
};

export const firebaseServerTimestamp = () => admin.database.ServerValue.TIMESTAMP;
