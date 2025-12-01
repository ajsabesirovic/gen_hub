/**
 * Axios Instance with Token Refresh Logic
 * ========================================
 * 
 * SECURITY ARCHITECTURE:
 * - Access token: Stored ONLY in React memory (useState). This prevents XSS attacks
 *   from stealing long-lived tokens since memory is not accessible via document APIs.
 * - Refresh token: Stored in HttpOnly cookie by the backend. This cookie:
 *   - Cannot be read by JavaScript (prevents XSS theft)
 *   - Is sent automatically with every request when `withCredentials: true`
 *   - Should have SameSite=Lax or Strict to prevent CSRF attacks
 * 
 * HOW TOKEN REFRESH WORKS:
 * 1. Every request includes the access token in Authorization header (if available)
 * 2. If a request returns 401 (Unauthorized):
 *    a. We pause all pending requests
 *    b. Call /auth/token/refresh/ - the HttpOnly cookie is sent automatically
 *    c. Backend validates the refresh token from the cookie
 *    d. If valid, backend returns a new access token (and rotates the refresh cookie)
 *    e. We update the in-memory access token and retry all queued requests
 *    f. If refresh fails, user is logged out
 * 
 * RACE CONDITION PREVENTION:
 * - `isRefreshing` flag prevents multiple simultaneous refresh attempts
 * - `failedRequestsQueue` holds requests that failed during refresh
 * - All queued requests are retried/rejected once refresh completes
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * In-memory access token getter/setter
 * These functions allow axios interceptors to access the React state
 * without creating circular dependencies
 */
let accessTokenGetter: (() => string | null) | null = null;
let accessTokenSetter: ((token: string | null) => void) | null = null;
let logoutCallback: (() => void) | null = null;

export function setAccessTokenGetter(getter: () => string | null) {
  accessTokenGetter = getter;
}

export function setAccessTokenSetter(setter: (token: string | null) => void) {
  accessTokenSetter = setter;
}

export function setLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}

/**
 * Get the current access token from React memory
 */
export function getAccessToken(): string | null {
  return accessTokenGetter ? accessTokenGetter() : null;
}

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

let isRefreshing = false;
let failedRequestsQueue: QueuedRequest[] = [];

/**
 * Process all queued requests after refresh completes
 */
function processQueue(error: Error | null, token: string | null = null) {
  failedRequestsQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else if (token) {
      request.resolve(token);
    }
  });
  failedRequestsQueue = [];
}

/**
 * Attach access token to every outgoing request
 * The token is read from React memory (not localStorage/cookies)
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * URLs that should NOT trigger token refresh
 * These are auth-related endpoints that would cause infinite loops
 */
const AUTH_ENDPOINTS = [
  '/auth/token/refresh/',
  '/auth/logout/',
  '/auth/login/',
  '/auth/registration/',
  '/auth/password/reset/',
  '/auth/password/reset/confirm/',
];

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

axiosInstance.interceptors.response.use(
  (response) => response,
  
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (
      !originalRequest ||
      isAuthEndpoint(originalRequest.url) ||
      originalRequest._retry ||
      error.response?.status !== 401
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedRequestsQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const response = await axiosInstance.post('/auth/token/refresh/');
      const newAccessToken = response.data.access;

      if (!newAccessToken) {
        throw new Error('No access token in refresh response');
      }

      if (accessTokenSetter) {
        accessTokenSetter(newAccessToken);
      }

      processQueue(null, newAccessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }
      
      return axiosInstance(originalRequest);
      
    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      
      if (accessTokenSetter) {
        accessTokenSetter(null);
      }
      
      if (logoutCallback) {
        logoutCallback();
      }
      
      return Promise.reject(refreshError);
      
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
