// ============================================================
//  HƯỚNG DẪN SỬ DỤNG HỆ THỐNG CHAT REALTIME PIPEVOLT
// ============================================================

/**
 * ✅ CÁC TÍNH NĂNG ĐÃ IMPLEMENT
 * 
 * 1. CHAT REALTIME CƠ BẢN
 *    - Real-time messaging giữa Customer ↔ Admin/Employee
 *    - SignalR connection với auto-reconnect
 *    - Message history được lưu
 * 
 * 2. TYPING INDICATOR ("Đang nhập...")
 *    - Hiển thị khi admin/khách đang gõ
 *    - Tự động clear sau 2 giây không hoạt động
 *    - Animaded dots indicator
 * 
 * 3. TRẠNG THÁI MESSAGE
 *    - ✓ = Đã gửi (sent)
 *    - ✓✓ = Đã đọc (seen)
 *    - Timestamp cho mỗi tin nhắn
 * 
 * 4. ONLINE/OFFLINE STATUS
 *    - Hiển thị trạng thái kết nối (Kết nối/Mất kết nối)
 *    - Indicator nếu Admin online
 *    - Wifi icon color: Green=online, Red=offline
 * 
 * 5. RICH MESSAGE SUPPORT (Product Messages)
 *    - Gửi sản phẩm với hình ảnh, giá, thông tin
 *    - Gửi link sản phẩm
 *    - Click button "Xem Chi Tiết" để navigate
 */

// ============================================================
// 🔧 CÁCH SỬ DỤNG
// ============================================================

/**
 * A. GỬI TIN NHẮN THƯỜNG
 * 
 * const messageDto = {
 *   chatRoomId: room.chatRoomId,
 *   senderId: customerId,
 *   senderType: 1, // 1=Customer, 2=Employee
 *   messageContent: "Tin nhắn của tôi",
 *   messageType: 0 // 0=Text
 * };
 * 
 * await ChatService.sendMessage(messageDto);
 */

/**
 * B. GỬI PRODUCT MESSAGE (từ Admin/Nhân viên gửi sản phẩm cho khách)
 * 
 * const product = {
 *   productId: 123,
 *   productName: "Ống PVC 25mm",
 *   sellingPrice: 15000,
 *   imageUrl: "/images/pvc-25.jpg",
 *   quantity: 100,
 *   unit: "cái",
 *   productCode: "PVC-25-001"
 * };
 * 
 * await ChatService.sendProductMessage(
 *   chatRoomId, 
 *   employeeId, 
 *   2, // senderType = Employee
 *   product
 * );
 */

/**
 * C. GỬI PRODUCT LINK
 * 
 * await ChatService.sendProductLink(
 *   chatRoomId,
 *   employeeId,
 *   2,
 *   productId,
 *   "Ống PVC 25mm"
 * );
 */

// ============================================================
// 🏗️ KIẾN TRÚC BACKEND
// ============================================================

/**
 * ChatController.cs
 * ├── POST /api/chat/messages → Gửi tin nhắn
 * ├── GET /api/chat/rooms/{roomId}/messages → Lấy lịch sử
 * ├── PUT /api/chat/messages/{id}/read → Mark as read
 * ├── POST /api/chat/rooms → Tạo phòng chat
 * └── GET /api/chat/rooms/customer/{id} → Lấy phòng của customer
 * 
 * ChatHub.cs (SignalR)
 * ├── JoinChatRoom(roomId) → Tham gia phòng
 * ├── SendMessage(messageDto) → Gửi tin
 * ├── UserTyping(roomId, name) → Thông báo đang gõ
 * ├── UserStoppedTyping(roomId, userId) → Ngừng gõ
 * └── MarkAsRead(messageId) → Đánh dấu đã đọc
 */

// ============================================================
// 🎨 CÁC COMPONENT FRONTEND
// ============================================================

/**
 * 1. ChatWidget.jsx (Customer-side chat)
 *    - Fixed button bottom-right
 *    - Popup chat window
 *    - Features: typing indicator, read status, connection status
 * 
 * 2. ChatAdmin.jsx (Admin/Employee-side)
 *    - Chat room list
 *    - Message panel
 *    - Real-time updates
 * 
 * 3. ChatMessageItem.jsx (Shared component)
 *    - Renders different message types (text, product, link, image)
 *    - Shows sender name, timestamp, read status
 *    - Product cards with click-to-details
 */

// ============================================================
// 📊 MESSAGE TYPES
// ============================================================

/**
 * MessageType Enum:
 * 0 = Text (default)
 * 1 = Product (has productData)
 * 2 = Link (has attachmentUrl)
 * 3 = Image (has attachmentUrl)
 */

// ============================================================
// 🔐 SENDER TYPES
// ============================================================

/**
 * SenderType Enum:
 * 1 = Customer
 * 2 = Employee/Admin
 */

// ============================================================
// 💻 CÁCH INTEGRATE VÀO TRANG SẢN PHẨM
// ============================================================

/**
 * Thêm button "Liên hệ người bán" trên trang sản phẩm:
 * 
 * import ChatService from '../Services/ChatService';
 * 
 * const handleContactSeller = async (product) => {
 *   try {
 *     // Mở chat
 *     window.dispatchEvent(new Event('openChat'));
 *     
 *     // Gửi product thông qua Admin API
 *     // Admin sẽ thấy sản phẩm nào customer quan tâm
 *     const messageDto = {
 *       chatRoomId,
 *       senderId: customerId,
 *       senderType: 1,
 *       messageContent: `Tôi quan tâm: ${product.productName}`,
 *       messageType: 1,
 *       productData: {...product}
 *     };
 *     await ChatService.sendMessage(messageDto);
 *   } catch (error) {
 *     console.error('Error:', error);
 *   }
 * };
 */

// ============================================================
// 🚀 FEATURES SẴN SÀNG IMPLEMENT THÊM
// ============================================================

/**
 * 1. File Upload (Hình ảnh/Tệp)
 *    - Thêm input file
 *    - Upload to server
 *    - Send attachmentUrl
 * 
 * 2. Emoji Support
 *    - Thêm emoji picker
 *    - Display emojis in messages
 * 
 * 3. Message Search
 *    - Search across chat history
 *    - Highlight matches
 * 
 * 4. Chat Notifications
 *    - Browser notifications
 *    - Sound alerts
 *    - Badge counter
 * 
 * 5. Admin Panel
 *    - View all active chats
 *    - Assign to staff
 *    - Chat statistics
 */

// ============================================================
// 📝 LƯỚI TĨN NHẮN ĐÃ LƯU
// ============================================================

/**
 * Database Structure (ChatMessage Table):
 * ├── MessageId (Primary Key)
 * ├── ChatRoomId (Foreign Key)
 * ├── SenderId
 * ├── SenderType (1=Customer, 2=Employee)
 * ├── MessageContent
 * ├── MessageType (0=Text, 1=Product, 2=Link, 3=Image)
 * ├── AttachmentUrl
 * ├── ProductData (JSON - for Product messages)
 * ├── IsRead
 * ├── SentAt
 * └── ReadAt
 */

export default {
  MessageTypes: {
    TEXT: 0,
    PRODUCT: 1,
    LINK: 2,
    IMAGE: 3
  },
  SenderTypes: {
    CUSTOMER: 1,
    EMPLOYEE: 2
  },
  ConnectionStatus: {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    RECONNECTING: 'reconnecting'
  }
};
