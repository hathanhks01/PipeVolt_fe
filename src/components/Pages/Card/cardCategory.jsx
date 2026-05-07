import React, { useState } from 'react';
import { Url } from '../../../constants/config.js';

const CardCategory = ({ src, name }) => {
  const srcImg = src ? `${Url}${src}` : null;
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="w-32 h-40 border border-gray-100 rounded flex flex-col items-center justify-start overflow-hidden p-2 hover:border-gray-400 transition-colors">
      {imageError || !srcImg ? (
        <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-xs text-gray-500">Không có ảnh</span>
        </div>
      ) : (
        <img
          src={srcImg}
          alt={name || 'Category'}
          className="w-full h-24 object-contain rounded"
          onError={handleImageError}
        />
      )}
      {name && (
        <p className="text-sm text-gray-800 text-center mt-2 leading-tight whitespace-normal">
          {name}
        </p>
      )}
    </div>
  );
};

export default CardCategory;