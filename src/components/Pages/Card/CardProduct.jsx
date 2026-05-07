import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Url } from '../../../constants/config.js';

const CardProduct = ({ productId, name, image, description, sellingPrice }) => {
  const imageUrl = image ? `${Url}${image}` : null;
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    navigate(`/products/${productId}`);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className="w-full max-w-60 h-80 bg-white rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition mx-auto"
      onClick={handleCardClick}
    >
      <div className="relative flex-1 flex justify-center items-center bg-gray-50 p-4">
        <div className="w-36 h-36 flex items-center justify-center">
          {imageError || !imageUrl ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded">
              <span className="text-center text-gray-500 text-xs">Không có ảnh</span>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          )}
        </div>
      </div>
      
      <div className="p-4 bg-white">
        <div>
          <h3 className="font-medium text-sm text-gray-800">{name}</h3>
          <p className="font-bold text-sm mt-1">{sellingPrice} VND</p>
        </div>
      </div>
    </div>
  );
};

export default CardProduct;