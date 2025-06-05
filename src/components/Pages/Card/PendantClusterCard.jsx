import React from 'react';
import { Url } from '../../../constants/config';
const PendantClusterCard = ({ name, image, sellingPrice }) => {
  return (
    <div className="w-72 h-32 bg-white rounded-xl shadow-md overflow-hidden flex">
      {/* Left side - Image container */}
      <div className="w-1/2 bg-gray-50 flex items-center justify-center p-2">
        {/* Nếu có image thì hiển thị, không thì fallback dùng SVG giả lập */}
        {image ? (
          <img
            src={Url+image}
            alt={name}
            className="h-20 object-contain"
          />
        ) : (
          <div className="relative h-24 w-24">
            {/* SVG như bạn đã có */}
            {/* ... giữ nguyên SVG 3 chiếc đèn như trong code gốc ... */}
          </div>
        )}
      </div>

      {/* Right side - Product details */}
      <div className="w-1/2 p-4 flex flex-col justify-center">
        <h3 className="font-medium text-gray-800 text-sm truncate">{name}</h3>
        <p className="text-xs text-gray-500">EGLO</p>
        <p className="font-bold mt-2">${sellingPrice}</p>
      </div>
    </div>
  );
};

export default PendantClusterCard;
