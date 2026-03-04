
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export function getAccessToken(): string | null {
  return accessTokenGetter ? accessTokenGetter() : null;
}

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

let isRefreshing = false;
let failedRequestsQueue: QueuedRequest[] = [];

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
