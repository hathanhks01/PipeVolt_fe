import { jwtDecode } from 'jwt-decode';

const JwtUtils = {
  getToken() {
    return sessionStorage.getItem('authToken'); 
  },

  getDecodedToken() {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch (err) {
      console.error('Token không hợp lệ:', err);
      return null;
    }
  },

  getCurrentUserId() {
    return this.getDecodedToken()?.sub || null;
  },

  getCurrentUsername() {
    return this.getDecodedToken()?.name || null;
  },

  getCurrentUserType() {
    return this.getDecodedToken()?.userType || null;
  },

  isTokenExpired() {
    const decoded = this.getDecodedToken();
    if (!decoded?.exp) return true;

    const now = Date.now() / 1000; 
    return decoded.exp < now;
  }
};

export default JwtUtils;
