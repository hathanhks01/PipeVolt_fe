import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QrCode, RefreshCw, Building2, Copy, CheckCircle2, AlertCircle, ShoppingBag, Loader2 } from 'lucide-react';
import CheckoutService from '../../../Services/CheckoutService';

const BANK = {
  acc: '0967642058',
  bankCode: 'MB',
  name: 'MB Bank',
  accountHolder: 'HA THANH THANH',
  branch: 'Chi nhánh Hà Nội',
};

const buildQrUrl = (amount, des) => {
  const base = `https://qr.sepay.vn/img?acc=${BANK.acc}&bank=${BANK.bankCode}`;
  const params = [];
  if (amount && Number(amount) >= 1000) params.push(`amount=${amount}`);
  if (des && des.trim()) params.push(`des=${encodeURIComponent(des.trim())}`);
  return params.length ? `${base}&${params.join('&')}` : base;
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const QrPanel = ({ amount, content, onCopy }) => {
  const [imgKey, setImgKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const prevUrl = useRef('');

  const qrUrl = buildQrUrl(amount, content);

  useEffect(() => {
    if (qrUrl !== prevUrl.current) {
      prevUrl.current = qrUrl;
      setLoaded(false);
      setImgKey(k => k + 1);
    }
  }, [qrUrl]);

  return (
    <div className="flex flex-col items-center">
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

      <div className="mt-4 text-center">
        <p className="text-2xl font-bold text-blue-600">{formatCurrency(Number(amount))}</p>
        {content?.trim() && (
          <p className="text-gray-500 text-xs font-mono mt-1 break-all max-w-[200px]">{content.trim()}</p>
        )}
        <div className="flex items-center justify-center gap-1.5 mt-2 text-emerald-600 text-xs">
          <span>Quét bằng app ngân hàng bất kỳ</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-gray-500 text-xs">
        <Building2 className="w-3.5 h-3.5" />
        <span>{BANK.name} · {BANK.acc}</span>
        <RefreshCw className="w-3 h-3 ml-1" />
        <span>Tự động cập nhật</span>
      </div>
    </div>
  );
};

const CheckoutPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const { customerInfo, selectedCartItems = [], paymentMethodId, orderCode, total, orderId } = state;

  const [polling, setPolling] = useState(false);
  const [pollMsg, setPollMsg] = useState('');
  const pollRef = useRef(null);

  // transferContent chính là orderCode
  const transferContent = orderCode || '';

  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customerInfo || !selectedCartItems.length || !orderCode) {
      setError('Thiếu thông tin đơn hàng.');
    }
  }, [customerInfo, selectedCartItems, orderCode]);

  // Bắt đầu polling khi vào trang
  useEffect(() => {
    if (!orderCode) return;

    setPolling(true);
    setPollMsg('Đang chờ xác nhận thanh toán...');

    let attempts = 0;
    const MAX_ATTEMPTS = 60; // 5 phút, mỗi 5 giây

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const result = await CheckoutService.checkOrderStatus(orderCode);
        if (result.isPaid) {
          clearInterval(pollRef.current);
          setPolling(false);
          navigate('/order-confirmation', {
            state: {
              success: true,
              orderData: {
                ...customerInfo,
                total,
                paymentMethod: 'Chuyển khoản ngân hàng',
                items: selectedCartItems,
              }
            }
          });
        }
      } catch {
        // Bỏ qua lỗi network tạm thời
      }

      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(pollRef.current);
        setPolling(false);
        setPollMsg('Hệ thống đang xử lý, vui lòng kiểm tra đơn hàng sau ít phút.');
      }
    }, 5000);

    return () => clearInterval(pollRef.current);
  }, [orderCode, navigate, customerInfo, total, selectedCartItems]);

  const handleCancel = () => {
    navigate('/cart');
  };

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <AlertCircle className="h-14 w-14 text-red-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Lỗi</h3>
        <p className="text-gray-400 text-sm mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5 justify-center">
          <QrCode className="h-6 w-6 text-blue-600" />
          Thanh toán đơn hàng
        </h1>
        <p className="text-gray-400 text-sm mt-1">Quét mã QR để chuyển khoản, sau đó xác nhận kết quả bên dưới</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            <QrPanel amount={total} content={transferContent} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Thông tin tài khoản</p>
            <div className="border border-gray-100 rounded-xl overflow-hidden mb-3">
              <div className="flex items-center justify-between py-3 px-4 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Ngân hàng</span>
                <span className="text-gray-800 font-semibold text-sm">{BANK.name}</span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Số tài khoản</span>
                <div className="flex items-center gap-2"><span className="text-gray-800 font-semibold text-sm">{BANK.acc}</span><button onClick={() => navigator.clipboard.writeText(BANK.acc)} className="p-1 text-gray-400 hover:text-blue-500"><Copy className="w-3.5 h-3.5"/></button></div>
              </div>
              <div className="flex items-center justify-between py-3 px-4">
                <span className="text-gray-500 text-sm">Chủ tài khoản</span>
                <span className="text-gray-800 font-semibold text-sm">{BANK.accountHolder}</span>
              </div>
            </div>

            <div className="mt-2">
              <p className="text-sm font-semibold text-gray-800">Tổng: <span className="text-blue-600">{formatCurrency(total)}</span></p>
              <p className="text-xs text-gray-500 mt-2">Nội dung chuyển khoản: <span className="font-mono text-sm break-all">{transferContent}</span></p>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {polling ? (
                <div className="flex items-center justify-center gap-2 py-3 bg-blue-50 rounded-xl text-blue-700 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {pollMsg}
                </div>
              ) : pollMsg ? (
                <div className="py-3 bg-amber-50 rounded-xl text-amber-700 text-sm text-center px-4">
                  {pollMsg}
                </div>
              ) : null}

              <button onClick={() => navigate('/cart')} className="border py-3 rounded-xl text-gray-700 hover:bg-gray-50">
                Hủy đơn hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPayment;
