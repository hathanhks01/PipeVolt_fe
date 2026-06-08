import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle, CheckCircle2, ShoppingBag, CreditCard,
  User, MapPin, Mail, Phone, FileText, QrCode,
  Building2, Copy, RefreshCw, ShieldCheck, Banknote,
  Smartphone, ChevronRight
} from 'lucide-react';
import CheckoutService from '../../../Services/CheckoutService';
import CustomerService from '../../../Services/CustomerService';
import JwtUtils from '../../../constants/JwtUtils';

// ── Config ──────────────────────────────────────────────────────────────────
const BANK = {
  acc: '0967642058',
  bankCode: 'MB',
  name: 'MB Bank',
  accountHolder: 'NGUYEN VAN A',
  branch: 'Chi nhánh Hà Nội',
};

const paymentMethods = [
  { id: 1, name: 'Thanh toán khi nhận hàng (COD)', icon: Banknote, desc: 'Trả tiền khi nhận hàng' },
  { id: 2, name: 'Chuyển khoản ngân hàng', icon: Building2, desc: 'QR tự động • MB Bank' },
  { id: 3, name: 'Ví điện tử', icon: Smartphone, desc: 'MoMo, ZaloPay, VNPay' },
];

// ── QR helpers ───────────────────────────────────────────────────────────────
const buildQrUrl = (amount, des) => {
  const base = `https://qr.sepay.vn/img?acc=${BANK.acc}&bank=${BANK.bankCode}`;
  const params = [];
  if (amount && Number(amount) >= 1000) params.push(`amount=${amount}`);
  if (des && des.trim()) params.push(`des=${encodeURIComponent(des.trim())}`);
  return params.length ? `${base}&${params.join('&')}` : base;
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// ── QR Panel (live) ──────────────────────────────────────────────────────────
const QrPanel = ({ amount, content, onCopy }) => {
  const [imgKey, setImgKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const prevUrl = useRef('');

  const qrUrl = buildQrUrl(amount, content);
  const hasAmount = Number(amount) >= 1000;

  useEffect(() => {
    if (qrUrl !== prevUrl.current) {
      prevUrl.current = qrUrl;
      setLoaded(false);
      setImgKey(k => k + 1);
    }
  }, [qrUrl]);

  return (
    <div className="flex flex-col items-center">
      {/* QR image */}
      <div className="relative bg-white p-3 rounded-2xl shadow-md border border-gray-100">
        {!loaded && (
          <div className="w-48 h-48 bg-gray-100 rounded-xl flex flex-col items-center justify-center gap-2 animate-pulse">
            <QrCode className="w-8 h-8 text-gray-300" />
            <span className="text-gray-400 text-xs">Đang tải...</span>
          </div>
        )}
        <img
          key={imgKey}
          src={qrUrl}
          alt="Mã QR chuyển khoản"
          width={192}
          height={192}
          className={`w-48 h-48 rounded-xl object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0 absolute'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
      </div>

      {/* Amount display */}
      {hasAmount ? (
        <div className="mt-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(Number(amount))}</p>
          {content?.trim() && (
            <p className="text-gray-500 text-xs font-mono mt-1 break-all max-w-[200px]">{content.trim()}</p>
          )}
          <div className="flex items-center justify-center gap-1.5 mt-2 text-emerald-600 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Quét bằng app ngân hàng bất kỳ</span>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-gray-400 text-xs text-center">QR sẽ tự động điền số tiền đơn hàng</p>
      )}

      {/* Bank shortinfo */}
      <div className="mt-3 flex items-center gap-1.5 text-gray-500 text-xs">
        <Building2 className="w-3.5 h-3.5" />
        <span>{BANK.name} · {BANK.acc}</span>
        <RefreshCw className="w-3 h-3 ml-1" />
        <span>Tự động cập nhật</span>
      </div>
    </div>
  );
};

// ── Bank Info Row ────────────────────────────────────────────────────────────
const BankInfoRow = ({ label, value, copyable, onCopy }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
    <span className="text-gray-500 text-sm">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-gray-800 font-semibold text-sm">{value}</span>
      {copyable && (
        <button
          type="button"
          onClick={() => onCopy(value, label)}
          className="p-1 text-gray-400 hover:text-blue-500 transition-colors rounded"
          title={`Sao chép ${label}`}
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCartItems = location.state?.selectedCartItems || [];

  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '', email: '', customerId: '' });
  const [paymentMethodId, setPaymentMethodId] = useState(paymentMethods[0].id);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [copyToast, setCopyToast] = useState('');

  // Tổng tiền
  const total = selectedCartItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0);

  // Transfer content auto-generated
  const transferContent = `DH ${customerInfo.customerId || 'USER'} ${total}`.trim();

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
            customerId: data.customerId || '',
          });
        })
        .catch(err => console.error('Lỗi lấy thông tin khách hàng:', err));
    }
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyToast(`Đã sao chép ${label}!`);
      setTimeout(() => setCopyToast(''), 2000);
    });
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!customerInfo.name.trim()) { setError('Vui lòng nhập họ tên'); return false; }
    if (!customerInfo.phone.trim()) { setError('Vui lòng nhập số điện thoại'); return false; }
    if (!customerInfo.address.trim()) { setError('Vui lòng nhập địa chỉ nhận hàng'); return false; }
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(customerInfo.phone.replace(/\s/g, ''))) { setError('Số điện thoại không hợp lệ'); return false; }
    if (customerInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) { setError('Email không hợp lệ'); return false; }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    setError(null);
    try {
      const { customerId } = customerInfo;
      if (!customerId) throw new Error('Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.');
      
      const cartItemIds = selectedCartItems.map(item => item.cartItemId);
      
      // If user chose bank transfer, create pending order and navigate to dedicated payment page
      if (paymentMethodId === 2) {
        const pendingOrder = await CheckoutService.createPendingOrder(customerId, paymentMethodId, cartItemIds);
        navigate('/checkout/payment', {
          state: { 
            customerInfo, 
            selectedCartItems, 
            paymentMethodId, 
            orderCode: pendingOrder.orderCode,
            orderId: pendingOrder.orderId,
            total 
          }
        });
        setSubmitting(false);
        return;
      }
      
      await CheckoutService.checkoutPartial(customerId, paymentMethodId, cartItemIds);
      showNotification('Đặt hàng thành công!', 'success');
      setTimeout(() => {
        navigate('/order-confirmation', {
          state: {
            success: true,
            orderData: {
              ...customerInfo, total,
              paymentMethod: paymentMethods.find(pm => pm.id === paymentMethodId)?.name,
              items: selectedCartItems
            }
          }
        });
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';
      setError(msg);
      showNotification(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isBankTransfer = paymentMethodId === 2;

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!selectedCartItems.length) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <ShoppingBag className="h-14 w-14 text-gray-200 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Không có sản phẩm nào để thanh toán</h3>
        <p className="text-gray-400 text-sm mb-6">Vui lòng quay lại giỏ hàng và chọn sản phẩm</p>
        <button onClick={() => navigate('/cart')} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          Quay lại giỏ hàng
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">

      {/* ── Toast notifications ── */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-white text-sm max-w-xs transition-all ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {notification.type === 'success'
            ? <CheckCircle2 className="h-4 w-4 shrink-0" />
            : <AlertCircle className="h-4 w-4 shrink-0" />}
          {notification.message}
        </div>
      )}

      {/* Copy toast */}
      {copyToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm px-4 py-2 rounded-full shadow-lg">
          {copyToast}
        </div>
      )}

      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
          <CreditCard className="h-6 w-6 text-blue-600" />
          Xác nhận đơn hàng
        </h1>
        <p className="text-gray-400 text-sm mt-1">Kiểm tra thông tin và chọn phương thức thanh toán</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* LEFT — forms (3/5) */}
          <div className="lg:col-span-3 space-y-5">

            {/* Customer info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-5">
                <User className="h-4.5 w-4.5 text-blue-500" />
                Thông tin nhận hàng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Họ tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name" value={customerInfo.name} onChange={handleChange}
                    className="w-full border border-gray-200 px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    <Phone className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phone" value={customerInfo.phone} onChange={handleChange}
                    className="w-full border border-gray-200 px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="0xxx xxx xxx"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    <MapPin className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                    Địa chỉ nhận hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="address" value={customerInfo.address} onChange={handleChange}
                    className="w-full border border-gray-200 px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="Số nhà, đường, phường, quận, thành phố"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    <Mail className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                    Email <span className="text-gray-400 font-normal">(tùy chọn)</span>
                  </label>
                  <input
                    name="email" value={customerInfo.email} onChange={handleChange} type="email"
                    className="w-full border border-gray-200 px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <CreditCard className="h-4.5 w-4.5 text-blue-500" />
                Phương thức thanh toán
              </h2>
              <div className="space-y-2.5">
                {paymentMethods.map(pm => {
                  const Icon = pm.icon;
                  const isSelected = paymentMethodId === pm.id;
                  return (
                    <label
                      key={pm.id}
                      className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${isSelected
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-400'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <input
                        type="radio" value={pm.id}
                        checked={isSelected}
                        onChange={e => setPaymentMethodId(Number(e.target.value))}
                        className="h-4 w-4 text-blue-600 accent-blue-600"
                      />
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Icon className={`h-4.5 w-4.5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isSelected ? 'text-blue-800' : 'text-gray-800'}`}>{pm.name}</p>
                        <p className={`text-xs mt-0.5 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>{pm.desc}</p>
                      </div>
                      {isSelected && <ChevronRight className="h-4 w-4 text-blue-400 shrink-0" />}
                    </label>
                  );
                })}
              </div>

              {/* Khi chọn chuyển khoản, người dùng sẽ được chuyển sang trang thanh toán riêng */}
              {isBankTransfer && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                  Chọn "Xác nhận đặt hàng" để chuyển sang trang thanh toán QR và hoàn tất giao dịch.
                </div>
              )}
            </div>

            {/* Note */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1.5 -mt-0.5 text-gray-400" />
                Ghi chú đơn hàng
              </label>
              <textarea
                value={note} onChange={e => setNote(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white resize-none"
                placeholder="Ghi chú cho người giao hàng (nếu có)"
                rows={3}
              />
            </div>
          </div>

          {/* RIGHT — order summary (2/5, sticky) */}
          <div className="lg:col-span-2 lg:sticky lg:top-6 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <ShoppingBag className="h-4.5 w-4.5 text-blue-500" />
                <h2 className="text-base font-semibold text-gray-800">Đơn hàng của bạn</h2>
                <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{selectedCartItems.length} sản phẩm</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {selectedCartItems.map(item => (
                  <div key={item.cartItemId} className="flex items-start justify-between gap-3 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">x{item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-blue-600 shrink-0">{formatCurrency(item.lineTotal)}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 bg-blue-50 border-t border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Tổng cộng</span>
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(total)}</span>
                </div>
                {isBankTransfer && (
                  <p className="text-xs text-blue-400 mt-1 text-right">Vui lòng quét QR để thanh toán</p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4.5 w-4.5 border-2 border-white border-t-transparent" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4.5 w-4.5" />
                  Xác nhận đặt hàng
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              ← Quay lại giỏ hàng
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;