import axios from 'axios';
import { getToken } from '@/contexts/AuthContext';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,  
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const access = getToken();
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let setTokenCallback: ((token: string | null) => void) | null = null;

export function setTokenSetter(setter: (token: string | null) => void) {
  setTokenCallback = setter;
}

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axiosInstance.post("/auth/token/refresh/");
        const access = refreshResponse.data.access;

        if (setTokenCallback) {
          setTokenCallback(access);
        }
        
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        if (setTokenCallback) {
          setTokenCallback(null);
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
