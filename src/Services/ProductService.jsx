import http from '../common/http-common';

const ProductService = {
  // Tạo sản phẩm mới
  createProduct: async (formData) => {
    const response = await http.post('Products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Cập nhật sản phẩm
  updateProduct: async (id, formData) => {
    const response = await http.put(`Products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getProductsByCategory: async (categoryId) => {
    try {
      const response = await http.get('Products', {
        params: { categoryId }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching products by categoryId ${categoryId}:`, error);
      throw error;
    }
  },
  // Lấy tất cả sản phẩm
  getAllProducts: async () => {
    try {
      const response = await http.get('Products/GetList');
      return response;
    } catch (error) {
      console.error('Error fetching Products:', error);
      throw error;
    }
  },
  GetPopularList: async () => {
    try {
      const response = await http.get('Products/GetPopularList');
      return response;
    } catch (error) {
      console.error('Error fetching Products:', error);
      throw error;
    }
  },
  // Lấy sản phẩm theo ID
  getProductById: async (id) => {
    try {
      const response = await http.get(`Products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching Product with ID ${id}:`, error);
      throw error;
    }
  },

  // Xóa sản phẩm
  deleteProduct: async (id) => {
    try {
      const response = await http.delete(`Products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting Product with ID ${id}:`, error);
      throw error;
    }
  },

  // Tìm kiếm sản phẩm theo từ khóa (tên sản phẩm, danh mục, brand)
  searchProducts: async (keyword) => {
    try {
      const response = await http.get('Products/searchTemp', {
        params: { keyword }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },
};

export default ProductService;