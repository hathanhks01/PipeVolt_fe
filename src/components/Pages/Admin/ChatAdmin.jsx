import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import ChatService from '../../../Services/ChatService';
import ChatMessageItem from '../../ChatMessageItem';
import JwtUtils from '../../../constants/JwtUtils';
import { createHubConnection } from '../../../common/signalr-common';
import { Wifi, WifiOff, Send, Loader2, Search, MessageCircle } from 'lucide-react';

const SENDER_EMPLOYEE = 1;
const TYPING_TIMEOUT_MS = 2500;

const ChatAdmin = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [roomSearch, setRoomSearch] = useState('');

  const hubRef = useRef(null);
  const selectedRoomRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const employeeId = JwtUtils.getCurrentEmployeeId();
  const isLoggedIn = !!employeeId;

  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadRooms = useCallback(async () => {
    if (!isLoggedIn) return;
    setIsLoadingRooms(true);
    try {
      const data = await ChatService.getChatRoomsForEmployee(employeeId);
      setRooms(data || []);
    } catch (err) {
      console.error('[ChatAdmin] loadRooms error:', err);
    } finally {
      setIsLoadingRooms(false);
    }
  }, [isLoggedIn, employeeId]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    if (!selectedRoom) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setIsLoadingMessages(true);
    setTypingUsers([]);

    const load = async () => {
      try {
        const msgs = await ChatService.getMessages(selectedRoom.chatRoomId, 1, 100);
        if (!cancelled) setMessages(msgs || []);

        await ChatService.markAllMessagesAsRead(
          selectedRoom.chatRoomId, employeeId, SENDER_EMPLOYEE
        ).catch(() => { });

        setRooms(prev => prev.map(r =>
          r.chatRoomId === selectedRoom.chatRoomId ? { ...r, unreadCount: 0 } : r
        ));
      } catch (err) {
        console.error('[ChatAdmin] loadMessages error:', err);
      } finally {
        if (!cancelled) setIsLoadingMessages(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [selectedRoom, employeeId]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const hub = createHubConnection([0, 2000, 5000, 15000]);

    hub.on('ReceiveMessage', (msg) => {
      const currentRoom = selectedRoomRef.current;

      if (currentRoom && msg.chatRoomId === currentRoom.chatRoomId) {
        setMessages(prev => {
          if (prev.some(m => m.messageId === msg.messageId)) return prev;
          return [...prev, msg];
        });
        if (msg.senderType !== SENDER_EMPLOYEE) {
          ChatService.markMessageAsRead(msg.messageId).catch(() => { });
        }
      } else {
        setRooms(prev => prev.map(r =>
          r.chatRoomId === msg.chatRoomId
            ? {
              ...r,
              unreadCount: (r.unreadCount || 0) + 1,
              lastMessage: msg.messageContent,
              lastMessageAt: msg.sentAt,
            }
            : r
        ));
      }
    });

    hub.on('ChatListUpdated', async () => {
      try {
        const updated = await ChatService.getChatRoomsForEmployee(employeeId);
        setRooms(updated || []);
      } catch { }
    });

    hub.on('UserTyping', (data) => {
      const currentRoom = selectedRoomRef.current;
      if (!currentRoom || data.chatRoomId !== currentRoom.chatRoomId) return;
      if (data.senderId === employeeId) return;
      setTypingUsers(prev => {
        if (prev.includes(data.senderName)) return prev;
        return [...prev, data.senderName];
      });
    });

    hub.on('UserStoppedTyping', (senderId) => {
      if (senderId === employeeId) return;
      setTypingUsers([]);
    });

    hub.on('MessageRead', (messageId) => {
      setMessages(prev =>
        prev.map(m => m.messageId === messageId ? { ...m, isRead: true } : m)
      );
    });

    hub.onreconnecting(() => setConnectionStatus('reconnecting'));
    hub.onreconnected(async () => {
      setConnectionStatus('connected');
      if (selectedRoomRef.current) {
        await hub.invoke('JoinChatRoom', selectedRoomRef.current.chatRoomId).catch(() => { });
      }
    });
    hub.onclose(() => setConnectionStatus('disconnected'));

    hub.start()
      .then(async () => {
        setConnectionStatus('connected');
        await hub.invoke('RegisterUser', employeeId, SENDER_EMPLOYEE).catch(() => { });
      })
      .catch(err => {
        setConnectionStatus('disconnected');
        console.error('[ChatAdmin] hub start error:', err);
      });

    hubRef.current = hub;

    return () => {
      hub.off('ReceiveMessage');
      hub.off('ChatListUpdated');
      hub.off('UserTyping');
      hub.off('UserStoppedTyping');
      hub.off('MessageRead');
      hub.stop().catch(() => { });
      hubRef.current = null;
    };
  }, [isLoggedIn, employeeId]);

  useEffect(() => {
    const hub = hubRef.current;
    if (!hub || hub.state !== signalR.HubConnectionState.Connected || !selectedRoom) return;

    hub.invoke('JoinChatRoom', selectedRoom.chatRoomId).catch(() => { });
  }, [selectedRoom]);

  const stopTyping = useCallback(() => {
    if (!isTypingRef.current) return;
    isTypingRef.current = false;
    const hub = hubRef.current;
    const room = selectedRoomRef.current;
    if (hub?.state === signalR.HubConnectionState.Connected && room) {
      hub.invoke('UserStoppedTyping', room.chatRoomId, employeeId).catch(() => { });
    }
  }, [employeeId]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !selectedRoom || isSending) return;

    setInputText('');
    setIsSending(true);
    stopTyping();

    try {
      await ChatService.sendMessage({
        chatRoomId: selectedRoom.chatRoomId,
        senderId: employeeId,
        senderType: SENDER_EMPLOYEE,
        messageContent: text,
        messageType: 0,
      });
    } catch (err) {
      setInputText(text);
      console.error('[ChatAdmin] send error:', err);
    } finally {
      setIsSending(false);
    }
  }, [inputText, selectedRoom, employeeId, isSending, stopTyping]);

  const handleInputChange = useCallback((e) => {
    const val = e.target.value;
    setInputText(val);

    const hub = hubRef.current;
    const room = selectedRoomRef.current;
    if (!hub || hub.state !== signalR.HubConnectionState.Connected || !room) return;

    if (!isTypingRef.current && val.trim()) {
      isTypingRef.current = true;
      hub.invoke('UserTyping', room.chatRoomId, employeeId, 'Nhân viên').catch(() => { });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, TYPING_TIMEOUT_MS);

    if (!val.trim()) stopTyping();
  }, [employeeId, stopTyping]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCloseRoom = async () => {
    if (!selectedRoom) return;
    if (!window.confirm('Đóng phòng chat này?')) return;
    try {
      await ChatService.closeChatRoom(selectedRoom.chatRoomId);
      setRooms(prev => prev.map(r =>
        r.chatRoomId === selectedRoom.chatRoomId ? { ...r, status: 1 } : r
      ));
      setSelectedRoom(null);
    } catch (err) {
      console.error('[ChatAdmin] closeRoom error:', err);
    }
  };

  const activeRooms = rooms.filter(r => r.status !== 1);
  const filteredRooms = activeRooms.filter(r =>
    !roomSearch || r.customerName?.toLowerCase().includes(roomSearch.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-2" />
          <p>Vui lòng đăng nhập với tài khoản nhân viên</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden" style={{ minHeight: 0 }}>
      <aside className="w-72 bg-white border-r flex flex-col flex-shrink-0">
        <div className="px-4 py-3.5 border-b bg-white flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-gray-800">Chat hỗ trợ</h2>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              {connectionStatus === 'connected'
                ? <Wifi className="w-3.5 h-3.5 text-green-500" />
                : <WifiOff className="w-3.5 h-3.5 text-red-500" />
              }
              <span className="text-[11px]">{filteredRooms.length} phòng</span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm khách hàng..."
              value={roomSearch}
              onChange={e => setRoomSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoadingRooms ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Không có phòng chat nào</div>
          ) : (
            filteredRooms.map(room => {
              const isSelected = selectedRoom?.chatRoomId === room.chatRoomId;
              return (
                <div
                  key={room.chatRoomId}
                  onClick={() => setSelectedRoom(room)}
                  className={`flex items-start gap-3 px-4 py-3.5 border-b cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
                    }`}
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                    {(room.customerName || 'K').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                        {room.customerName || 'Khách hàng'}
                      </span>
                      {room.unreadCount > 0 && (
                        <span className="ml-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 flex-shrink-0">
                          {room.unreadCount > 99 ? '99+' : room.unreadCount}
                        </span>
                      )}
                    </div>
                    {room.lastMessage && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{room.lastMessage}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {!selectedRoom ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageCircle className="w-16 h-16 mb-3" />
            <p className="text-base font-medium">Chọn một cuộc hội thoại</p>
            <p className="text-sm mt-1">để bắt đầu trò chuyện với khách hàng</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-3.5 border-b bg-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {(selectedRoom.customerName || 'K').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{selectedRoom.customerName}</p>
                  <p className="text-xs text-gray-400">{selectedRoom.roomName || `Phòng #${selectedRoom.chatRoomId}`}</p>
                </div>
              </div>
              <button
                onClick={handleCloseRoom}
                className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                Đóng phòng
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
              {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageCircle className="w-10 h-10 mb-2" />
                  <p className="text-sm">Chưa có tin nhắn nào</p>
                </div>
              ) : (
                <>
                  {messages.map(msg => (
                    <ChatMessageItem
                      key={msg.messageId}
                      message={msg}
                      isOwn={msg.senderType === SENDER_EMPLOYEE}
                    />
                  ))}

                  {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2.5 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-gray-400">{typingUsers.join(', ')} đang nhập...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="border-t bg-white px-4 py-3 flex-shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  className="flex-1 resize-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 leading-relaxed"
                  placeholder="Nhập phản hồi... (Enter để gửi)"
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  maxLength={1000}
                  disabled={isSending}
                  style={{ minHeight: '42px', maxHeight: '120px' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isSending}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                >
                  {isSending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                </button>
              </div>
              <p className="text-right text-[11px] text-gray-300 mt-1">{inputText.length}/1000</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ChatAdmin;
