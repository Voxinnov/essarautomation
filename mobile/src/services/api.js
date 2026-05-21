import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Set your computer's IP address here if running on a physical device or Android emulator.
// Alternatively, use an environment variable.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://essaram.bvox.in/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
