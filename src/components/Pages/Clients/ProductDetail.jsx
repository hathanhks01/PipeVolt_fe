import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductService from '../../../Services/ProductService';
import CartItemService from '../../../Services/CartItemService';
import JwtUtils from '../../../constants/JwtUtils';
import { Url } from '../../../constants/config';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await ProductService.getProductById(id);
        setProduct(res.data || res);
      } catch (error) {
        setProduct(null);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (quantity < 1) return;
    setAdding(true);
    try {
      const userId = JwtUtils.getCurrentUserId();
      if (!userId) {
        window.location.href = '/login';
        return;
      }
      await CartItemService.addCartItem(userId, { productId: product.productId, quantity });
      alert('Đã thêm vào giỏ hàng!');
    } catch (error) {
      alert('Thêm vào giỏ hàng thất bại!');
    }
    setAdding(false);
  };

  const handleDecrease = () => {
    setQuantity(q => (q > 1 ? q - 1 : 1));
  };

  const handleIncrease = () => {
    setQuantity(q => q + 1);
  };

  if (!product) {
    return <div className="p-8 text-center text-gray-500">Đang tải sản phẩm...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 bg-white rounded-lg shadow mt-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0 flex justify-center items-center md:w-1/2">
          <img
            src={Url + (product.imageUrl || '')}
            alt={product.productName}
            className="w-64 h-64 object-cover rounded-lg border"
          />
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.productName}</h1>
            <p className="text-gray-700 mb-4">{product.description}</p>
            <div className="mb-2">
              <span className="font-semibold">Giá bán: </span>
              <span className="text-lg text-blue-600 font-bold">{product.sellingPrice?.toLocaleString()} VND</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Đơn vị: </span>
              <span>{product.unit || '---'}</span>
            </div>
            <div className="mb-2 flex items-center gap-3">
              <span className="font-semibold">Số lượng</span>
              <div className="flex border rounded overflow-hidden">
                <button
                  onClick={handleDecrease}
                  className="px-3 py-1 text-lg text-gray-600 hover:bg-gray-100"
                  disabled={quantity <= 1}
                  type="button"
                >-</button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-12 text-center border-l border-r outline-none"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                />
                <button
                  onClick={handleIncrease}
                  className="px-3 py-1 text-lg text-gray-600 hover:bg-gray-100"
                  type="button"
                >+</button>
              </div>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-60"
          >
            {adding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;