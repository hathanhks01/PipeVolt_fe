  import http from '../common/http-common';

  const BrandService = {
    // Tạo thương hiệu mới
    createBrand: async (brandData) => {
      try {
        const response = await http.post('Brands', brandData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response.data;
      } catch (error) {
        console.error('Error creating brand:', error);
        throw error;
      }
    },

    // Cập nhật thương hiệu
    updateBrand: async (id, brandData) => {
      try {
        const response = await http.put(`Brands/${id}`, brandData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response.data;
      } catch (error) {
        console.error(`Error updating brand with ID ${id}:`, error);
        throw error;
      }
    },

    // Lấy tất cả thương hiệu
    getAllBrands: async () => {
      try {
        const response = await http.get('Brands/GetList');
        return response;
      } catch (error) {
        console.error('Error fetching brands:', error);
        throw error;
      }
    },

    // Lấy thương hiệu theo ID
    getBrandById: async (id) => {
      try {
        const response = await http.get(`Brands/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching brand with ID ${id}:`, error);
        throw error;
      }
    },

    // Xóa thương hiệu
    deleteBrand: async (id) => {
      try {
        const response = await http.delete(`Brands/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error deleting brand with ID ${id}:`, error);
        throw error;
      }
    }
  };

  export default BrandService;