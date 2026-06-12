import axios from 'axios';
import { Url } from '../constants/config';

// Prod (Docker): VITE_API_URL kosong → dùng path tương đối, nginx proxy /api/ → api:8080
// Dev (local): VITE_API_URL chưa set → Url = http://localhost:3030/ → baseURL = http://localhost:3030/api
const baseURL = Url ? `${Url.replace(/\/$/, '')}/api` : '/api';

const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default http;