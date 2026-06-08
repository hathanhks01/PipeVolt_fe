import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductService from '../../../Services/ProductService';
import CartService from '../../../Services/CartService';
import JwtUtils from '../../../constants/JwtUtils';
import { Url } from '../../../constants/config';
import Login from '../Auth/Login';
import { ArrowLeft } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [adding, setAdding] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'addToCart' or 'buyNow'

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
    
    const customerId = JwtUtils.getCurrentCustomerId();
    if (!customerId) {
      setPendingAction('addToCart');
      setShowLoginModal(true);
      return;
    }
    
    setAdding(true);
    try {
      await CartService.addItemToCart(customerId, { productId: product.productId, quantity });
      alert('Đã thêm vào giỏ hàng!');
    } catch (error) {
      alert('Thêm vào giỏ hàng thất bại!');
    }
    setAdding(false);
  };

  const handleBuyNow = async () => {
    if (quantity < 1) return;
    
    const customerId = JwtUtils.getCurrentCustomerId();
    if (!customerId) {
      setPendingAction('buyNow');
      setShowLoginModal(true);
      return;
    }
    
    setBuyingNow(true);
    try {
      const cart = await CartService.addItemToCart(customerId, { productId: product.productId, quantity });
      const cartItem = cart?.cartItems?.find(i => i.productId === product.productId)
        || cart?.cartItems?.[cart.cartItems.length - 1];
      const selectedCartItems = [{
        cartItemId: cartItem?.cartItemId || cartItem?.id,
        productName: product.productName,
        quantity,
        lineTotal: product.sellingPrice * quantity,
      }];
      navigate('/checkout', { state: { selectedCartItems } });
    } catch (error) {
      alert('Không thể xử lý. Vui lòng thử lại!');
    }
    setBuyingNow(false);
  };

  const handleDecrease = () => {
    setQuantity(q => (q > 1 ? q - 1 : 1));
  };

  const handleIncrease = () => {
    setQuantity(q => q + 1);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setPendingAction(null);
    // Tự động thực hiện hành động pending sau khi đăng nhập
    if (pendingAction === 'addToCart') {
      setTimeout(() => handleAddToCart(), 100);
    } else if (pendingAction === 'buyNow') {
      setTimeout(() => handleBuyNow(), 100);
    }
  };

  if (!product) {
    return <div className="p-8 text-center text-gray-500">Đang tải sản phẩm...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 bg-white rounded-lg shadow mt-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 font-medium group"
      >
        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        Quay lại
      </button>
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
                  max={product.quantity || 1}
                  value={quantity}
                  onChange={e => setQuantity(
                    Math.max(1, Math.min(Number(e.target.value), product.quantity || 1))
                  )}
                  className="w-12 text-center border-l border-r outline-none"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                />
                <button
                  onClick={() => setQuantity(q => Math.min(q + 1, product.quantity || 1))}
                  className="px-3 py-1 text-lg text-gray-600 hover:bg-gray-100"
                  type="button"
                  disabled={quantity >= (product.quantity || 1)}
                >+</button>
              </div>
          
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={adding || buyingNow}
              className="flex-1 px-6 py-2 border-2 border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition disabled:opacity-60"
            >
              {adding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={adding || buyingNow}
              className="flex-1 px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition disabled:opacity-60"
            >
              {buyingNow ? 'Đang xử lý...' : 'Mua ngay'}
            </button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
            <Login
              isModal={true}
              onClose={() => {
                setShowLoginModal(false);
                setPendingAction(null);
              }}
              onLoginSuccess={handleLoginSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;