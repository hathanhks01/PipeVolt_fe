import React, { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Package, AlertCircle, CheckCircle2 } from 'lucide-react';
import CartItemService from '../../../Services/CartItemService';
import JwtUtils from '../../../constants/JwtUtils';
import { useNavigate } from 'react-router-dom';
const CartItemList = ({ cartId = 1 }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [notification, setNotification] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Load cart items
  useEffect(() => {
    loadCartItems();
  }, [cartId]);
 const navigate = useNavigate();
 
  const loadCartItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = JwtUtils.getCurrentUserId();
      const data = await CartItemService.getCartItems(userId);
      setCartItems(data || []);
      setSelectedItems(new Set());
      setSelectAll(false);
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm trong giỏ hàng');
      console.error('Error loading cart items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Update quantity
  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setUpdatingItems(prev => new Set([...prev, cartItemId]));
      const success = await CartItemService.updateCartItem({
        cartItemId: cartItemId,
        quantity: newQuantity,
      });
      if (success) {
        await loadCartItems();
        showNotification('Cập nhật số lượng thành công');
      } else {
        showNotification('Không tìm thấy sản phẩm trong giỏ hàng', 'error');
      }
    } catch (err) {
      showNotification('Lỗi khi cập nhật số lượng', 'error');
      console.error('Error updating quantity:', err);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  // Remove item
  const removeItem = async (cartItemId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      return;
    }
    try {
      setUpdatingItems(prev => new Set([...prev, cartItemId]));
      const success = await CartItemService.deleteCartItem(cartItemId);
      if (success) {
        await loadCartItems();
        showNotification('Đã xóa sản phẩm khỏi giỏ hàng');
      } else {
        showNotification('Không tìm thấy sản phẩm để xóa', 'error');
      }
    } catch (err) {
      showNotification('Lỗi khi xóa sản phẩm', 'error');
      console.error('Error removing item:', err);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  // Remove selected items (bulk delete)
  const removeSelectedItems = async () => {
    if (selectedItems.size === 0) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa các sản phẩm đã chọn khỏi giỏ hàng?')) return;
    try {
      setLoading(true);
      for (const cartItemId of selectedItems) {
        await CartItemService.deleteCartItem(cartItemId);
      }
      await loadCartItems();
      showNotification('Đã xóa các sản phẩm đã chọn khỏi giỏ hàng');
    } catch (err) {
      showNotification('Lỗi khi xóa sản phẩm', 'error');
      console.error('Error removing selected items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle individual item selection
  const handleSelectItem = (cartItemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cartItemId)) {
        newSet.delete(cartItemId);
      } else {
        newSet.add(cartItemId);
      }
      setSelectAll(newSet.size === cartItems.length && cartItems.length > 0);
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      const allItemIds = new Set(cartItems.map(item => item.cartItemId));
      setSelectedItems(allItemIds);
      setSelectAll(true);
    }
  };

  // Calculate total for selected items
  const calculateTotal = () => {
    return cartItems
      .filter(item => selectedItems.has(item.cartItemId))
      .reduce((total, item) => total + (item.lineTotal || 0), 0);
  };

  // Calculate total quantity for selected items
  const calculateSelectedQuantity = () => {
    return cartItems
      .filter(item => selectedItems.has(item.cartItemId))
      .reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

const handleCheckout = () => {
  const selectedCartItems = cartItems.filter(item => selectedItems.has(item.cartItemId));
  if (selectedCartItems.length === 0) {
    showNotification('Vui lòng chọn ít nhất một sản phẩm để thanh toán', 'error');
    return;
  }
  // Sử dụng react-router-dom navigate để chuyển trang và truyền state
  navigate('/checkout', { state: { selectedCartItems } });
};
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải giỏ hàng...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadCartItems}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white pb-24">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center mb-6">
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleSelectAll}
          className="mr-3 h-5 w-5 text-blue-600 rounded"
          ref={el => {
            if (el) {
              el.indeterminate = cartItems.length > 0 && selectedItems.size > 0 && selectedItems.size < cartItems.length;
            }
          }}
        />
        <ShoppingCart className="h-8 w-8 text-blue-600 mr-3" />
        <h1 className="text-2xl font-bold text-gray-800">Giỏ hàng của bạn</h1>
        <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
          {cartItems.length} sản phẩm
        </span>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Giỏ hàng trống</h3>
          <p className="text-gray-500">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div
                key={item.cartItemId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.cartItemId)}
                      onChange={() => handleSelectItem(item.cartItemId)}
                      className="mr-3 h-5 w-5 text-blue-600 rounded"
                      disabled={updatingItems.has(item.cartItemId)}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {item.productName || 'Tên sản phẩm không có'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Mã sản phẩm: #{item.productId}
                      </p>
                      <p className="text-blue-600 font-semibold">
                        {formatCurrency(item.unitPrice || 0)} / sản phẩm
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updatingItems.has(item.cartItemId)}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="px-4 py-2 min-w-[60px] text-center font-medium">
                        {updatingItems.has(item.cartItemId) ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                        ) : (
                          item.quantity || 0
                        )}
                      </span>

                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        disabled={updatingItems.has(item.cartItemId)}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right min-w-[120px]">
                      <p className="font-bold text-lg text-gray-800">
                        {formatCurrency(item.lineTotal || 0)}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => removeItem(item.cartItemId)}
                      disabled={updatingItems.has(item.cartItemId)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary - Fixed at Bottom */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-gray-600">Sản phẩm đã chọn: {selectedItems.size}</p>
                  <p className="text-gray-600">
                    Tổng số lượng: {calculateSelectedQuantity()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Tổng cộng:</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(calculateTotal())}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => window.location.href = '/products'}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Tiếp tục mua sắm
                </button>
                <button
                  onClick={removeSelectedItems}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={selectedItems.size === 0}
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Xóa đã chọn
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedItems.size === 0}
                >
                  Tiến hành thanh toán
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartItemList;