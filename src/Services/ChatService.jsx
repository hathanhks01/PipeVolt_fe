import http from '../common/http-common';

const ChatService = {
  // ── ROOM MANAGEMENT ──────────────────────────────────────────

  /** Tạo hoặc reopen phòng chat cho customer */
  createChatRoom: async (customerId, employeeId = null, roomName = null) => {
    const res = await http.post('Chat/rooms', { customerId, employeeId, roomName });
    return res.data;
  },

  /** Lấy tất cả phòng chat của customer */
  getChatRoomsForCustomer: async (customerId) => {
    const res = await http.get(`Chat/rooms/customer/${customerId}`);
    return res.data;
  },

  /** Lấy tất cả phòng chat của employee */
  getChatRoomsForEmployee: async (employeeId) => {
    const res = await http.get(`Chat/rooms/employee/${employeeId}`);
    return res.data;
  },

  /** Lấy tất cả phòng chat (admin view) */
  getAllChatRooms: async () => {
    const res = await http.get('Chat/rooms');
    return res.data;
  },

  /** Lấy thông tin 1 phòng chat */
  getChatRoomById: async (chatRoomId) => {
    const res = await http.get('Chat/rooms');
    const rooms = res.data || [];
    return rooms.find((r) => r.chatRoomId === chatRoomId) || null;
  },

  /** Gán employee vào phòng chat */
  assignEmployee: async (chatRoomId, employeeId) => {
    const res = await http.put(`Chat/rooms/${chatRoomId}/assign`, employeeId);
    return res.data;
  },

  /** Đóng phòng chat */
  closeChatRoom: async (chatRoomId) => {
    const res = await http.put(`Chat/rooms/${chatRoomId}/close`);
    return res.data;
  },

  // ── MESSAGE MANAGEMENT ───────────────────────────────────────

  /** Lấy tin nhắn trong phòng (phân trang) */
  getMessages: async (chatRoomId, page = 1, pageSize = 50) => {
    const res = await http.get(`Chat/rooms/${chatRoomId}/messages?page=${page}&pageSize=${pageSize}`);
    return res.data;
  },

  /**
   * Gửi tin nhắn
   * @param {Object} messageDto - { chatRoomId, senderId, senderType, messageContent, messageType, attachmentUrl }
   * senderType: 1=Employee, 2=Customer
   */
  sendMessage: async (messageDto) => {
    const res = await http.post('Chat/messages', messageDto);
    return res.data;
  },

  // Đánh dấu 1 tin nhắn là đã đọc
  markMessageAsRead: async (messageId) => {
    const res = await http.put(`Chat/messages/${messageId}/read`);
    return res.data;
  },

  // Đánh dấu tất cả tin nhắn trong phòng đã đọc
  markAllMessagesAsRead: async (chatRoomId, userId, userType) => {
    const res = await http.put(`Chat/rooms/${chatRoomId}/read-all?userId=${userId}&userType=${userType}`);
    return res.data;
  },

  // Lấy số tin nhắn chưa đọc
  getUnreadCount: async (chatRoomId, userId, userType) => {
    const res = await http.get(`Chat/rooms/${chatRoomId}/unread-count?userId=${userId}&userType=${userType}`);
    return res.data;
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
  },

  // === PRODUCT MESSAGE SUPPORT ===
  // Gửi sản phẩm thông qua chat
  sendProductMessage: async (chatRoomId, senderId, senderType, product) => {
    try {
      const messageDto = {
        chatRoomId,
        senderId,
        senderType,
        messageContent: `Sản phẩm: ${product.productName}`,
        messageType: 1, // Product message type
        productData: {
          productId: product.productId,
          productName: product.productName,
          price: product.sellingPrice,
          imageUrl: product.imageUrl,
          quantity: product.quantity,
          unit: product.unit,
          productCode: product.productCode
        }
      };
      const res = await http.post('Chat/messages', messageDto, {
        headers: { 'Content-Type': 'application/json' }
      });
      return res.data;
    } catch (error) {
      console.error('Error sending product message:', error);
      throw error;
    }
  },

  // Gửi link sản phẩm
  sendProductLink: async (chatRoomId, senderId, senderType, productId, productName) => {
    try {
      const messageDto = {
        chatRoomId,
        senderId,
        senderType,
        messageContent: `Xem sản phẩm: ${productName}`,
        messageType: 2, // Link message type
        attachmentUrl: `/products/${productId}`
      };
      const res = await http.post('Chat/messages', messageDto, {
        headers: { 'Content-Type': 'application/json' }
      });
      return res.data;
    } catch (error) {
      console.error('Error sending product link:', error);
      throw error;
    }
  }
};

export default ChatService;