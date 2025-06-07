import React, { useEffect, useState } from 'react';
import { FileText, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';
import SalesOrderService from '../../../Services/SalesOrderService';
import JwtUtils from '../../../constants/JwtUtils';

// Map int status to string key
const statusIntToKey = {
  0: 'Pending',
  1: 'Processing',
  2: 'Shipping',
  3: 'Completed',
  4: 'Cancelled',
  5: 'Refund',
};

const statusTabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Pending', label: 'Chờ thanh toán' },
  { key: 'Processing', label: 'Vận chuyển' },
  { key: 'Shipping', label: 'Chờ giao hàng' },
  { key: 'Completed', label: 'Hoàn thành' },
  { key: 'Cancelled', label: 'Đã hủy' },
  { key: 'Refund', label: 'Trả hàng/Hoàn tiền' },
];

const statusMap = {
  Pending: 'Chờ thanh toán',
  Processing: 'Vận chuyển',
  Shipping: 'Chờ giao hàng',
  Completed: 'Hoàn thành',
  Cancelled: 'Đã hủy',
  Refund: 'Trả hàng/Hoàn tiền',
};

const statusColor = {
  Pending: 'text-yellow-600',
  Processing: 'text-indigo-600',
  Shipping: 'text-blue-600',
  Completed: 'text-green-600',
  Cancelled: 'text-red-600',
  Refund: 'text-gray-600',
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const customerId = JwtUtils.getCurrentUserId();
        let data = await SalesOrderService.getOrdersByUserId(customerId);
        // Convert int status to string key
        data = (data || []).map(order => ({
          ...order,
          statusKey: statusIntToKey[order.status] || 'Pending'
        }));
        setOrders(data);
      } catch {
        setError('Không thể tải danh sách đơn hàng.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = tab === 'all'
    ? orders
    : orders.filter(order => order.statusKey === tab);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 pr-8 hidden md:block">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400 mr-3">
              <span>
                <svg width="32" height="32" fill="none"><circle cx="16" cy="16" r="16" fill="#e5e7eb"/><text x="50%" y="55%" textAnchor="middle" fill="#9ca3af" fontSize="16" fontFamily="Arial" dy=".3em">👤</text></svg>
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-800">Tài khoản của tôi</div>
              <button className="text-blue-500 text-sm hover:underline">Sửa Hồ Sơ</button>
            </div>
          </div>
          <nav className="space-y-2">
            <div className="flex items-center text-gray-700 font-medium">
              <FileText className="h-5 w-5 mr-2" />
              Đơn Mua
            </div>
            <div className="flex items-center text-gray-500">
              <span className="mr-2">🔔</span> Thông Báo
            </div>
            <div className="flex items-center text-gray-500">
              <span className="mr-2">🎟️</span> Kho Voucher
            </div>
            <div className="flex items-center text-gray-500">
              <span className="mr-2">💰</span> PipeVolt Xu
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Tabs */}
          <div className="flex border-b mb-4 overflow-x-auto">
            {statusTabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-blue-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search (optional, not functional) */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Bạn có thể tìm kiếm theo tên Shop, ID đơn hàng hoặc Tên Sản phẩm"
              className="w-full border px-4 py-2 rounded-lg bg-gray-50"
              disabled
            />
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin h-8 w-8 text-blue-600 mr-2" />
              <span className="text-gray-600">Đang tải đơn hàng...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
              <span className="text-red-600">{error}</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-24 text-gray-500">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4" />
              Bạn chưa có đơn hàng nào.
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map(order => (
                <div
                  key={order.orderId}
                  className="border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow transition-shadow bg-white"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-semibold text-gray-800">
                        {order.shopName ? (
                          <span className="mr-2">{order.shopName}</span>
                        ) : null}
                        Mã đơn: #{order.orderCode || order.orderId}
                      </span>
                      <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${statusColor[order.statusKey] || 'bg-gray-100 text-gray-700'}`}>
                        {statusMap[order.statusKey] || order.statusKey}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {order.orderDate && new Date(order.orderDate).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mb-2">
                    {order.orderDetails?.map(item => (
                      <div key={item.orderDetailId} className="flex items-center border rounded px-3 py-2 bg-gray-50">
                        <img
                          src={item.product?.imageUrl || '/no-image.png'}
                          alt={item.product?.productName}
                          className="w-12 h-12 object-cover rounded mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-800">{item.productName}</div>
                          <div className="text-gray-500 text-sm">x{item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <span className="text-gray-600">Thành tiền: </span>
                      <span className="font-bold text-orange-600">{formatCurrency(order.totalAmount)}</span>
                    </div>
                    <div className="flex gap-2">
                      {order.statusKey === 'Completed' && (
                        <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors">
                          Đánh Giá
                        </button>
                      )}
                      <button className="border px-4 py-2 rounded hover:bg-gray-100 transition-colors">
                        Liên Hệ Người Bán
                      </button>
                      <button className="border px-4 py-2 rounded hover:bg-gray-100 transition-colors">
                        Mua Lại
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyOrders;