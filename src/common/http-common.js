import axios from 'axios';

const http = axios.create({
  baseURL: 'http://localhost:3030/api',
  //baseURL: 'https://worrisome-abdominal-barrier.ngrok-free.dev/api',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',   // ← thêm dòng này
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