import http from '../common/http-common';

const CustomerService = {
  // Tạo khách hàng mới
  createCustomer: async (customerData) => {
    try {
      const response = await http.post('Customers', customerData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Cập nhật khách hàng
  updateCustomer: async (id, customerData) => {
    try {
      const response = await http.put(`Customers/${id}`, customerData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating customer with ID ${id}:`, error);
      throw error;
    }
  },

  // Lấy tất cả khách hàng
  getAllCustomers: async () => {
    try {
      const response = await http.get('Customers/GetList');
      return response;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Lấy khách hàng theo ID
  getCustomerById: async (id) => {
    try {
      const response = await http.get(`Customers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching customer with ID ${id}:`, error);
      throw error;
    }
  },

  // Xóa khách hàng
  deleteCustomer: async (id) => {
    try {
      const response = await http.delete(`Customers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting customer with ID ${id}:`, error);
      throw error;
    }
  }
};

export default CustomerService;