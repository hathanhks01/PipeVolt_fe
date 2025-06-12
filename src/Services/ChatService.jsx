import http from '../common/http-common';

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

  // Lấy phòng chat của employee
  getChatRoomsForEmployee: async (employeeId) => {
    try {
      const res = await http.get(`Chat/rooms/employee/${employeeId}`);
      return res.data;
    } catch (error) {
      console.error('Error getting employee chat rooms:', error);
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
  },

  // Đánh dấu 1 tin nhắn là đã đọc
  markMessageAsRead: async (messageId) => {
    try {
      const res = await http.put(`Chat/messages/${messageId}/read`);
      return res.data;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  },

  // Đánh dấu tất cả tin nhắn trong phòng là đã đọc cho 1 user
  markAllMessagesAsRead: async (chatRoomId, userId, userType) => {
    try {
      const res = await http.put(`Chat/rooms/${chatRoomId}/read-all?userId=${userId}&userType=${userType}`);
      return res.data;
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      throw error;
    }
  },

  // Lấy số lượng tin nhắn chưa đọc trong phòng chat cho 1 user
  getUnreadMessageCount: async (chatRoomId, userId, userType) => {
    try {
      const res = await http.get(`Chat/rooms/${chatRoomId}/unread-count?userId=${userId}&userType=${userType}`);
      return res.data;
    } catch (error) {
      console.error('Error getting unread message count:', error);
      throw error;
    }
  },

  // Gán nhân viên vào phòng chat
  assignEmployeeToChat: async (chatRoomId, employeeId) => {
    try {
      const res = await http.put(`Chat/rooms/${chatRoomId}/assign`, employeeId, {
        headers: { 'Content-Type': 'application/json' }
      });
      return res.data;
    } catch (error) {
      console.error('Error assigning employee to chat:', error);
      throw error;
    }
  },

  // Đóng phòng chat
  closeChatRoom: async (chatRoomId) => {
    try {
      const res = await http.put(`Chat/rooms/${chatRoomId}/close`);
      return res.data;
    } catch (error) {
      console.error('Error closing chat room:', error);
      throw error;
    }
  },

  // === HELPER FUNCTIONS FOR READ STATUS MANAGEMENT ===

  // Tự động đánh dấu đã đọc khi user vào phòng chat
  enterChatRoom: async (chatRoomId, userId, userType) => {
    try {
      await ChatService.markAllMessagesAsRead(chatRoomId, userId, userType);
    } catch (error) {
      console.error('Error marking messages as read on room enter:', error);
      // Không throw error để không ảnh hưởng đến việc vào phòng chat
    }
  },

  // Lấy trạng thái có tin nhắn mới hay không
  hasUnreadMessages: async (chatRoomId, userId, userType) => {
    try {
      const count = await ChatService.getUnreadMessageCount(chatRoomId, userId, userType);
      return count > 0;
    } catch (error) {
      console.error('Error checking unread messages:', error);
      return false;
    }
  },

  // Batch update read status cho nhiều tin nhắn
  batchMarkMessagesAsRead: async (messageIds) => {
    try {
      const promises = messageIds.map(id => ChatService.markMessageAsRead(id));
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error batch marking messages as read:', error);
    }
  }
};

export default ChatService;