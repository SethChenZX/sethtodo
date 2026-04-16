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

  try {
    let serviceAccount;

    // First, try to use serviceAccountKey.json file (local development)
    const keyPath = join(__dirname, '../../serviceAccountKey.json');
    try {
      serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
      console.log('Using serviceAccountKey.json file');
    } catch (fileError) {
      console.log('serviceAccountKey.json not found, trying environment variables');

      // Second, try environment variables with base64 encoded private key
      const base64Key = process.env.FIREBASE_PRIVATE_KEY_BASE64;
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

      if (base64Key && clientEmail) {
        try {
          const privateKey = Buffer.from(base64Key, 'base64').toString('utf8');
          serviceAccount = {
            type: 'service_account',
            project_id: projectId,
            client_email: clientEmail,
            private_key: privateKey,
          };
          console.log('Using base64 encoded private key from environment');
        } catch (decodeError) {
          console.error('Failed to decode base64 private key:', decodeError);
        }
      }

      // Third, try regular private key with various formats
      if (!serviceAccount) {
        const rawKey = process.env.FIREBASE_PRIVATE_KEY;
        if (rawKey && clientEmail) {
          let privateKey = rawKey;
          if (privateKey.includes('\\n')) {
            privateKey = privateKey.replace(/\\n/g, '\n');
          }
          if (privateKey.includes('-----BEGIN')) {
            serviceAccount = {
              type: 'service_account',
              project_id: projectId,
              client_email: clientEmail,
              private_key: privateKey,
            };
            console.log('Using raw private key from environment');
          }
        }
      }
    }

    if (!serviceAccount) {
      throw new Error('Firebase credentials not available');
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