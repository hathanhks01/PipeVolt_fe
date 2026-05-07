import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, AlertCircle, Wifi, WifiOff, Send, Package } from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import ChatService from '../../../Services/ChatService';
import ChatMessageItem from '../../ChatMessageItem';
import JwtUtils from '../../../constants/JwtUtils';
import { Url } from '../../../constants/config';
import customerservice from '../../../Services/CustomerService';
const SIGNALR_URL = `${Url}chathub`;
const RECONNECT_DELAY = 3000;
const MESSAGE_THROTTLE_DELAY = 1000;
const TYPING_TIMEOUT = 2000;

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatRoom, setChatRoom] = useState(null);
  const [connection, setConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSentTime, setLastSentTime] = useState(0);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [adminOnline, setAdminOnline] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const messagesRef = useRef(messages);
  const reconnectTimeoutRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [customerId, setCustomerId] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');

  // Monitor authentication state - detect logout
  useEffect(() => {
    const checkAuthStatus = async () => {
      const userId = JwtUtils.getCurrentUserId();
      
      if (!userId) {
        // User đã logout - reset tất cả data
        if (customerId || messages.length > 0 || chatRoom) {
          console.log('Detecting logout - clearing chat data');
          setCustomerId(null);
          setMessages([]);
          setChatRoom(null);
          setCustomerName('');
          setInput('');
          setError(null);
          setOpen(false);
          setTypingUsers(new Set()); // Clear typing indicators
          
          // Close connection
          if (connection) {
            connection.stop().catch(console.error);
            setConnection(null);
          }
        }
        return;
      }

      setCustomerLoading(true);
      try {
        const customerData = await customerservice.getCustomerByUserId(userId);
        
        if (customerData && customerData.customerId) {
          setCustomerId(customerData.customerId);
          setCustomerName(customerData.customerName || 'Khách hàng');
        } else {
          setError('Không tìm thấy thông tin khách hàng');
        }
      } catch (err) {
        console.error('Error fetching customer ID:', err);
        setError('Không thể tải thông tin khách hàng');
      } finally {
        setCustomerLoading(false);
      }
    };

    checkAuthStatus();
    
    // Poll authentication status mỗi 5 giây để detect logout
    const authCheckInterval = setInterval(checkAuthStatus, 5000);
    
    return () => clearInterval(authCheckInterval);
  }, [customerId, messages.length, chatRoom, connection]);

  // Cập nhật messages ref
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Lắng nghe event mở chat từ bên ngoài (ví dụ nút "Liên Hệ Người Bán")
  useEffect(() => {
    const handleOpenChat = () => setOpen(true);
    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, []);

  // Auto scroll
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Khởi tạo chat room
  useEffect(() => {
    if (!open || !customerId) {
      // Reset chat room khi logout (customerId = null)
      setChatRoom(null);
      setMessages([]);
      setTypingUsers(new Set()); // Clear typing khi reset room
      return;
    }
    
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setTypingUsers(new Set()); // Clear typing khi vào room khác

    const initializeChat = async () => {
      try {
        let room = null;
        const rooms = await ChatService.getChatRoomsForCustomer(customerId);
        
        if (rooms && rooms.length > 0) {
          room = rooms[0];
        } else {
          room = await ChatService.createChatRoom(customerId);
        }
        
        if (!isMounted) return;
        
        setChatRoom(room);
        
        // Load messages với error handling
        const msgs = await ChatService.getMessages(room.chatRoomId, 1, 50);
        if (isMounted) {
          setMessages(msgs || []);
        }
      } catch (err) {
        if (isMounted) {
          setError('Không thể kết nối đến hệ thống chat. Vui lòng thử lại.');
          console.error('Chat initialization error:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeChat();
    return () => { isMounted = false; };
  }, [open, customerId]);

  // SignalR connection với auto-reconnect
  useEffect(() => {
    if (!chatRoom) {
      // Close connection khi chat room bị reset (logout)
      if (connection) {
        connection.stop().catch(console.error);
      }
      return;
    }

    const setupConnection = async () => {
      const hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(SIGNALR_URL)
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Event handlers
      const handleReceiveMessage = (msg) => {
        // Chỉ nhận message nếu vẫn ở room này (check customerId)
        if (customerId && msg.chatRoomId === chatRoom?.chatRoomId) {
          setMessages(prev => {
            // Kiểm tra duplicate
            if (prev.some(m => m.messageId === msg.messageId)) {
              return prev;
            }
            return [...prev, msg];
          });
        }
      };

      const handleMessageRead = (messageId) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.messageId === messageId 
              ? { ...msg, isRead: true, readAt: new Date() }
              : msg
          )
        );
      };

      const handleUserTyping = ({ userName }) => {
        // Chỉ show khi người khác gõ (không phải current customer)
        if (userName !== customerName) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.add(userName);
            return newSet;
          });
          
          // Clear timeout if exists
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          
          // Auto-clear typing indicator sau 3 giây không có sự kiện
          typingTimeoutRef.current = setTimeout(() => {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(userName);
              return newSet;
            });
          }, 3000);
        }
      };

      const handleUserStoppedTyping = (userId) => {
        // Clear toàn bộ typing users (người khác đã ngừng gõ)
        setTypingUsers(new Set());
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };

      // Connection state handlers
      hubConnection.onreconnecting(() => {
        setConnectionStatus('reconnecting');
        setError('Đang kết nối lại...');
      });

      hubConnection.onreconnected(() => {
        setConnectionStatus('connected');
        setError(null);
        // Rejoin room after reconnect
        hubConnection.invoke('JoinChatRoom', chatRoom.chatRoomId).catch(console.error);
      });

      hubConnection.onclose(() => {
        setConnectionStatus('disconnected');
        setError('Mất kết nối. Đang thử kết nối lại...');
        
        // Không reconnect nếu đã logout
        if (!customerId) {
          return;
        }
        
        // Manual reconnect fallback
        reconnectTimeoutRef.current = setTimeout(() => {
          if (hubConnection.state === signalR.HubConnectionState.Disconnected && customerId) {
            setupConnection();
          }
        }, RECONNECT_DELAY);
      });

      // Register event handlers
      hubConnection.on('ReceiveMessage', handleReceiveMessage);
      hubConnection.on('MessageRead', handleMessageRead);
      hubConnection.on('UserTyping', handleUserTyping);
      hubConnection.on('UserStoppedTyping', handleUserStoppedTyping);

      try {
        await hubConnection.start();
        setConnectionStatus('connected');
        setError(null);
        
        // Register customer for targeted notifications
        await hubConnection.invoke('RegisterUser', customerId, 2).catch(console.error); // 2 = Customer
        
        // Join chat room
        await hubConnection.invoke('JoinChatRoom', chatRoom.chatRoomId);
        
        setConnection(hubConnection);
      } catch (err) {
        setConnectionStatus('disconnected');
        setError('Không thể kết nối realtime. Tin nhắn vẫn sẽ được gửi.');
        console.error('SignalR connection error:', err);
      }
    };

    setupConnection();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [chatRoom, customerId]);

  // Cleanup khi component unmount hoặc logout
  useEffect(() => {
    return () => {
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.stop().catch(console.error);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [connection]);

  // Throttled send message
  const handleSend = useCallback(async () => {
    if (!input.trim() || !chatRoom || isLoading) {
      return;
    }

    // Throttle messages
    const now = Date.now();
    if (now - lastSentTime < MESSAGE_THROTTLE_DELAY) {
      setError('Vui lòng chờ trước khi gửi tin nhắn tiếp theo.');
      return;
    }

    const messageContent = input.trim();
    setInput('');
    setIsLoading(true);
    setError(null);
    setLastSentTime(now);

    try {
      const messageDto = {
        chatRoomId: chatRoom.chatRoomId,
        senderId: customerId,
        senderType: 1, // Customer
        messageContent,
        messageType: 0 // Text
      };

      await ChatService.sendMessage(messageDto);
      
      // Message sẽ được nhận lại qua SignalR
      // Emit stop typing
      setIsUserTyping(false);
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        await connection.invoke('UserStoppedTyping', chatRoom.chatRoomId, customerId).catch(console.error);
      }
    } catch (err) {
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
      setInput(messageContent); // Restore input
      console.error('Send message error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [input, chatRoom, customerId, isLoading, lastSentTime, connection]);

  // Handle typing with debounce - chỉ emit khi bắt đầu gõ, không phải mỗi keystroke
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    const wasEmpty = input.trim().length === 0;
    const isNowEmpty = value.trim().length === 0;
    
    setInput(value);

    // Emit typing event CHỈ khi chuyển từ rỗng sang có text (bắt đầu gõ)
    if (connection && connection.state === signalR.HubConnectionState.Connected && wasEmpty && !isNowEmpty && !isUserTyping) {
      setIsUserTyping(true);
      connection.invoke('UserTyping', chatRoom?.chatRoomId, customerName).catch(console.error);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to emit "stopped typing" sau 2 giây không gõ
    typingTimeoutRef.current = setTimeout(() => {
      if (connection && connection.state === signalR.HubConnectionState.Connected && isUserTyping) {
        setIsUserTyping(false);
        connection.invoke('UserStoppedTyping', chatRoom?.chatRoomId, customerId).catch(console.error);
      }
    }, 2000);
  }, [connection, chatRoom, customerId, customerName, input, isUserTyping]);

  // Handle Enter key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'reconnecting':
        return <WifiOff className="w-4 h-4 text-yellow-500 animate-pulse" />;
      default:
        return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  };

  // Đánh dấu tất cả tin nhắn là đã đọc khi user mở phòng chat
  useEffect(() => {
    if (!open || !chatRoom || !customerId) return;
    ChatService.markAllMessagesAsRead(chatRoom.chatRoomId, customerId, 1).catch(() => {});
  }, [open, chatRoom, customerId, messages.length]);

  return (
    <div>
      {/* Chat button */}
      {!open && (
        <button
          className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg z-50 hover:bg-blue-700 transition-all duration-200 hover:scale-105"
          onClick={() => setOpen(true)}
          aria-label="Mở chat hỗ trợ"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat popup */}
      {open && (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-2xl z-50 flex flex-col border border-gray-200 max-h-[32rem]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-white font-semibold text-sm">Hỗ trợ khách hàng</span>
                <div className="flex items-center gap-1 text-xs text-blue-100">
                  {getConnectionIcon()}
                  <span>{connectionStatus === 'connected' ? 'Kết nối' : 'Mất kết nối'}</span>
                  {adminOnline && <span className="ml-1">• Admin online</span>}
                </div>
              </div>
            </div>
            <button 
              onClick={() => setOpen(false)} 
              className="text-white hover:text-blue-100 transition-colors"
              aria-label="Đóng chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <span className="text-sm text-yellow-800">{error}</span>
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0 bg-gray-50" style={{ maxHeight: '20rem' }}>
            {isLoading && messages.length === 0 ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessageItem
                  key={msg.messageId}
                  message={msg}
                  isOwn={msg.senderType === 1}
                />
              ))
            )}
            
            {/* Typing indicator */}
            {typingUsers.size > 0 && (
              <div className="flex items-center gap-2 text-gray-500 text-sm italic py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span>{Array.from(typingUsers).join(', ')} đang nhập...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t bg-white rounded-b-xl p-3 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder={chatRoom ? "Nhập tin nhắn..." : "Đang khởi tạo..."}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={!chatRoom || isLoading}
                maxLength={1000}
              />
              <button
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                onClick={handleSend}
                disabled={!input.trim() || !chatRoom || isLoading}
                title="Gửi tin nhắn"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;