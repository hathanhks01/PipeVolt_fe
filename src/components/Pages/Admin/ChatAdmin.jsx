import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import ChatService from '../../../Services/ChatService';
import JwtUtils from '../../../constants/JwtUtils';
import { Url } from '../../../constants/config';
import { X, Wifi, WifiOff, AlertCircle } from 'lucide-react';

const SIGNALR_URL = `${Url.replace(/\/$/, '')}/chathub`;

const ChatAdmin = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [roomConnection, setRoomConnection] = useState(null); // Per-room connection
  const [listConnection, setListConnection] = useState(null); // Global list connection
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [employeeId, setEmployeeId] = useState(JwtUtils.getCurrentUserId());
  const [typingUsers, setTypingUsers] = useState(new Set()); // Tracking customers typing
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Monitor authentication status - detect logout
  useEffect(() => {
    const checkAuthStatus = () => {
      const userId = JwtUtils.getCurrentUserId();
      
      if (!userId) {
        // Admin đã logout - reset tất cả
        if (employeeId || rooms.length > 0 || selectedRoom) {
          console.log('Detecting admin logout - clearing chat data');
          setEmployeeId(null);
          setRooms([]);
          setSelectedRoom(null);
          setMessages([]);
          setInput('');
          setError(null);
          setTypingUsers(new Set()); // Clear typing indicators
          
          // Close both connections
          if (roomConnection) {
            roomConnection.stop().catch(console.error);
            setRoomConnection(null);
          }
          if (listConnection) {
            listConnection.stop().catch(console.error);
            setListConnection(null);
          }
        }
        return;
      }

      // Update employeeId nếu có perubahan
      if (userId !== employeeId) {
        setEmployeeId(userId);
      }
    };

    checkAuthStatus();
    
    // Poll authentication status mỗi 5 giây
    const authCheckInterval = setInterval(checkAuthStatus, 5000);
    
    return () => clearInterval(authCheckInterval);
  }, [employeeId, rooms.length, selectedRoom, roomConnection, listConnection]);

  // Lấy danh sách phòng chat - reset khi employeeId thay đổi
  useEffect(() => {
    if (!employeeId) {
      setRooms([]);
      return;
    }
    
    const fetchRooms = async () => {
      try {
        const data = await ChatService.getChatRoomsForEmployee(employeeId);
        setRooms(data || []);
      } catch (err) {
        setError('Không thể tải danh sách phòng chat');
      }
    };
    fetchRooms();
  }, [employeeId]);

  // Kết nối global để listen danh sách phòng chat update
  useEffect(() => {
    if (!employeeId) {
      if (listConnection) {
        listConnection.stop().catch(console.error);
        setListConnection(null);
      }
      return;
    }

    let globalConnection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_URL)
      .withAutomaticReconnect([0, 2000, 10000])
      .build();

    const handleChatListUpdated = async (chatRoomId) => {
      // Khi có message mới hoặc room reopened, refresh danh sách
      console.log('📢 Chat list updated for room:', chatRoomId);
      try {
        const updatedRooms = await ChatService.getChatRoomsForEmployee(employeeId);
        setRooms(updatedRooms || []);
        
        // Nếu room hiện tại bị cập nhật, reload messages
        if (chatRoomId === selectedRoom?.chatRoomId) {
          console.log('🔄 Reloading messages for current room...');
          const updatedMessages = await ChatService.getMessages(chatRoomId, 1, 50);
          setMessages(updatedMessages || []);
        }
      } catch (err) {
        console.error('❌ Error refreshing chat list:', err);
      }
    };

    globalConnection.on('ChatListUpdated', handleChatListUpdated);

    globalConnection.start()
      .then(() => {
        console.log('✅ Global chat list connection established');
        // Register employee for targeted notifications
        globalConnection.invoke('RegisterUser', employeeId, 1).catch(err => {
          console.error('RegisterUser error:', err);
        });
      })
      .catch(err => {
        console.error('❌ Global connection failed:', err);
      });

    setListConnection(globalConnection);

    return () => {
      globalConnection.off('ChatListUpdated', handleChatListUpdated);
      globalConnection.stop().catch(console.error);
    };
  }, [employeeId, selectedRoom]);

  // Lấy tin nhắn khi chọn phòng
  useEffect(() => {
    if (!selectedRoom) return;
    const fetchMessages = async () => {
      setIsLoading(true);
      setTypingUsers(new Set()); // Clear typing khi vào room khác
      try {
        const msgs = await ChatService.getMessages(selectedRoom.chatRoomId, 1, 50);
        setMessages(msgs || []);
        
        // Mark all messages as read when opening room
        await ChatService.markAllMessagesAsRead(selectedRoom.chatRoomId, employeeId, 1).catch(() => {});
      } catch {
        setMessages([]);
      }
      setIsLoading(false);
    };
    fetchMessages();
  }, [selectedRoom, employeeId]);

  // Kết nối SignalR per-room khi chọn phòng
  useEffect(() => {
    if (!selectedRoom || !employeeId) {
      // Close per-room connection khi logout hoặc unselect room
      if (roomConnection) {
        roomConnection.stop().catch(console.error);
        setRoomConnection(null);
      }
      setConnectionStatus('disconnected');
      return;
    }

    let hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_URL)
      .withAutomaticReconnect([0, 2000, 10000])
      .build();

    const handleReceiveMessage = (msg) => {
      // Chỉ nhận message nếu vẫn ở room này
      if (employeeId && msg.chatRoomId === selectedRoom?.chatRoomId) {
        console.log('💬 New message received:', msg.messageId);
        setMessages(prev => {
          if (prev.some(m => m.messageId === msg.messageId)) return prev;
          return [...prev, msg];
        });
      }
    };

    hubConnection.onreconnecting(() => {
      console.log('🔄 Reconnecting to chat room...');
      setConnectionStatus('reconnecting');
    });

    hubConnection.onreconnected(() => {
      console.log('✅ Reconnected to chat room');
      setConnectionStatus('connected');
      // Rejoin room after reconnect
      hubConnection.invoke('JoinChatRoom', selectedRoom.chatRoomId).catch(console.error);
    });

    hubConnection.onclose(() => {
      console.log('❌ Chat room connection closed');
      setConnectionStatus('disconnected');
    });

    hubConnection.on('ReceiveMessage', handleReceiveMessage);

    hubConnection.start()
      .then(() => {
        console.log('✅ Per-room connection established');
        setConnectionStatus('connected');
        // Join chat room
        hubConnection.invoke('JoinChatRoom', selectedRoom.chatRoomId).catch(console.error);
      })
      .catch(err => {
        console.error('❌ Per-room connection failed:', err);
        setConnectionStatus('disconnected');
      });

    setRoomConnection(hubConnection);

    return () => {
      hubConnection.off('ReceiveMessage', handleReceiveMessage);
      hubConnection.stop().catch(console.error);
    };
  }, [selectedRoom, employeeId]);

  // Auto scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Gửi tin nhắn
  const handleSend = useCallback(async () => {
    if (!input.trim() || !selectedRoom) return;
    try {
      await ChatService.sendMessage({
        chatRoomId: selectedRoom.chatRoomId,
        senderId: employeeId,
        senderType: 1, // 1 = Employee
        messageContent: input.trim(),
        messageType: 0
      });
      setInput('');
      setIsAdminTyping(false);
      // Emit stop typing
      if (roomConnection && roomConnection.state === signalR.HubConnectionState.Connected) {
        await roomConnection.invoke('UserStoppedTyping', selectedRoom.chatRoomId, employeeId).catch(console.error);
      }
    } catch {
      setError('Không thể gửi tin nhắn');
    }
  }, [input, selectedRoom, employeeId, roomConnection]);

  // Handle typing
  const handleInputChange = (e) => {
    const value = e.target.value;
    const wasEmpty = input.trim().length === 0;
    const isNowEmpty = value.trim().length === 0;
    
    setInput(value);

    // Emit typing event CHỈ khi bắt đầu gõ
    if (roomConnection && roomConnection.state === signalR.HubConnectionState.Connected && wasEmpty && !isNowEmpty && !isAdminTyping && selectedRoom) {
      setIsAdminTyping(true);
      roomConnection.invoke('UserTyping', selectedRoom.chatRoomId, 'Admin').catch(console.error);
    }

    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto stop typing sau 2 giây
    typingTimeoutRef.current = setTimeout(() => {
      if (roomConnection && roomConnection.state === signalR.HubConnectionState.Connected && isAdminTyping && selectedRoom) {
        setIsAdminTyping(false);
        roomConnection.invoke('UserStoppedTyping', selectedRoom.chatRoomId, employeeId).catch(console.error);
      }
    }, 2000);
  };

  // Enter để gửi
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Cleanup effect - đóng connection khi component unmount hoặc logout
  useEffect(() => {
    return () => {
      if (roomConnection && roomConnection.state === signalR.HubConnectionState.Connected) {
        roomConnection.stop().catch(console.error);
      }
      if (listConnection && listConnection.state === signalR.HubConnectionState.Connected) {
        listConnection.stop().catch(console.error);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [roomConnection, listConnection]);

  return (
    // Container chính với chiều cao cố định 100vh - không cuộn được
    <div className="h-screen flex bg-gray-50 overflow-hidden">

      {/* Sidebar - có thể cuộn riêng biệt */}
      <aside className="w-64 md:w-72 border-r bg-white flex flex-col">
        {/* Header sidebar - cố định */}
        <div className="p-3 md:p-4 font-bold text-lg border-b bg-white flex-shrink-0">
          Phòng Chat Khách Hàng
        </div>

        {/* Danh sách phòng - có thể cuộn */}
        <div className="flex-1 overflow-y-auto">
          {rooms.filter(room => room.status != 1).length == 0 ? (
            <div className="p-4 text-gray-500">Không có phòng chat nào.</div>
          ) : (
            rooms
              .filter(room => room.status !== 1) // Ẩn phòng đã đóng
              .map(room => (
                <div
                  key={room.chatRoomId}
                  className={`p-4 border-b cursor-pointer hover:bg-blue-50 transition-colors ${selectedRoom && selectedRoom.chatRoomId === room.chatRoomId
                      ? 'bg-blue-100 border-l-4 border-l-blue-500'
                      : ''
                    }`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <div className="font-semibold truncate">{room.customerName}</div>
                  <div className="text-xs text-gray-500 truncate">{room.roomName}</div>
                  <div className="text-xs text-gray-400">Chưa đọc: {room.unreadCount}</div>
                </div>
              ))
          )}
        </div>
      </aside>

      {/* Khu vực chat chính - không cuộn */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Header chat - cố định */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b bg-white flex-shrink-0">
          <div className="font-semibold text-base md:text-lg truncate">
            {selectedRoom ? selectedRoom.customerName : 'Chọn phòng chat'}
          </div>
          <div className="flex-shrink-0">
            {connectionStatus === 'connected' ?
              <Wifi className="w-5 h-5 text-green-500" /> :
              <WifiOff className="w-5 h-5 text-red-500" />
            }
          </div>
        </div>

        {/* Thông báo lỗi - cố định */}
        {error && (
          <div className="px-6 py-2 bg-yellow-50 border-b border-yellow-200 flex items-center gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-yellow-600 hover:text-yellow-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Khu vực tin nhắn - có thể cuộn riêng biệt */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-2 bg-gray-50">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : !selectedRoom ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <div className="text-xl mb-2">💬</div>
                <div>Chọn một phòng chat để bắt đầu</div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <div className="text-xl mb-2">📝</div>
                <div>Chưa có tin nhắn nào</div>
              </div>
            </div>
          ) : (
            <>
              {messages.map(msg => (
                <div
                  key={msg.messageId}
                  className={`flex ${msg.senderType === 1 ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg text-sm max-w-xs break-words shadow-sm ${msg.senderType === 1
                        ? 'bg-green-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 border rounded-bl-sm'
                      }`}
                  >
                    <div>{msg.messageContent}</div>
                    <div className={`text-xs mt-1 ${msg.senderType === 1 ? 'text-green-100' : 'text-gray-400'}`}>
                      {msg.createdAt && !isNaN(new Date(msg.createdAt)) ? (
                        new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Khu vực nhập tin nhắn - cố định */}
        {selectedRoom && (
          <div className="border-t p-3 md:p-4 bg-white flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                maxLength={1000}
              />
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
              >
                Gửi
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1 text-right">
              {input.length}/1000 ký tự
            </div>
          </div>
        )}
        {selectedRoom && selectedRoom.status != 1 && (
          <button
            onClick={async () => {
              if (window.confirm('Bạn có chắc muốn đóng phòng chat này?')) {
                try {
                  await ChatService.closeChatRoom(selectedRoom.chatRoomId);
                  setRooms(prev => prev.map(r =>
                    r.chatRoomId === selectedRoom.chatRoomId
                      ? { ...r, status: 1 }
                      : r
                  ));
                  setSelectedRoom(null);
                } catch {
                  setError('Đóng phòng chat thất bại!');
                }
              }
            }}
            className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-60"
          >
            Đóng phòng chat
          </button>
        )}
      </main>
    </div>
  );
};

export default ChatAdmin;