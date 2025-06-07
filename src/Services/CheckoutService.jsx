import http from '../common/http-common';

const CheckoutService = {
  // Thanh toán toàn bộ giỏ hàng
  checkoutFull: async (customerId, paymentMethodId) => {
    const response = await http.post(`/Checkout/${customerId}`, paymentMethodId, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  // Thanh toán các sản phẩm được chọn trong giỏ hàng
  checkoutPartial: async (customerId, paymentMethodId, cartItemIds) => {
    const body = {
      paymentMethodId,
      cartItemIds
    };
    const response = await http.post(`/Checkout/${customerId}/partial`, body, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }
};

export default CheckoutService;