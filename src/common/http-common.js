import axios from 'axios';

const http = axios.create({
  baseURL: 'http://localhost:3030/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để tự động đính kèm Authorization header nếu có token
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default http;
