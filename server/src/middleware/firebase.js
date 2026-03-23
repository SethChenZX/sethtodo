import fetch from 'node-fetch';

const FIREBASE_PROJECT_ID = 'sethtodo-a6ea4';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyAfgtkSBb5KAY8axcu7xB_jp1x3PFYOWGs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token })
    });
    
    const data = await response.json();
    
    if (data.error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (!data.users || data.users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = {
      uid: data.users[0].localId,
      email: data.users[0].email
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
