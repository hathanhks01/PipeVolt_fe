import React from 'react';
import { Check, CheckCheck, Package, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Url } from '../constants/config';

const ChatMessageItem = ({ message, isOwn }) => {
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const renderContent = () => {
    switch (message.messageType) {
      case 1: // Product card
        return message.productData ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {message.productData.imageUrl && (
              <img
                src={`${Url}${message.productData.imageUrl}`}
                alt={message.productData.productName}
                className="w-full h-40 object-cover"
                onError={(e) => { e.target.src = '/no-image.png'; }}
              />
            )}
            <div className="p-3">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {message.productData.productName}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {message.productData.price?.toLocaleString('vi-VN')}đ
              </div>
              {message.productData.unit && (
                <div className="text-xs text-gray-500 mt-1">/{message.productData.unit}</div>
              )}
              <div className="mt-2">
                <Link to={`/products/${message.productData.productId}`} className="text-blue-600 text-xs font-medium hover:underline">
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-700">
            <Package className="h-4 w-4" />
            {message.messageContent}
          </div>
        );

      case 2:
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <LinkIcon className="h-4 w-4" />
            <Link to={message.attachmentUrl || '#'} className="text-sm hover:underline">
              {message.messageContent}
            </Link>
          </div>
        );

      case 3:
        return (
          <div className="max-w-xs">
            <img
              src={message.attachmentUrl}
              alt="Image message"
              className="rounded-lg max-w-full"
              onError={(e) => { e.target.src = '/no-image.png'; }}
            />
          </div>
        );

      default:
        return <p className="break-words">{message.messageContent}</p>;
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[80%] ${isOwn ? 'text-white' : 'text-gray-900'}`}>
        {!isOwn && message.senderName && <div className="text-xs text-gray-500 mb-1">{message.senderName}</div>}
        <div className={`rounded-3xl px-4 py-3 shadow-sm ${isOwn ? 'bg-blue-600 rounded-br-none' : 'bg-gray-100 rounded-bl-none'}`}>
          {renderContent()}
          <div className={`mt-2 flex items-center gap-2 text-[11px] ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
            <span>{formatTime(message.sentAt)}</span>
            {isOwn && (message.isRead ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageItem;
