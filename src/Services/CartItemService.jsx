import http from '../common/http-common';

const CartItemService = {
  // 📥 Lấy tất cả cart item theo cartId
  getCartItems: async (cartId) => {
    try {
      const response = await http.get(`CartItem/cart/${cartId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error getting cart items for cart ID ${cartId}:`, error);
      throw error;
    }
  },

  // ➕ Thêm sản phẩm vào giỏ hàng
  addCartItem: async (cartId, itemData) => {
    try {
      const response = await http.post(`CartItem/cart/${cartId}/add`, itemData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Error adding item to cart ID ${cartId}:`, error);
      throw error;
    }
  },

  // ✏️ Cập nhật thông tin cart item
  updateCartItem: async (itemData) => {
    try {
      const response = await http.put(`CartItem`, itemData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating cart item ID ${itemData.cartItemId}:`, error);
      throw error;
    }
  },

  // 🗑️ Xóa cart item theo ID
  deleteCartItem: async (cartItemId) => {
    try {
      const response = await http.delete(`CartItem/${cartItemId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting cart item ID ${cartItemId}:`, error);
      throw error;
    }
  },
};

export default CartItemService;
