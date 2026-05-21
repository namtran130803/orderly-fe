import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth.store';
import { clearAll } from '@/stores/clear';

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
    else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      toast.error('Không kết nối được máy chủ. Kiểm tra mạng hoặc backend đang chạy.');
    }
    if (error.response?.status === 401) {
      clearAll();
    }
    return Promise.reject(error);
  },
);
