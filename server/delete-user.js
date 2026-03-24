import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const email = 'seth.chen@outlook.com';

async function deleteUser() {
  try {
    console.log(`Searching for user: ${email}`);
    
    const user = await admin.auth().getUserByEmail(email);
    console.log(`Found user: ${user.uid} (${user.email})`);
    
    await admin.auth().deleteUser(user.uid);
    console.log(`Successfully deleted user: ${user.uid}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === 'auth/user-not-found') {
      console.log('User not found in Firebase Auth');
    }
    process.exit(1);
  }
}

deleteUser();
