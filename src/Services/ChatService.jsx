import http from '../common/http-common'; // dùng đúng instance như BrandService

const ChatService = {
  // Tạo phòng chat (nếu chưa có)
  createChatRoom: async (customerId) => {
    try {
      const res = await http.post('Chat/rooms', { customerId }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return res.data;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  },

  // Lấy phòng chat của customer
  getChatRoomsForCustomer: async (customerId) => {
    try {
      const res = await http.get(`Chat/rooms/customer/${customerId}`);
      return res.data;
    } catch (error) {
      console.error('Error getting customer chat rooms:', error);
      throw error;
    }
  },

  // Lấy tin nhắn trong phòng chat
  getMessages: async (chatRoomId, page = 1, pageSize = 50) => {
    try {
      const res = await http.get(`Chat/rooms/${chatRoomId}/messages?page=${page}&pageSize=${pageSize}`);
      return res.data;
    } catch (error) {
      console.error(`Error getting messages for chat room ${chatRoomId}:`, error);
      throw error;
    }
  },

  // Gửi tin nhắn
  sendMessage: async (messageDto) => {
    try {
      const res = await http.post('Chat/messages', messageDto, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return res.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
};

export default ChatService;
