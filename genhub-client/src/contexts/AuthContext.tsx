import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/types/user';
import axiosInstance, { 
  setAccessTokenGetter, 
  setAccessTokenSetter, 
  setLogoutCallback 
} from '@/lib/axios';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const bootstrapAttempted = useRef(false);
  const accessTokenRef = useRef<string | null>(null);
  
  useEffect(() => {
    setAccessTokenGetter(() => accessToken);
  }, [accessToken]);

  useEffect(() => {
    setAccessTokenSetter(setAccessToken);
  }, []);

  useEffect(() => {
    setLogoutCallback(() => {
      accessTokenRef.current = null;
      setAccessToken(null);
      setUser(null);
    });
  }, []);

  useEffect(() => {
    if (bootstrapAttempted.current) return;
    bootstrapAttempted.current = true;

    async function bootstrapAuth() {
      setIsLoading(true);

      try {

        const refreshResponse = await axiosInstance.post('/auth/token/refresh/');
        const newAccessToken = refreshResponse.data.access;

        if (!newAccessToken) {
          accessTokenRef.current = null;
          setUser(null);
          setAccessToken(null);
          return;
        }

        accessTokenRef.current = newAccessToken;
        setAccessToken(newAccessToken);

        try {
          const userResponse = await axiosInstance.get('/auth/user/');
          setUser(userResponse.data);
        } catch (userError) {
          console.error('Failed to fetch user after refresh:', userError);
          accessTokenRef.current = null;
          setAccessToken(null);
          setUser(null);
        }

      } catch (refreshError) {
        accessTokenRef.current = null;
        setAccessToken(null);
        setUser(null);
        
      } finally {
        setIsLoading(false);
      }
    }

    bootstrapAuth();
  }, []);

  const login = useCallback((newAccessToken: string, newUser: User) => {
    accessTokenRef.current = newAccessToken;
    setAccessToken(newAccessToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post('/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      accessTokenRef.current = null;
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
        if (!accessTokenRef.current) return null;

    try {
      const response = await axiosInstance.get('/auth/user/');
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return null;
    }
  }, []);

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    login,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
