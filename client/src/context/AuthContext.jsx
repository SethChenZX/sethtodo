import { createContext, useContext, useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth as firebaseAuth } from '../firebase';
import { userApi } from '../utils/userApi';

const AuthContext = createContext();

const SESSION_KEY = 'dodo_todo_session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setUser(data);
        if (data.token) {
          localStorage.setItem('firebase_token', data.token);
        }
      } catch (e) {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
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

  const loginWithFirebase = async (firebaseUser) => {
    setLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      localStorage.setItem('firebase_token', token);

      console.log('Calling userApi.verify...');
      const result = await userApi.verify(firebaseUser.uid, firebaseUser.email);
      console.log('verify result:', result);
      console.log('dbUser.role:', result.user?.role);
      console.log('dbUser:', JSON.stringify(result.user));
      
      const dbUser = result.user;

      const finalUser = { 
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || dbUser?.displayName || firebaseUser.email.split('@')[0],
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
