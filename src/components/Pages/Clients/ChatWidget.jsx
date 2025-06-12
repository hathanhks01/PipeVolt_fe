import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import ChatService from '../../../Services/ChatService';
import JwtUtils from '../../../constants/JwtUtils';
import { Url } from '../../../constants/config';

const SIGNALR_URL = `${Url}chathub`;
const RECONNECT_DELAY = 3000;
const MESSAGE_THROTTLE_DELAY = 1000;

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
  
  const messagesEndRef = useRef(null);
  const messagesRef = useRef(messages);
  const reconnectTimeoutRef = useRef(null);

  const customerId = JwtUtils.getCurrentUserId();

  // Cập nhật messages ref
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Auto scroll
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Khởi tạo chat room
  useEffect(() => {
    if (!open || !customerId) return;
    
    let isMounted = true;
    setIsLoading(true);
    setError(null);

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
    if (!chatRoom) return;

    const setupConnection = async () => {
      const hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(SIGNALR_URL)
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Event handlers
      const handleReceiveMessage = (msg) => {
        setMessages(prev => {
          // Kiểm tra duplicate
          if (prev.some(m => m.messageId === msg.messageId)) {
            return prev;
          }
          return [...prev, msg];
        });
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
        
        // Manual reconnect fallback
        reconnectTimeoutRef.current = setTimeout(() => {
          if (hubConnection.state === signalR.HubConnectionState.Disconnected) {
            setupConnection();
          }
        }, RECONNECT_DELAY);
      });

      // Register event handlers
      hubConnection.on('ReceiveMessage', handleReceiveMessage);
      hubConnection.on('MessageRead', handleMessageRead);

      try {
        await hubConnection.start();
        setConnectionStatus('connected');
        setError(null);
        
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
      if (connection) {
        connection.stop();
      }
    };
  }, [chatRoom]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (connection) {
        connection.stop();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

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
    } catch (err) {
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
      setInput(messageContent); // Restore input
      console.error('Send message error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [input, chatRoom, customerId, isLoading, lastSentTime]);

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
        <div className="fixed bottom-6 right-6 w-80 bg-white rounded-xl shadow-2xl z-50 flex flex-col border border-gray-200 max-h-96">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-600 rounded-t-xl">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">Hỗ trợ khách hàng</span>
              {getConnectionIcon()}
            </div>
            <button 
              onClick={() => setOpen(false)} 
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Đóng chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">{error}</span>
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0" style={{ maxHeight: '300px' }}>
            {isLoading && messages.length === 0 ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-4">
                Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.messageId}
                  className={`flex ${msg.senderType === 1 ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg text-sm max-w-xs break-words ${
                      msg.senderType === 1
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div>{msg.messageContent}</div>
                    {msg.senderType === 1 && (
                      <div className="text-xs opacity-75 mt-1">
                        {msg.isRead ? '✓✓' : '✓'}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="flex border-t p-2 bg-gray-50 rounded-b-xl">
            <input
              type="text"
              className="flex-1 px-3 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={chatRoom ? "Nhập tin nhắn..." : "Đang khởi tạo..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!chatRoom || isLoading}
              maxLength={1000}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSend}
              disabled={!input.trim() || !chatRoom || isLoading}
            >
              {isLoading ? '...' : 'Gửi'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;