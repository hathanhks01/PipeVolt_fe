import http from '../common/http-common';

const ChatbotService = {
  /**
   * Gửi tin nhắn tới chatbot và nhận phản hồi
   * @param {Object} request - { chatRoomId, message, senderId, senderType }
   */
  sendMessage: async (request) => {
    const res = await http.post('Chatbot/send-message', request);
    return res.data;
  },

  /**
   * Tư vấn sản phẩm dựa trên yêu cầu của khách hàng
   * @param {Object} request - { query, customerId }
   */
  getProductRecommendation: async (request) => {
    const res = await http.post('Chatbot/product-recommendation', request);
    return res.data;
  },

  /**
   * Kiểm tra trạng thái hoạt động của chatbot
   */
  healthCheck: async () => {
    const res = await http.get('Chatbot/health-check');
    return res.data;
  }
};

export default ChatbotService;
