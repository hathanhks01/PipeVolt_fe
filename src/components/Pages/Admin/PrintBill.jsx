import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import SalesOrderService from '../../../Services/SalesOrderService';

const PrintBill = (props) => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const billRef = useRef();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await SalesOrderService.getPrintBill(orderId);
        setOrder(data);
      } catch (err) {
        setOrder(null);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (!order) return <div>Đang tải hóa đơn...</div>;

  return (
    <div style={{ width: '80mm', margin: '0 auto', fontFamily: 'monospace' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, margin: 12 }}>
        <button onClick={() => window.print()} style={{ padding: '6px 16px' }}>In hóa đơn</button>
        <button onClick={() => props.history ? props.history.goBack() : window.close()} style={{ padding: '6px 16px' }}>Hủy</button>
      </div>
      <div ref={billRef}>
        <h2 style={{ textAlign: 'center' }}>HÓA ĐƠN BÁN HÀNG</h2>
        <div>Mã đơn: {order.orderCode}</div>
        <div>Ngày: {new Date(order.orderDate).toLocaleString()}</div>
        <div>Khách: {order.customerName}</div>
        <hr />
        {order.items.map(item => (
          <div key={item.productId}>
            {item.productName} x{item.quantity} - {item.unitPrice.toLocaleString()}đ
          </div>
        ))}
        <hr />
        <div>Tổng: {order.totalAmount.toLocaleString()}đ</div>
        <div>VAT: {order.taxAmount.toLocaleString()}đ</div>
        <div>Thanh toán: {order.netAmount.toLocaleString()}đ</div>
        <div style={{ textAlign: 'center', marginTop: 20 }}>Cảm ơn quý khách!</div>
      </div>
    </div>
  );
};

export default PrintBill;