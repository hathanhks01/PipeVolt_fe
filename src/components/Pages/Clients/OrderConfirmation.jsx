import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ShoppingBag, User, MapPin, CreditCard, Package } from 'lucide-react';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const success = location.state?.success;
  const orderData = location.state?.orderData;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (success) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-50 border-b border-green-200 p-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-700 mb-2">Đặt hàng thành công!</h1>
            <p className="text-green-600">
              Cảm ơn bạn đã đặt hàng tại PipeVolt. Chúng tôi sẽ liên hệ xác nhận đơn hàng sớm nhất.
            </p>
          </div>

          {/* Order Details */}
          {orderData && (
            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                  <User className="h-5 w-5 mr-2" />
                  Thông tin giao hàng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Họ tên:</span>
                    <span className="ml-2 text-gray-800">{orderData.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Số điện thoại:</span>
                    <span className="ml-2 text-gray-800">{orderData.phone}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Địa chỉ:
                    </span>
                    <span className="ml-2 text-gray-800">{orderData.address}</span>
                  </div>
                  {orderData.email && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="ml-2 text-gray-800">{orderData.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Phương thức thanh toán
                </h3>
                <p className="text-gray-800">{orderData.paymentMethod}</p>
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                  <Package className="h-5 w-5 mr-2" />
                  Chi tiết đơn hàng
                </h3>
                <div className="space-y-3">
                  {orderData.items?.map(item => (
                    <div key={item.cartItemId} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
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
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Tổng cộng:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(orderData.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">Bước tiếp theo</h4>
                <ul className="text-blue-700 space-y-1 text-sm">
                  <li>• Chúng tôi sẽ liên hệ xác nhận đơn hàng trong vòng 24 giờ</li>
                  <li>• Đơn hàng sẽ được chuẩn bị và giao trong 2-3 ngày làm việc</li>
                  <li>• Bạn sẽ nhận được thông báo khi đơn hàng được giao</li>
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                to="/products" 
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
              >
                Tiếp tục mua sắm
              </Link>
              <button
                onClick={() => navigate('/orders')}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Xem đơn hàng của tôi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-600 mb-4">Có lỗi xảy ra</h1>
        <p className="text-gray-600 mb-6">
          Đã có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại hoặc liên hệ với chúng tôi để được hỗ trợ.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link 
            to="/cart" 
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
          >
            Quay lại giỏ hàng
          </Link>
          <Link 
            to="/contact" 
            className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center font-medium"
          >
            Liên hệ hỗ trợ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;