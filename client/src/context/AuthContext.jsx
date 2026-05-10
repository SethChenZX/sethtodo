import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth as firebaseAuth, app as firebaseApp } from '../firebase';
import { userApi } from '../utils/userApi';

const AuthContext = createContext();

const SESSION_KEY = 'dodo_todo_session';
const LOCAL_KEY = 'dodo_todo_user';

const withTimeout = (promise, ms, fallbackValue) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      console.warn(`[AuthContext] Operation timed out after ${ms}ms, using fallback`);
      resolve(fallbackValue);
    }, ms);
    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

const loadUserFromStorage = () => {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(LOCAL_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.token) {
        localStorage.setItem('firebase_token', data.token);
      }
      if (data.uid && data.email) {
        return {
          uid: data.uid,
          email: data.email,
          displayName: data.displayName || data.email.split('@')[0],
          role: data.role,
          token: data.token,
          getIdToken: async () => {
            const tokenPromise = (async () => {
              try {
                const { getAuth } = await import('firebase/auth');
                const auth = getAuth(firebaseApp);
                if (auth.currentUser) {
                  return await auth.currentUser.getIdToken();
                }
              } catch (e) {
                console.error('getIdToken error:', e);
              }
              return data.token;
            })();
            try {
              return await withTimeout(tokenPromise, 10000, data.token);
            } catch (e) {
              return data.token;
            }
          }
        };
      }
    }
  } catch (e) {
    console.error('Auth init error:', e);
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LOCAL_KEY);
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const cachedUser = loadUserFromStorage();
  const [user, setUser] = useState(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);
  const isLoggingInRef = useRef(false);

  useEffect(() => {
    if (user) {
      const plainUser = { ...user };
      delete plainUser.getIdToken;
      const serialized = JSON.stringify(plainUser);
      sessionStorage.setItem(SESSION_KEY, serialized);
      localStorage.setItem(LOCAL_KEY, serialized);
      if (user.token) {
        localStorage.setItem('firebase_token', user.token);
      }
    } else {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(LOCAL_KEY);
      localStorage.removeItem('firebase_token');
    }
  }, [user]);

  useEffect(() => {
    console.log('[AuthContext] AuthProvider mounted, cachedUser:', cachedUser ? 'exists' : 'none');
    let resolved = false;

    // キャッシュユーザーがあれば即座に表示し、バックグラウンドで検証
    if (cachedUser) {
      console.log('[AuthContext] Using cached user immediately');
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      resolved = true;
      console.log('[AuthContext] onAuthStateChanged fired:', firebaseUser ? 'user exists' : 'no user');
      try {
        if (firebaseUser) {
          const token = await withTimeout(
            firebaseUser.getIdToken(),
            30000,
            localStorage.getItem('firebase_token')
          );
          if (token) {
            localStorage.setItem('firebase_token', token);
          }

          const name = firebaseUser.displayName || firebaseUser.email.split('@')[0];

          let result;
          try {
            result = await withTimeout(
              userApi.verify(firebaseUser.uid, firebaseUser.email, null, name),
              60000,
              null
            );
          } catch (verifyErr) {
            console.warn('userApi.verify failed:', verifyErr);
            result = null;
          }

          if (!result) {
            const saved = localStorage.getItem(LOCAL_KEY);
            const savedData = saved ? JSON.parse(saved) : null;
            result = {
              user: {
                name: savedData?.displayName || name,
                role: savedData?.role ?? null
              }
            };
          }

          const dbUser = result.user;

          const finalUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: dbUser?.name || firebaseUser.displayName || firebaseUser.email.split('@')[0],
            role: dbUser?.role ?? null,
            token: token || localStorage.getItem('firebase_token'),
            getIdToken: () => firebaseUser.getIdToken()
          };
          setUser(finalUser);
        } else {
          if (isLoggingInRef.current) {
            console.log('[AuthContext] Ignoring no-user event during login flow');
          } else {
            setUser(null);
            localStorage.removeItem('firebase_token');
          }
        }
      } catch (error) {
        console.error('Auth state error:', error);
        const saved = localStorage.getItem(LOCAL_KEY);
        if (saved) {
          try {
            const data = JSON.parse(saved);
            if (data.uid && data.email) {
              setUser({
                ...data,
                getIdToken: async () => {
                  try {
                    const { getAuth } = await import('firebase/auth');
                    const auth = getAuth(firebaseApp);
                    if (auth.currentUser) {
                      return await auth.currentUser.getIdToken();
                    }
                  } catch (e) {
                    console.error('getIdToken error:', e);
                  }
                  return data.token;
                }
              });
            } else {
              setUser(null);
            }
          } catch (e) {
            console.error('Fallback parse error:', e);
            setUser(null);
          }
        } else {
          setUser(null);
          localStorage.removeItem('firebase_token');
        }
      } finally {
        console.log('[AuthContext] Setting loading=false (onAuthStateChanged finally)');
        setLoading(false);
      }
    });

    const fallbackTimer = setTimeout(() => {
      console.log('[AuthContext] Unconditional fallback timer fired');
      if (!resolved) {
        console.warn('[AuthContext] onAuthStateChanged never fired, using cached user');
        const saved = localStorage.getItem(LOCAL_KEY) || sessionStorage.getItem(SESSION_KEY);
        if (saved) {
          try {
            const data = JSON.parse(saved);
            if (data.uid && data.email) {
              setUser({
                ...data,
                getIdToken: async () => {
                  try {
                    const { getAuth } = await import('firebase/auth');
                    const auth = getAuth(firebaseApp);
                    if (auth.currentUser) {
                      return await auth.currentUser.getIdToken();
                    }
                  } catch (e) {
                    console.error('getIdToken error:', e);
                  }
                  return data.token;
                }
              });
            }
          } catch (e) {
            console.error('Fallback parse error:', e);
          }
        }
      }
      setLoading(false);
    }, 3000);

    return () => {
      clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, []);

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
    isLoggingInRef.current = true;
    try {
      return await loginWithFirebase(firebaseUser);
    } finally {
      isLoggingInRef.current = false;
    }
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
