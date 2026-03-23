import admin from 'firebase-admin';

const serviceAccount = {
  type: 'service_account',
  project_id: 'sethtodo-a6ea4',
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  client_email: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk@sethtodo-a6ea4.iam.gserviceaccount.com',
  client_id: process.env.FIREBASE_CLIENT_ID || '',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk@sethtodo-a6ea4.iam.gserviceaccount.com'
};

let initialized = false;

const initFirebase = () => {
  if (!initialized) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      initialized = true;
    } catch (error) {
      console.error('Firebase init error:', error);
    }
  }
};

export const verifyToken = async (req, res, next) => {
  initFirebase();
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified
    };
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default admin;
