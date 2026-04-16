import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) return;

  console.log('Initializing Firebase Admin SDK...');
  console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'set' : 'not set');
  console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'set' : 'not set');
  console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'set' : 'not set');

  try {
    let serviceAccount;

    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;

      // Handle both escaped \n and actual newlines
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      } else if (!privateKey.includes('\n') && privateKey.includes('-----BEGIN')) {
        // If it doesn't have newlines but is a PEM, it might be corrupted
        // Try to fix by replacing literal backslash-n
        privateKey = privateKey.replace(/\\n/g, '\n');
      }

      serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: privateKey,
      };
      console.log('Using environment variables for Firebase credentials');
    } else {
      console.log('Environment variables not found, trying serviceAccountKey.json');
      const keyPath = join(__dirname, '../../serviceAccountKey.json');
      try {
        serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
      } catch (e) {
        console.error('Service account key file not found and environment variables not set');
        throw new Error('Firebase Admin SDK cannot be initialized without credentials');
      }
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    firebaseInitialized = true;
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error;
  }
};

export const updateUserPassword = async (email, newPassword) => {
  initializeFirebase();

  try {
    const user = await admin.auth().getUserByEmail(email);

    await admin.auth().updateUser(user.uid, {
      password: newPassword
    });

    console.log(`Password updated successfully for user: ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  initializeFirebase();

  try {
    const user = await admin.auth().getUserByEmail(email);
    return user;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
};

export default admin;