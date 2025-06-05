import React, { useEffect, useState } from 'react';
import PurchaseOrderService from '../../../Services/PurchaseOrderService';
import PurchaseOrderDetailService from '../../../Services/PurchaseOrderDetailService';

const emptyOrder = {
  purchaseOrderId: null,
  purchaseOrderCode: '',
  supplierId: '',
  employeeId: '',
  orderDate: '',
  totalAmount: 0,
  status: ''
};

const emptyDetail = {
  productId: '',
  quantity: '',
  unitCost: '',
};

const PurchaseOrder = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(emptyOrder);
  const [detail, setDetail] = useState(emptyDetail);
  const [orderDetails, setOrderDetails] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await PurchaseOrderService.getAll();
      setOrders(res.data || []);
      setFilteredOrders(res.data || []);
    } catch {
      setOrders([]);
      setFilteredOrders([]);
    }
  };

  useEffect(() => {
    setFilteredOrders(
      orders.filter(o =>
        (o.purchaseOrderCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.supplierId ? o.supplierId.toString() : '').includes(searchTerm) ||
        (o.employeeId ? o.employeeId.toString() : '').includes(searchTerm)
      )
    );
  }, [searchTerm, orders]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setCurrentOrder(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async () => {
    try {
      const payload = {
        purchaseOrderCode: currentOrder.purchaseOrderCode,
        supplierId: currentOrder.supplierId ? Number(currentOrder.supplierId) : null,
        employeeId: currentOrder.employeeId ? Number(currentOrder.employeeId) : null,
        totalAmount: currentOrder.totalAmount ? Number(currentOrder.totalAmount) : 0,
        status: currentOrder.status
      };
      await PurchaseOrderService.create(payload);
      setShowAddModal(false);
      fetchOrders();
    } catch (e) {
      alert('Thêm đơn nhập thất bại');
    }
  };

  const handleEdit = async () => {
    try {
      const payload = {
        purchaseOrderId: currentOrder.purchaseOrderId,
        purchaseOrderCode: currentOrder.purchaseOrderCode,
        supplierId: currentOrder.supplierId ? Number(currentOrder.supplierId) : null,
        employeeId: currentOrder.employeeId ? Number(currentOrder.employeeId) : null,
        totalAmount: currentOrder.totalAmount ? Number(currentOrder.totalAmount) : 0,
        status: currentOrder.status
      };
      await PurchaseOrderService.update(currentOrder.purchaseOrderId, payload);
      setShowEditModal(false);
      fetchOrders();
    } catch (e) {
      alert('Cập nhật thất bại');
    }
  };

  const handleDelete = async () => {
    try {
      await PurchaseOrderService.remove(currentOrder.purchaseOrderId);
      setShowDeleteModal(false);
      fetchOrders();
    } catch (e) {
      alert('Xóa thất bại');
    }
  };

  // --- Chi tiết đơn hàng ---
  const handleShowDetail = async (order) => {
    setCurrentOrder(order);
    setShowDetailModal(true);
    setDetail(emptyDetail);
    // Lấy danh sách chi tiết đơn hàng của đơn này (nếu muốn hiển thị)
    try {
      const res = await PurchaseOrderDetailService.getAll();
      setOrderDetails(res.data.filter(d => d.purchaseOrderId === order.purchaseOrderId));
    } catch {
      setOrderDetails([]);
    }
  };

  const handleAddDetail = async () => {
    try {
      await PurchaseOrderDetailService.create({
        purchaseOrderId: currentOrder.purchaseOrderId,
        productId: detail.productId ? Number(detail.productId) : null,
        quantity: detail.quantity ? Number(detail.quantity) : null,
        unitCost: detail.unitCost ? Number(detail.unitCost) : null,
      });
      // Sau khi thêm, load lại chi tiết đơn hàng
      const res = await PurchaseOrderDetailService.getAll();
      setOrderDetails(res.data.filter(d => d.purchaseOrderId === currentOrder.purchaseOrderId));
      setDetail(emptyDetail);
    } catch {
      alert('Thêm chi tiết thất bại');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý đơn nhập hàng</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã, nhà cung cấp, nhân viên..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button onClick={() => { setCurrentOrder(emptyOrder); setShowAddModal(true); }} className="bg-blue-500 text-white px-3 py-1 rounded">
          Thêm mới
        </button>
      </div>
      <table className="w-full border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Mã đơn</th>
            <th className="border px-2 py-1">Nhà cung cấp (ID)</th>
            <th className="border px-2 py-1">Nhân viên (ID)</th>
            <th className="border px-2 py-1">Ngày nhập</th>
            <th className="border px-2 py-1">Tổng tiền</th>
            <th className="border px-2 py-1">Trạng thái</th>
            <th className="border px-2 py-1">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => (
            <tr key={order.purchaseOrderId}>
              <td className="border px-2 py-1">{order.purchaseOrderCode}</td>
              <td className="border px-2 py-1">{order.supplierId}</td>
              <td className="border px-2 py-1">{order.employeeId}</td>
              <td className="border px-2 py-1">{order.orderDate?.split('T')[0]}</td>
              <td className="border px-2 py-1">{order.totalAmount}</td>
              <td className="border px-2 py-1">{order.status}</td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => handleShowDetail(order)}
                  className="text-green-600 mr-2"
                >
                  Thêm chi tiết
                </button>
                <button onClick={() => { setCurrentOrder(order); setShowEditModal(true); }} className="text-blue-600 mr-2">Sửa</button>
                <button onClick={() => { setCurrentOrder(order); setShowDeleteModal(true); }} className="text-red-600">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal Thêm */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="font-bold mb-2">Thêm đơn nhập</h2>
            <input name="purchaseOrderCode" placeholder="Mã đơn" value={currentOrder.purchaseOrderCode} onChange={handleInputChange} className="border w-full mb-2 px-2 py-1" />
            <input name="supplierId" placeholder="ID nhà cung cấp" value={currentOrder.supplierId} onChange={handleInputChange} className="border w-full mb-2 px-2 py-1" />
            <input name="employeeId" placeholder="ID nhân viên" value={currentOrder.employeeId} onChange={handleInputChange} className="border w-full mb-2 px-2 py-1" />
            <input name="orderDate" type="date" value={currentOrder.orderDate} onChange={handleInputChange} className="border w-full mb-2 px-2 py-1" />
            <input name="totalAmount" type="number" placeholder="Tổng tiền" value={currentOrder.totalAmount} onChange={handleInputChange} className="border w-full mb-2 px-2 py-1" />
            <input name="status" placeholder="Trạng thái" value={currentOrder.status} onChange={handleInputChange} className="border w-full mb-2 px-2 py-1" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddModal(false)} className="px-3 py-1">Hủy</button>
              <button onClick={handleAdd} className="bg-blue-500 text-white px-3 py-1 rounded">Lưu</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Sửa */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="font-bold mb-2">Sửa đơn nhập</h2>
            <input name="purchaseOrderCode" placeholder="Mã đơn" value={currentOrder.purchaseOrderCode} onChange={handleInputChange} className="border w-full mb-2 px-2 py-1" />
            <input name="supplierId" placeholder="ID nhà cung cấp" value={currentOrder.supplierId} onChange={handleInputChange} className="border w-full mb-2 px-2 py-1" />
            <input name="employeeId" placeholder="ID nhân viên" value={currentOrder.employeeId} onChange={handleInputChange} className="border w-full mb-2 px-2 py-1" />
            <input name="orderDate" type="date" value={currentOrder.orderDate} onChange={handleInputChange} className="border w-full mb-2 px-2 py-1" />
            <input name="totalAmount" type="number" placeholder="Tổng tiền" value={currentOrder.totalAmount} onChange={handleInputChange} className="border w-full mb-2 px-2 py-1" />
            <input name="status" placeholder="Trạng thái" value={currentOrder.status} onChange={handleInputChange} className="border w-full mb-2 px-2 py-1" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowEditModal(false)} className="px-3 py-1">Hủy</button>
              <button onClick={handleEdit} className="bg-blue-500 text-white px-3 py-1 rounded">Lưu</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Xóa */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-80">
            <h2 className="font-bold mb-4">Xác nhận xóa?</h2>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-3 py-1">Hủy</button>
              <button onClick={handleDelete} className="bg-red-500 text-white px-3 py-1 rounded">Xóa</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Thêm chi tiết đơn hàng */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-[500px] max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold mb-2">
              Thêm chi tiết cho đơn <span className="text-blue-600">{currentOrder.purchaseOrderCode}</span>
            </h2>
            <div className="mb-4">
              <input
                name="productId"
                placeholder="ID sản phẩm"
                value={detail.productId}
                onChange={e => setDetail(d => ({ ...d, productId: e.target.value }))}
                className="border w-full mb-2 px-2 py-1"
              />
              <input
                name="quantity"
                type="number"
                placeholder="Số lượng"
                value={detail.quantity}
                onChange={e => setDetail(d => ({ ...d, quantity: e.target.value }))}
                className="border w-full mb-2 px-2 py-1"
              />
              <input
                name="unitCost"
                type="number"
                placeholder="Đơn giá"
                value={detail.unitCost}
                onChange={e => setDetail(d => ({ ...d, unitCost: e.target.value }))}
                className="border w-full mb-2 px-2 py-1"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowDetailModal(false)} className="px-3 py-1">Đóng</button>
                <button onClick={handleAddDetail} className="bg-blue-500 text-white px-3 py-1 rounded">Lưu chi tiết</button>
              </div>
            </div>
            <h3 className="font-semibold mb-2">Danh sách chi tiết đơn hàng</h3>
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">ID</th>
                  <th className="border px-2 py-1">Sản phẩm</th>
                  <th className="border px-2 py-1">Số lượng</th>
                  <th className="border px-2 py-1">Đơn giá</th>
                  <th className="border px-2 py-1">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.map(detail => (
                  <tr key={detail.purchaseOrderDetailId}>
                    <td className="border px-2 py-1">{detail.purchaseOrderDetailId}</td>
                    <td className="border px-2 py-1">{detail.productId}</td>
                    <td className="border px-2 py-1">{detail.quantity}</td>
                    <td className="border px-2 py-1">{detail.unitCost}</td>
                    <td className="border px-2 py-1">{detail.lineTotal}</td>
                  </tr>
                ))}
                {orderDetails.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-2 text-gray-400">Chưa có chi tiết</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrder;