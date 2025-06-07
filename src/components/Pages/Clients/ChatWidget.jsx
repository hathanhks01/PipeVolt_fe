import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import ChatService from '../../../Services/ChatService';
import JwtUtils from '../../../constants/JwtUtils';
import { Url } from '../../../constants/config';
const SIGNALR_URL = `${Url}chathub`;

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatRoom, setChatRoom] = useState(null);
  const [connection, setConnection] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesRef = useRef(messages);

  const customerId = JwtUtils.getCurrentUserId();

  // Giữ messages mới nhất cho callback SignalR
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Tự động scroll khi có tin nhắn mới
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Khi mở chat, tạo/lấy phòng chat
  useEffect(() => {
    if (!open || !customerId) return;
    let isMounted = true;

    const startChat = async () => {
      let room = null;
      try {
        const rooms = await ChatService.getChatRoomsForCustomer(customerId);
        if (rooms && rooms.length > 0) {
          room = rooms[0];
        } else {
          room = await ChatService.createChatRoom(customerId);
        }
        if (!isMounted) return;
        setChatRoom(room);

        // Lấy lịch sử tin nhắn
        const msgs = await ChatService.getMessages(room.chatRoomId);
        if (!isMounted) return;
        setMessages(msgs);
      } catch (err) {}
    };

    startChat();

    return () => { isMounted = false; };
  }, [open, customerId]);

  // Kết nối SignalR khi đã có chatRoom
  useEffect(() => {
    if (!chatRoom) return;
    let hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_URL)
      .withAutomaticReconnect()
      .build();

    const handleReceive = (msg) => {
      setMessages([...messagesRef.current, msg]);
    };

    hubConnection.on('ReceiveMessage', handleReceive);

    hubConnection.start()
      .then(() => hubConnection.invoke('JoinChatRoom', chatRoom.chatRoomId))
      .catch(() => {});

    setConnection(hubConnection);

    return () => {
      hubConnection.off('ReceiveMessage', handleReceive);
      hubConnection.stop();
    };
  }, [chatRoom]);

  // Gửi tin nhắn
  const handleSend = async () => {
    if (!input.trim() || !chatRoom) return;
    const messageDto = {
      chatRoomId: chatRoom.chatRoomId,
      senderId: customerId,
      senderType: 1,
      messageContent: input,
      messageType: 0
    };
    await ChatService.sendMessage(messageDto);
    setInput('');
    // Tin nhắn sẽ được nhận lại qua SignalR và thêm vào messages
  };

  return (
    <div>
      {/* Nút chat nổi */}
      {!open && (
        <button
          className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg z-50 hover:bg-blue-700 transition"
          onClick={() => setOpen(true)}
          aria-label="Mở chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Popup chat */}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 bg-white rounded-xl shadow-2xl z-50 flex flex-col border border-blue-200">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-blue-600 rounded-t-xl">
            <span className="text-white font-semibold">Hỗ trợ khách hàng</span>
            <button onClick={() => setOpen(false)} className="text-white hover:text-gray-200">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ maxHeight: 320 }}>
            {messages.map((msg, idx) => (
              <div
                key={msg.messageId || idx}
                className={`flex ${msg.senderType === 1 ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-3 py-2 rounded-lg text-sm ${
                    msg.senderType === 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.messageContent}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex border-t p-2 bg-gray-50">
            <input
              type="text"
              className="flex-1 px-3 py-2 rounded-l-lg border border-gray-300 focus:outline-none"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              disabled={!chatRoom}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition"
              onClick={handleSend}
              disabled={!input.trim() || !chatRoom}
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;