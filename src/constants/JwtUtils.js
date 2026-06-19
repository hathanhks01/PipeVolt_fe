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

  // Thêm mới — lấy customerId trực tiếp từ token, không cần gọi API
  getCurrentCustomerId() {
    const id = this.getDecodedToken()?.customerId;
    return id ? parseInt(id) : null;
  },

  // Thêm mới — lấy employeeId trực tiếp từ token
  getCurrentEmployeeId() {
    const id = this.getDecodedToken()?.employeeId;
    return id ? parseInt(id) : null;
  },

  isTokenExpired() {
    const decoded = this.getDecodedToken();
    if (!decoded?.exp) return true;
    return decoded.exp < Date.now() / 1000;
  },

  isAuthenticated() {
    return !!this.getToken() && !this.isTokenExpired();
  },

  isCustomer() {
    return String(this.getCurrentUserType()) === '2';
  },

  canAccessCart() {
    return this.isAuthenticated() && !!this.getCurrentCustomerId();
  }
};

export default JwtUtils;