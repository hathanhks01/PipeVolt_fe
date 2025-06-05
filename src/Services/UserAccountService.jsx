import http from '../common/http-common';

const UserAccountService = {
  // Tạo tài khoản mới
  createUserAccount: async (userAccountData) => {
    try {
      const response = await http.post('UserAccount', userAccountData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating user account:', error);
      throw error;
    }
  },

  // Cập nhật tài khoản
  updateUserAccount: async (id, userAccountData) => {
    // Đúng route: useraccounts (không phải UserAccount)
    const response = await http.put(`useraccounts/${id}`, userAccountData, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  getUserAccountByUsername: async (username) => {
    // Đúng route: useraccounts/username/{username}
    const response = await http.get(`useraccounts/username/${username}`);
    return response.data;
  },

  // Lấy tất cả tài khoản
  getAllUserAccounts: async () => {
    try {
      const response = await http.get('UserAccount/GetList');
      return response;
    } catch (error) {
      console.error('Error fetching user accounts:', error);
      throw error;
    }
  },

  // Lấy tài khoản theo ID
  getUserAccountById: async (id) => {
    try {
      const response = await http.get(`UserAccount/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user account with ID ${id}:`, error);
      throw error;
    }
  },

  // Lấy tài khoản theo username
  getUserAccountByUsername: async (username) => {
    try {
      const response = await http.get(`useraccounts/username/${username}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user account with username ${username}:`, error);
      throw error;
    }
  },

  // Xóa tài khoản
  deleteUserAccount: async (id) => {
    try {
      const response = await http.delete(`UserAccount/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user account with ID ${id}:`, error);
      throw error;
    }
  }
};

export default UserAccountService;