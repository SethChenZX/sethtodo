import { createContext, useContext, useState, useEffect } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth as firebaseAuth, app as firebaseApp } from '../firebase';
import { userApi } from '../utils/userApi';

const AuthContext = createContext();

const SESSION_KEY = 'dodo_todo_session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    const initAuth = async () => {
      try {
        const saved = sessionStorage.getItem(SESSION_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          if (data.token) {
            localStorage.setItem('firebase_token', data.token);
          }
          if (data.uid && data.email) {
            try {
              const { getAuth } = await import('firebase/auth');
              const auth = getAuth(firebaseApp);
              return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                  console.log('Auth timeout - clearing session');
                  sessionStorage.removeItem(SESSION_KEY);
                  resolve();
                }, 8000);
                
                onAuthStateChanged(auth, (firebaseUser) => {
                  clearTimeout(timeout);
                  if (firebaseUser && firebaseUser.uid === data.uid) {
                    const finalUser = {
                      uid: firebaseUser.uid,
                      email: firebaseUser.email,
                      displayName: firebaseUser.displayName || data.displayName,
                      role: data.role,
                      token: data.token,
                      getIdToken: () => firebaseUser.getIdToken()
                    };
                    setUser(finalUser);
                  } else {
                    console.log('Firebase user mismatch or null - clearing session');
                    sessionStorage.removeItem(SESSION_KEY);
                  }
                  resolve();
                });
              });
            } catch (authError) {
              console.error('Firebase auth error:', authError);
              sessionStorage.removeItem(SESSION_KEY);
            }
          }
        }
      } catch (e) {
        console.error('Auth init error:', e);
        sessionStorage.removeItem(SESSION_KEY);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      if (user.token) {
        localStorage.setItem('firebase_token', user.token);
      }
    } else {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem('firebase_token');
    }
  }, [user]);

  const loginWithFirebase = async (firebaseUser, providedName = null) => {
    setLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      localStorage.setItem('firebase_token', token);

      const name = providedName || firebaseUser.displayName || firebaseUser.email.split('@')[0];
      
      console.log('Calling userApi.verify with name:', name);
      const result = await userApi.verify(firebaseUser.uid, firebaseUser.email, null, name);
      console.log('verify result:', result);
      
      const dbUser = result.user;

      const finalUser = { 
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: dbUser?.name || firebaseUser.displayName || firebaseUser.email.split('@')[0],
        role: dbUser?.role ?? null,
        token,
        getIdToken: () => firebaseUser.getIdToken()
      };
      setUser(finalUser);
      return finalUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (firebaseUser) => {
    return loginWithFirebase(firebaseUser);
  };

  const updateUserRole = async (role) => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('firebase_token');
      await userApi.updateRole(user.uid, role, token);
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Update role error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(firebaseAuth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
    setUser(null);
    localStorage.removeItem('firebase_token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      loginWithFirebase,
      loginWithGoogle,
      updateUserRole,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
