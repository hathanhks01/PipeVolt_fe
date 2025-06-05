import http from '../common/http-common';

const CartService = {
  // Lấy giỏ hàng của khách hàng theo customerId
  getCart: async (customerId) => {
    try {
      const response = await http.get(`Cart/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Tạo giỏ hàng mới cho khách hàng
  createCart: async (cartData) => {
    try {
      const response = await http.post('Cart', cartData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating cart:', error);
      throw error;
    }
  },

  // Cập nhật thông tin giỏ hàng
  updateCart: async (cartId, cartData) => {
    try {
      const response = await http.put(`Cart/${cartId}`, cartData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  },

  // Xóa giỏ hàng
  deleteCart: async (cartId) => {
    try {
      const response = await http.delete(`Cart/${cartId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting cart:', error);
      throw error;
    }
  },

  // Thêm sản phẩm vào giỏ hàng
  addItemToCart: async (customerId, itemData) => {
    try {
      const response = await http.post(`Cart/${customerId}/items`, itemData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  },

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  updateCartItem: async (customerId, itemData) => {
    try {
      const response = await http.put(`Cart/${customerId}/items`, itemData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeCartItem: async (customerId, cartItemId) => {
    try {
      const response = await http.delete(`Cart/${customerId}/items/${cartItemId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  },

  // Thanh toán giỏ hàng và tạo đơn hàng
  checkout: async (customerId) => {
    try {
      const response = await http.post(`Cart/${customerId}/checkout`);
      return response.data;
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    }
  }
};

export default CartService;