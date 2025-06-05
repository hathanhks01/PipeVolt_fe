import React from 'react';
import { Url } from '../../../constants/config.js';

const CardCategory = ({ src, name }) => {
  const srcImg = src ? `${Url}${src}` : '/path/to/default-image.jpg';

  return (
    <div className="w-32 h-40 border border-gray-100 rounded flex flex-col items-center justify-start overflow-hidden p-2 hover:border-gray-400 transition-colors">
      <img
        src={srcImg}
        alt={name || 'Category'}
        className="w-full h-24 object-contain rounded"
        onError={(e) => (e.target.src = '/path/to/default-image.jpg')}
      />
      {name && (
        <p className="text-sm text-gray-800 text-center mt-2 leading-tight whitespace-normal">
          {name}
        </p>
      )}
    </div>
  );
};

export default CardCategory;