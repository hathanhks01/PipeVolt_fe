import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Package, Link as LinkIcon, Image as ImageIcon, Check, CheckCheck } from 'lucide-react';
import { Url } from '../constants/config';

const ChatMessageItem = ({ message, isOwn }) => {
  const renderMessageContent = () => {
    switch (message.messageType) {
      case 1: // Product message
        return message.productData ? (
          <div className="max-w-xs bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
            {message.productData.imageUrl && (
              <img
                src={`${Url}${message.productData.imageUrl}`}
                alt={message.productData.productName}
                className="w-full h-40 object-cover"
                onError={(e) => { e.target.src = '/no-image.png'; }}
              />
            )}
            <div className="p-3">
              <Link
                to={`/products/${message.productData.productId}`}
                className="block text-sm font-semibold text-blue-600 hover:text-blue-700 truncate"
              >
                {message.productData.productName}
              </Link>
              <div className="text-sm text-gray-600 mt-1">
                {message.productData.price?.toLocaleString('vi-VN')}đ
              </div>
              {message.productData.unit && (
                <div className="text-xs text-gray-500 mt-1">
                  / {message.productData.unit}
                </div>
              )}
              {message.productData.quantity !== undefined && (
                <div className="text-xs text-gray-500 mt-1">
                  Còn: {message.productData.quantity}
                </div>
              )}
              <button
                onClick={() => window.location.href = `/products/${message.productData.productId}`}
                className="mt-2 w-full bg-blue-600 text-white text-xs py-1 rounded hover:bg-blue-700 transition"
              >
                Xem Chi Tiết
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-700">
            <Package className="h-4 w-4" />
            {message.messageContent}
          </div>
        );

      case 2: // Link message
        return (
          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            <Link
              to={message.attachmentUrl || '#'}
              className="text-blue-600 hover:underline text-sm"
            >
              {message.messageContent}
            </Link>
          </div>
        );

      case 3: // Image message
        return (
          <div className="max-w-xs">
            <img
              src={message.attachmentUrl}
              alt="Sent image"
              className="rounded-lg max-w-full"
              onError={(e) => { e.target.src = '/no-image.png'; }}
            />
          </div>
        );

      default: // Text message
        return (
          <p className="break-words">{message.messageContent}</p>
        );
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`flex gap-2 items-end max-w-xs`}>
        {!isOwn && (
          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs flex-shrink-0">
            {message.senderName?.charAt(0)}
          </div>
        )}
        <div>
          {!isOwn && (
            <div className="text-xs text-gray-500 mb-1 px-2">
              {message.senderName}
            </div>
          )}
          <div
            className={`px-3 py-2 rounded-lg ${
              isOwn
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}
          >
            {renderMessageContent()}
            <div className={`text-xs mt-1 flex items-center gap-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
              <span>{new Date(message.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
              {isOwn && (
                <>
                  {message.isRead ? (
                    <CheckCheck className="h-3 w-3" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageItem;
