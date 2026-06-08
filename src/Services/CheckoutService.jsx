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
  },

  // Thanh toán tại quầy (POS)
  posCheckout: async ({ items, paymentMethodId, customerInfo, cashierId, discountPercent }) => {
    const body = {
      items,
      paymentMethodId,
      customerInfo,
      cashierId,
      discountPercent
    };
    const response = await http.post('/Checkout/pos', body, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  // Tạo đơn hàng pending cho thanh toán online
  createPendingOrder: async (customerId, paymentMethodId, cartItemIds) => {
    const response = await http.post(`/Checkout/${customerId}/pending`, {
      paymentMethodId,
      cartItemIds
    }, { headers: { 'Content-Type': 'application/json' } });
    return response.data; // { orderId, orderCode, totalAmount }
  },

  // Kiểm tra trạng thái đơn hàng theo orderCode
  checkOrderStatus: async (orderCode) => {
    const response = await http.get(`/SalesOrders/status/${orderCode}`);
    return response.data; // { orderId, orderCode, status, isPaid }
  }
};

export default CheckoutService;