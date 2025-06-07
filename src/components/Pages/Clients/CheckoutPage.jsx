import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ShoppingBag, CreditCard, User, MapPin, Mail, Phone, FileText } from 'lucide-react';
import CheckoutService from '../../../Services/CheckoutService';
import CustomerService from '../../../Services/CustomerService';
import JwtUtils from '../../../constants/JwtUtils';

const paymentMethods = [
  { id: 1, name: 'Thanh toán khi nhận hàng (COD)', icon: '💵' },
  { id: 2, name: 'Chuyển khoản ngân hàng', icon: '🏦' },
  { id: 3, name: 'Thanh toán qua ví điện tử', icon: '📱' },
];

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCartItems = location.state?.selectedCartItems || [];

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
  });
  const [paymentMethodId, setPaymentMethodId] = useState(paymentMethods[0].id);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Lấy thông tin khách hàng từ Profile
  useEffect(() => {
    const userId = JwtUtils.getCurrentUserId();
    if (userId) {
      CustomerService.getCustomerByUserId(userId)
        .then(data => {
          setCustomerInfo({
            name: data.customerName || '',
            phone: data.phone || '',
            address: data.address || '',
            email: data.email || '',
          });
        })
        .catch(() => {
          // Nếu lỗi thì giữ form trống
        });
    }
  }, []);

  // Tính tổng tiền
  const total = selectedCartItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!customerInfo.name.trim()) {
      setError('Vui lòng nhập họ tên');
      return false;
    }
    if (!customerInfo.phone.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return false;
    }
    if (!customerInfo.address.trim()) {
      setError('Vui lòng nhập địa chỉ nhận hàng');
      return false;
    }
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(customerInfo.phone.replace(/\s/g, ''))) {
      setError('Số điện thoại không hợp lệ');
      return false;
    }
    if (customerInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      setError('Email không hợp lệ');
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const customerId = JwtUtils.getCurrentUserId();
      if (!customerId) {
        throw new Error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      }

      // Lấy danh sách cartItemId đã chọn
      const cartItemIds = selectedCartItems.map(item => item.cartItemId);

      await CheckoutService.checkoutPartial(customerId, paymentMethodId, cartItemIds);

      showNotification('Đặt hàng thành công!', 'success');

      setTimeout(() => {
        navigate('/order-confirmation', {
          state: {
            success: true,
            orderData: {
              ...customerInfo,
              total,
              paymentMethod: paymentMethods.find(pm => pm.id === paymentMethodId)?.name,
              items: selectedCartItems
            }
          }
        });
      }, 1500);

    } catch (err) {
      console.error('Checkout error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (!selectedCartItems.length) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-8 text-center bg-white rounded-lg shadow-md">
        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">Không có sản phẩm nào để thanh toán</h3>
        <p className="text-gray-500 mb-4">Vui lòng quay lại giỏ hàng và chọn sản phẩm</p>
        <button
          onClick={() => navigate('/cart')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Quay lại giỏ hàng
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center max-w-sm ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          )}
          <span className="text-sm">{notification.message}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
          <CreditCard className="h-7 w-7 text-blue-600 mr-3" />
          Xác nhận đơn hàng
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
              <User className="h-5 w-5 mr-2" />
              Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={customerInfo.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nhập họ tên"
                />
              </div>
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium mb-2 text-gray-700">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Địa chỉ nhận hàng <span className="text-red-500">*</span>
                </label>
                <input
                  name="address"
                  value={customerInfo.address}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nhập địa chỉ nhận hàng"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium mb-2 text-gray-700">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email (tùy chọn)
                </label>
                <input
                  name="email"
                  value={customerInfo.email}
                  onChange={handleChange}
                  type="email"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nhập email (không bắt buộc)"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
              <CreditCard className="h-5 w-5 mr-2" />
              Phương thức thanh toán
            </h3>
            <div className="space-y-3">
              {paymentMethods.map(pm => (
                <label key={pm.id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white transition-colors">
                  <input
                    type="radio"
                    value={pm.id}
                    checked={paymentMethodId === pm.id}
                    onChange={e => setPaymentMethodId(Number(e.target.value))}
                    className="mr-3 h-4 w-4 text-blue-600"
                  />
                  <span className="mr-2 text-xl">{pm.icon}</span>
                  <span className="font-medium text-gray-800">{pm.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="bg-gray-50 rounded-lg p-6">
            <label className="block font-medium mb-2 text-gray-700">
              <FileText className="inline h-4 w-4 mr-1" />
              Ghi chú đơn hàng
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Ghi chú cho đơn hàng (nếu có)"
              rows={3}
            />
          </div>

          {/* Order Summary */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold mb-4 text-gray-800 flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Tóm tắt đơn hàng
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {selectedCartItems.map(item => (
                <div key={item.cartItemId} className="flex justify-between items-center py-2 border-b border-blue-100 last:border-b-0">
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">{item.productName}</span>
                    <span className="text-gray-600 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-blue-200 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">Tổng cộng:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Quay lại giỏ hàng
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận đặt hàng'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;