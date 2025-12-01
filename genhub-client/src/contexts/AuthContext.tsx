/**
 * Authentication Context
 * ======================
 * 
 * SECURITY ARCHITECTURE:
 * 
 * 1. ACCESS TOKEN (Short-lived, ~15 minutes):
 *    - Stored ONLY in React state (memory)
 *    - Never persisted to localStorage/sessionStorage
 *    - Lost on page refresh (this is intentional for security)
 *    - XSS attacks cannot steal it from storage APIs
 * 
 * 2. REFRESH TOKEN (Long-lived, ~7 days):
 *    - Stored in HttpOnly cookie by the Django backend
 *    - NEVER accessible to JavaScript (document.cookie cannot read it)
 *    - Sent automatically by browser with every request (withCredentials: true)
 *    - Used to obtain new access tokens silently
 * 
 * BOOTSTRAP FLOW (on page load/refresh):
 *    1. Try to call /auth/token/refresh/
 *       - Browser automatically sends the HttpOnly refresh token cookie
 *       - If valid, backend returns a new access token
 *    2. If refresh succeeds:
 *       - Store access token in memory
 *       - Fetch user data with the new token
 *    3. If refresh fails (no cookie, expired, invalid):
 *       - User is not authenticated
 *       - Redirect to login
 * 
 * WHY THIS IS SECURE:
 *    - XSS cannot steal refresh token (HttpOnly)
 *    - XSS cannot steal access token from storage (it's only in memory)
 *    - Even if XSS steals access token from memory, it expires quickly
 *    - CSRF is prevented by SameSite cookie attribute + CSRF tokens
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/types/user';
import axiosInstance, { 
  setAccessTokenGetter, 
  setAccessTokenSetter, 
  setLogoutCallback 
} from '@/lib/axios';

interface AuthContextType {
  /** Current authenticated user, null if not authenticated */
  user: User | null;
  /** Access token stored in memory (never persisted) */
  accessToken: string | null;
  /** True if user is authenticated */
  isAuthenticated: boolean;
  /** True during initial auth bootstrap */
  isLoading: boolean;
  /** Login with access token and user data */
  login: (accessToken: string, user: User) => void;
  /** Logout - clears memory and calls backend to clear cookies */
  logout: () => Promise<void>;
  /** Update user data in context */
  updateUser: (userData: Partial<User>) => void;
  /** Refetch user data from backend */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const bootstrapAttempted = useRef(false);
  
  /**
   * Provide axios with a way to read the current access token
   * This bridges React state with the axios interceptors
   */
  useEffect(() => {
    setAccessTokenGetter(() => accessToken);
  }, [accessToken]);

  /**
   * Provide axios with a way to update the access token
   * Used when the interceptor successfully refreshes the token
   */
  useEffect(() => {
    setAccessTokenSetter(setAccessToken);
  }, []);

  /**
   * Provide axios with a logout callback
   * Called when token refresh fails
   */
  useEffect(() => {
    setLogoutCallback(() => {
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
        /**
         * STEP 1: Try to refresh the access token
         * 
         * The HttpOnly refresh token cookie is sent automatically by the browser.
         * We don't send any body - the backend reads the cookie directly.
         * 
         * If the user has a valid session (refresh token cookie exists and is valid),
         * the backend will:
         * 1. Validate the refresh token from the cookie
         * 2. Return a new access token in the response body
         * 3. Optionally rotate the refresh token (set a new cookie)
         */
        const refreshResponse = await axiosInstance.post('/auth/token/refresh/');
        const newAccessToken = refreshResponse.data.access;

        if (!newAccessToken) {
          setUser(null);
          setAccessToken(null);
          return;
        }

        setAccessToken(newAccessToken);

        /**
         * STEP 2: Fetch user data with the new access token
         * 
         * Now that we have a valid access token, we can fetch the user's profile.
         * The axios request interceptor will automatically attach the token.
         */
        try {
          const userResponse = await axiosInstance.get('/auth/user/');
          setUser(userResponse.data);
        } catch (userError) {
          console.error('Failed to fetch user after refresh:', userError);
          setAccessToken(null);
          setUser(null);
        }

      } catch (refreshError) {
        /**
         * Refresh failed - this is expected in these cases:
         * - No refresh token cookie (user never logged in)
         * - Refresh token expired
         * - Refresh token was revoked (user logged out elsewhere)
         * 
         * This is NOT an error condition - just means user needs to login
         */
        setAccessToken(null);
        setUser(null);
        
      } finally {
        setIsLoading(false);
      }
    }

    bootstrapAuth();
  }, []);

  /**
   * Login - called after successful authentication
   * The backend should have already set the HttpOnly refresh token cookie
   */
  const login = useCallback((newAccessToken: string, newUser: User) => {
    setAccessToken(newAccessToken);
    setUser(newUser);
  }, []);

  /**
   * Logout - clear local state and tell backend to clear cookies
   * 
   * The backend /auth/logout/ endpoint should:
   * 1. Invalidate the refresh token
   * 2. Clear the HttpOnly cookie
   */
  const logout = useCallback(async () => {
    try {
      await axiosInstance.post('/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  /**
   * Update user data in context (for profile updates, etc.)
   */
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  }, []);

  /**
   * Refetch user data from backend
   */
  const refreshUser = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      const response = await axiosInstance.get('/auth/user/');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, [accessToken]);

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
