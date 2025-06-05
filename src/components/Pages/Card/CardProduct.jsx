import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Url } from '../../../constants/config.js';

const CardProduct = ({ productId, name, image, description, sellingPrice }) => {
  const imageUrl = `${Url}${image || ''}`;
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/products/${productId}`);
  };

  return (
    <div
      className="w-full max-w-60 h-80 bg-white rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition mx-auto"
      onClick={handleCardClick}
    >
      <div className="relative flex-1 flex justify-center items-center bg-gray-50 p-4">
        <div className="w-36 h-36 flex items-center justify-center">
          <img
            src={imageUrl}
            alt="Product"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      <div className="p-4 bg-white">
        <div>
          <h3 className="font-medium text-sm text-gray-800">{name}</h3>
          <p className="text-xs text-gray-500">{description}</p>
          <p className="font-bold text-sm mt-1">{sellingPrice} VND</p>
        </div>
      </div>
    </div>
  );
};

export default CardProduct;