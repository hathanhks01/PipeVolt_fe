import http from '../common/http-common';

const AuthService = {
  login: async (credentials) => {
    try {
      const response = await http.post('/Auth/Login', credentials, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.data.success) {
        sessionStorage.setItem('authToken', response.data.token);
        sessionStorage.setItem('username', JSON.stringify(response.data.username)); // nếu có
      }
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error.response?.data || { success: false, message: 'Login failed' };
    }
  },

  register: async (registerData) => {
    try {
      const response = await http.post('/Auth/Register', registerData, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error.response?.data || { success: false, message: 'Registration failed' };
    }
  },

  logout: async (username) => {
    try {
      await http.post(`/Auth/Logout?username=${(username)}`, null, {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('username');
    }
  },

  getCurrentusername: () => {
    const username = sessionStorage.getItem('username');
    return username ? JSON.parse(username) : null;
  },

  isAuthenticated: () => {
    return !!sessionStorage.getItem('authToken');
  },

  getToken: () => {
    return sessionStorage.getItem('authToken');
  },
};

export default AuthService;
