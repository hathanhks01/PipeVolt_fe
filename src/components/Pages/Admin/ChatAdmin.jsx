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
  const [connection, setConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const employeeId = JwtUtils.getCurrentUserId();

  // Lấy danh sách phòng chat
  useEffect(() => {
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

  // Lấy tin nhắn khi chọn phòng
  useEffect(() => {
    if (!selectedRoom) return;
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const msgs = await ChatService.getMessages(selectedRoom.chatRoomId, 1, 50);
        setMessages(msgs || []);
      } catch {
        setMessages([]);
      }
      setIsLoading(false);
    };
    fetchMessages();
  }, [selectedRoom]);

  // Kết nối SignalR khi chọn phòng
  useEffect(() => {
    if (!selectedRoom) return;
    let hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_URL)
      .withAutomaticReconnect()
      .build();

    const handleReceiveMessage = (msg) => {
      setMessages(prev => {
        if (prev.some(m => m.messageId === msg.messageId)) return prev;
        return [...prev, msg];
      });
    };

    hubConnection.on('ReceiveMessage', handleReceiveMessage);

    hubConnection.start()
      .then(() => {
        setConnectionStatus('connected');
        hubConnection.invoke('JoinChatRoom', selectedRoom.chatRoomId);
      })
      .catch(() => setConnectionStatus('disconnected'));

    setConnection(hubConnection);

    return () => {
      hubConnection.off('ReceiveMessage', handleReceiveMessage);
      hubConnection.stop();
    };
  }, [selectedRoom]);

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
        senderType: 2, // 2 = Employee
        messageContent: input.trim(),
        messageType: 0
      });
      setInput('');
    } catch {
      setError('Không thể gửi tin nhắn');
    }
  }, [input, selectedRoom, employeeId]);

  // Enter để gửi
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
            {selectedRoom ? selectedRoom.roomName : 'Chọn phòng chat'}
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
                  className={`flex ${msg.senderType === 2 ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg text-sm max-w-xs break-words shadow-sm ${msg.senderType === 2
                        ? 'bg-green-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 border rounded-bl-sm'
                      }`}
                  >
                    <div>{msg.messageContent}</div>
                    <div className={`text-xs mt-1 ${msg.senderType === 2 ? 'text-green-100' : 'text-gray-400'}`}>
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
                onChange={e => setInput(e.target.value)}
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