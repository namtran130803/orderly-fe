import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth.store';
import { clearAllStores } from '@/stores/clearAllStores';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.error?.message;
    if (message) toast.error(message);
    if (error.response?.status === 401) {
      clearAllStores();
    }
    return Promise.reject(error);
  },
);
