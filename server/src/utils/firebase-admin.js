import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) return;

  try {
    const serviceAccount = JSON.parse(
      readFileSync(join(__dirname, '../../serviceAccountKey.json'), 'utf8')
    );

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