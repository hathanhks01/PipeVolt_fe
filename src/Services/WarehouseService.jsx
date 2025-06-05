import http from '../common/http-common';

const WarehouseService = {
  // Tạo kho hàng mới
  createWarehouse: async (warehouseData) => {
    try {
      const response = await http.post('Warehouses', warehouseData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating warehouse:', error);
      throw error;
    }
  },

  // Cập nhật kho hàng
  updateWarehouse: async (id, warehouseData) => {
    try {
      const response = await http.put(`Warehouses/${id}`, warehouseData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating warehouse with ID ${id}:`, error);
      throw error;
    }
  },

  // Lấy tất cả kho hàng
  getAllWarehouses: async () => {
    try {
      const response = await http.get('Warehouses/GetList');
      return response;
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      throw error;
    }
  },

  // Lấy kho hàng theo ID
  getWarehouseById: async (id) => {
    try {
      const response = await http.get(`Warehouses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching warehouse with ID ${id}:`, error);
      throw error;
    }
  },

  // Xóa kho hàng
  deleteWarehouse: async (id) => {
    try {
      const response = await http.delete(`Warehouses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting warehouse with ID ${id}:`, error);
      throw error;
    }
  }
};

export default WarehouseService;