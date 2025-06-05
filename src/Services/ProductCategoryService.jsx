import http from '../common/http-common';

const ProductCategoryService = {
  // Tạo danh mục sản phẩm mới
  createCategory: async (formData) => {
    const response = await http.post('ProductCategories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Cập nhật danh mục sản phẩm
  updateCategory: async (id, formData) => {
    const response = await http.put(`ProductCategories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Lấy tất cả danh mục sản phẩm
  getAllCategories: async () => {
    try {
      const response = await http.get('ProductCategories/GetList');
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Lấy danh mục sản phẩm theo ID
  getCategoryById: async (id) => {
    try {
      const response = await http.get(`ProductCategories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      throw error;
    }
  },

  // Xóa danh mục sản phẩm
  deleteCategory: async (id) => {
    try {
      const response = await http.delete(`ProductCategories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting category with ID ${id}:`, error);
      throw error;
    }
  }
};

export default ProductCategoryService;
