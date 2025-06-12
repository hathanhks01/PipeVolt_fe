// src/services/SalesOrderService.js
import http from '../common/http-common';

const SalesOrderService = {
  // Lấy tất cả đơn hàng
  getAllSalesOrders: async () => {
    try {
      const response = await http.get('SalesOrders/GetList');
      return response.data;
    } catch (error) {
      console.error('Error fetching sales orders:', error);
      throw error;
    }
  },

  // Lấy đơn hàng theo ID
  getSalesOrderById: async (id) => {
    try {
      const response = await http.get(`SalesOrders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sales order with ID ${id}:`, error);
      throw error;
    }
  },

  // Tạo đơn hàng mới
  createSalesOrder: async (orderData) => {
    try {
      const response = await http.post('SalesOrders', orderData, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating sales order:', error);
      throw error;
    }
  },

  // Cập nhật đơn hàng
  updateSalesOrder: async (id, orderData) => {
    try {
      const response = await http.put(`SalesOrders/${id}`, orderData, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating sales order with ID ${id}:`, error);
      throw error;
    }
  },

  // Xoá đơn hàng
  deleteSalesOrder: async (id) => {
    try {
      const response = await http.delete(`SalesOrders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting sales order with ID ${id}:`, error);
      throw error;
    }
  },
  getOrdersByUserId: async (userId) => {
    try {
      const response = await http.get(`SalesOrders/by-user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sales orders by userId ${userId}:`, error);
      throw error;
    }
  },
  // Lấy dữ liệu in hóa đơn theo orderId
  getPrintBill: async (orderId) => {
    try {
      const response = await http.get(`SalesOrders/print-bill/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching print bill for orderId ${orderId}:`, error);
      throw error;
    }
  },
};

export default SalesOrderService;
