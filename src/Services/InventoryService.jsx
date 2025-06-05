
import http from '../common/http-common';

const InventoryService = {
  // Lấy tất cả bản ghi tồn kho
  getAllInventories: async () => {
    try {
      const response = await http.get('Inventories/GetList');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventories:', error);
      throw error;
    }
  },
  // Lấy danh sách sản phẩm tồn kho theo mã kho hàng
getInventoriesByWarehouseCode: async (warehouseCode) => {
  try {
    const response = await http.get(`Inventories/warehouse/code/${warehouseCode}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching inventories for warehouse code ${warehouseCode}:`, error);
    throw error;
  }
},

  // Lấy bản ghi tồn kho theo ID
  getInventoryById: async (id) => {
    try {
      const response = await http.get(`Inventories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching inventory with ID ${id}:`, error);
      throw error;
    }
  },
 receiveFromPurchaseOrder: async (warehouseCode, purchaseOrderId) => {
  try {
    const response = await http.post('Inventories/ReceiveFromPurchaseOrder', {
      warehouseCode,
      purchaseOrderId,
    });
    return response.data;
  } catch (error) {
    console.error('Error receiving from purchase order:', error);
    throw error;
  }
},

  // Tạo bản ghi tồn kho mới
  createInventory: async (inventoryData) => {
    try {
      const response = await http.post('Inventories', inventoryData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating inventory:', error);
      throw error;
    }
  },

  // Cập nhật bản ghi tồn kho
  updateInventory: async (inventoryData) => {
    try {
      const response = await http.put(`Inventories/${inventoryData.inventoryId}`, inventoryData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating inventory with ID ${inventoryData.inventoryId}:`, error);
      throw error;
    }
  },

  // Xóa bản ghi tồn kho
  deleteInventory: async (id) => {
    try {
      const response = await http.delete(`Inventories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting inventory with ID ${id}:`, error);
      throw error;
    }
  },
};

export default InventoryService;
