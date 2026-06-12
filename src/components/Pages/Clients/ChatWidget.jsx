import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Wifi, WifiOff, AlertCircle, Loader2, Sparkles, User } from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import ChatService from '../../../Services/ChatService';
import ChatbotService from '../../../Services/ChatbotService';
import ChatMessageItem from '../../ChatMessageItem';
import JwtUtils from '../../../constants/JwtUtils';
import { createHubConnection } from '../../../common/signalr-common';
import { Link } from 'react-router-dom';

const TYPING_TIMEOUT_MS = 2500;
const SENDER_CUSTOMER = 2;

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [chatRoom, setChatRoom] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [authTick, setAuthTick] = useState(0);
  const [chatMode, setChatMode] = useState('ai'); // 'ai' or 'human'
  const [isBotResponding, setIsBotResponding] = useState(false);

  const connectionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const chatRoomRef = useRef(null);
  const initDoneRef = useRef(false);

  const customerId = JwtUtils.getCurrentCustomerId();
  const isLoggedIn = !!customerId;

  useEffect(() => {
    chatRoomRef.current = chatRoom;
  }, [chatRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const onOpen = () => setIsOpen(true);
    const onAuth = () => setAuthTick(v => v + 1);
    window.addEventListener('openChat', onOpen);
    window.addEventListener('authChanged', onAuth);
    return () => {
      window.removeEventListener('openChat', onOpen);
      window.removeEventListener('authChanged', onAuth);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      initDoneRef.current = false;
      setChatRoom(null);
      setMessages([]);
      setInputText('');
      setUnreadCount(0);
      setTypingUsers([]);
      setIsInitializing(false);
      connectionRef.current?.stop().catch(() => {});
      connectionRef.current = null;
    }
  }, [isLoggedIn, authTick]);

  useEffect(() => {
    if (!isOpen || !isLoggedIn || !customerId) return;
    if (initDoneRef.current && chatRoomRef.current) return;

    let cancelled = false;
    setIsInitializing(true);
    setErrorMsg(null);

    const init = async () => {
      try {
        const rooms = await ChatService.getChatRoomsForCustomer(customerId);
        let room = rooms?.[0] || null;
        if (!room) {
          room = await ChatService.createChatRoom(customerId);
        }
        if (cancelled) return;

        setChatRoom(room);
        chatRoomRef.current = room;
        initDoneRef.current = true;

        const msgs = await ChatService.getMessages(room.chatRoomId, 1, 50);
        if (!cancelled) setMessages(msgs || []);

        await ChatService.markAllMessagesAsRead(room.chatRoomId, customerId, SENDER_CUSTOMER).catch(() => {});
        if (!cancelled) setUnreadCount(0);
      } catch (err) {
        if (!cancelled) {
          initDoneRef.current = false;
          setErrorMsg('Không thể kết nối chat. Vui lòng thử lại.');
          console.error('[ChatWidget] init error:', err);
        }
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    };

    init();
    return () => { cancelled = true; };
  }, [isOpen, isLoggedIn, customerId, authTick]);

  useEffect(() => {
    if (!chatRoom || !isLoggedIn) return;

    const hub = createHubConnection();

    hub.on('ReceiveMessage', (msg) => {
      if (msg.chatRoomId !== chatRoomRef.current?.chatRoomId) return;
      setMessages(prev => {
        if (prev.some(m => m.messageId === msg.messageId)) return prev;
        return [...prev, msg];
      });
      if (isOpen && msg.senderType !== SENDER_CUSTOMER) {
        ChatService.markMessageAsRead(msg.messageId).catch(() => {});
      } else if (!isOpen) {
        setUnreadCount(c => c + 1);
      }
    });

    hub.on('MessageRead', (messageId) => {
      setMessages(prev =>
        prev.map(m => m.messageId === messageId ? { ...m, isRead: true } : m)
      );
    });

    hub.on('UserTyping', (data) => {
      if (data.senderId === customerId) return;
      setTypingUsers(prev => {
        if (prev.includes(data.senderName)) return prev;
        return [...prev, data.senderName];
      });
    });

    hub.on('UserStoppedTyping', () => {
      setTypingUsers([]);
    });

    hub.onreconnecting(() => setConnectionStatus('reconnecting'));
    hub.onreconnected(async () => {
      setConnectionStatus('connected');
      const room = chatRoomRef.current;
      if (room) await hub.invoke('JoinChatRoom', room.chatRoomId).catch(() => {});
    });
    hub.onclose(() => setConnectionStatus('disconnected'));

    hub.start()
      .then(async () => {
        setConnectionStatus('connected');
        await hub.invoke('RegisterUser', customerId, SENDER_CUSTOMER).catch(() => {});
        const room = chatRoomRef.current;
        if (room) await hub.invoke('JoinChatRoom', room.chatRoomId).catch(() => {});
      })
      .catch(err => {
        setConnectionStatus('disconnected');
        console.error('[ChatWidget] SignalR start error:', err);
      });

    connectionRef.current = hub;

    return () => {
      hub.off('ReceiveMessage');
      hub.off('MessageRead');
      hub.off('UserTyping');
      hub.off('UserStoppedTyping');
      hub.stop().catch(() => {});
      connectionRef.current = null;
    };
  }, [chatRoom, isLoggedIn, customerId, isOpen]);

  useEffect(() => {
    if (isOpen && chatRoom && customerId) {
      ChatService.markAllMessagesAsRead(chatRoom.chatRoomId, customerId, SENDER_CUSTOMER).catch(() => {});
      setUnreadCount(0);
    }
  }, [isOpen, chatRoom, customerId]);

  const handleClose = () => {
    setIsOpen(false);
    setUnreadCount(0);
  };

  const retryInit = () => {
    initDoneRef.current = false;
    setChatRoom(null);
    chatRoomRef.current = null;
    setErrorMsg(null);
    setAuthTick(v => v + 1);
  };

  const stopTyping = useCallback(() => {
    if (!isTypingRef.current) return;
    isTypingRef.current = false;
    const hub = connectionRef.current;
    const room = chatRoomRef.current;
    if (hub?.state === signalR.HubConnectionState.Connected && room) {
      hub.invoke('UserStoppedTyping', room.chatRoomId, customerId).catch(() => {});
    }
  }, [customerId]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !chatRoom || isSending || isInitializing) return;

    setInputText('');
    setIsSending(true);
    setErrorMsg(null);
    stopTyping();

    try {
      await ChatService.sendMessage({
        chatRoomId: chatRoom.chatRoomId,
        senderId: customerId,
        senderType: SENDER_CUSTOMER,
        messageContent: text,
        messageType: 0,
      });

      if (chatMode === 'ai') {
        setIsBotResponding(true);
        try {
          await ChatbotService.sendMessage({
            chatRoomId: chatRoom.chatRoomId,
            message: text,
            senderId: customerId,
            senderType: SENDER_CUSTOMER,
          });
        } catch (botErr) {
          console.error('[ChatWidget] chatbot error:', botErr);
        } finally {
          setIsBotResponding(false);
        }
      }
    } catch (err) {
      setInputText(text);
      setErrorMsg('Gửi tin nhắn thất bại. Thử lại.');
      console.error('[ChatWidget] send error:', err);
    } finally {
      setIsSending(false);
    }
  }, [inputText, chatRoom, customerId, isSending, isInitializing, stopTyping, chatMode]);

  const handleInputChange = useCallback((e) => {
    const val = e.target.value;
    setInputText(val);

    const hub = connectionRef.current;
    const room = chatRoomRef.current;
    if (!hub || hub.state !== signalR.HubConnectionState.Connected || !room) return;

    if (!isTypingRef.current && val.trim()) {
      isTypingRef.current = true;
      hub.invoke('UserTyping', room.chatRoomId, customerId, 'Khách hàng').catch(() => {});
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, TYPING_TIMEOUT_MS);

    if (!val.trim()) stopTyping();
  }, [customerId, stopTyping]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const ConnectionIcon = connectionStatus === 'connected'
    ? <Wifi className="w-3.5 h-3.5 text-green-400" />
    : connectionStatus === 'reconnecting'
      ? <WifiOff className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
      : <WifiOff className="w-3.5 h-3.5 text-red-400" />;

  const statusText = connectionStatus === 'connected' ? 'Đang kết nối'
    : connectionStatus === 'reconnecting' ? 'Đang kết nối lại...'
    : 'Mất kết nối';

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          aria-label="Mở chat hỗ trợ"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[360px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden"
          style={{ height: '520px' }}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-blue-600 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Hỗ trợ khách hàng</p>
                <div className="flex items-center gap-1 text-xs text-blue-100">
                  {ConnectionIcon}
                  <span>{statusText}</span>
                </div>
              </div>
            </div>
            <button onClick={handleClose} className="text-white/80 hover:text-white transition p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Mode Toggle */}
          <div className="flex p-1 bg-gray-50 border-b border-gray-100 flex-shrink-0">
            <button
              onClick={() => setChatMode('ai')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                chatMode === 'ai'
                  ? 'bg-white text-blue-600 shadow-sm border border-gray-200/30'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Trợ lý AI
            </button>
            <button
              onClick={() => setChatMode('human')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                chatMode === 'human'
                  ? 'bg-white text-blue-600 shadow-sm border border-gray-200/30'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Nhân viên hỗ trợ
            </button>
          </div>

          {errorMsg && (
            <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 flex items-center gap-2 flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="text-xs text-amber-700 flex-1">{errorMsg}</span>
              <button onClick={retryInit} className="text-xs text-amber-700 underline hover:text-amber-900">
                Thử lại
              </button>
              <button onClick={() => setErrorMsg(null)} className="text-amber-400 hover:text-amber-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {!isLoggedIn ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-gray-500 text-sm text-center">
              <MessageCircle className="w-10 h-10 text-gray-300" />
              <p>Vui lòng đăng nhập tài khoản khách hàng để chat với nhân viên hỗ trợ.</p>
              <Link
                to="/login"
                onClick={handleClose}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-3 py-3 bg-gray-50">
                {isInitializing ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                    <Loader2 className="w-7 h-7 animate-spin" />
                    <span className="text-sm">Đang tải...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                    <MessageCircle className="w-10 h-10" />
                    <p className="text-sm text-center">
                      Xin chào! Chúng tôi sẵn sàng hỗ trợ bạn.<br />Hãy gửi tin nhắn để bắt đầu.
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <ChatMessageItem
                        key={msg.messageId}
                        message={msg}
                        isOwn={msg.senderType === SENDER_CUSTOMER}
                      />
                    ))}

                    {typingUsers.length > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2.5 shadow-sm">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-gray-400">{typingUsers.join(', ')} đang nhập...</span>
                      </div>
                    )}

                    {isBotResponding && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-1 bg-blue-50 border border-blue-100 rounded-2xl rounded-bl-sm px-3 py-2.5 shadow-sm">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-blue-500 font-medium">Trợ lý AI đang trả lời...</span>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <div className="border-t bg-white px-3 py-3 flex-shrink-0">
                <div className="flex items-end gap-2">
                  <textarea
                    className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 max-h-24 leading-relaxed"
                    placeholder={chatRoom ? 'Nhập tin nhắn... (Enter để gửi)' : 'Đang khởi tạo...'}
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={!chatRoom || isInitializing}
                    rows={1}
                    maxLength={1000}
                    style={{ minHeight: '42px' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim() || !chatRoom || isSending || isInitializing}
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                    aria-label="Gửi"
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
        </div>
      )}
    </>
  );
};

export default ChatWidget;
