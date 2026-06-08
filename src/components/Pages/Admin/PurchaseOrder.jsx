import React, { useEffect, useState, useRef } from 'react';
import PurchaseOrderService from '../../../Services/PurchaseOrderService';
import PurchaseOrderDetailService from '../../../Services/PurchaseOrderDetailService';
import SupplierService from '../../../Services/SupplierService';
import EmployeeService from '../../../Services/EmployeeService';
import ProductService from '../../../Services/ProductService';

const PURCHASE_ORDER_STATUSES = [
  { value: 0, label: 'Nháp', color: '#94a3b8', bg: '#f1f5f9' },
  { value: 1, label: 'Đã gửi', color: '#3b82f6', bg: '#eff6ff' },
  { value: 2, label: 'Đã duyệt', color: '#10b981', bg: '#ecfdf5' },
  { value: 3, label: 'Từ chối', color: '#ef4444', bg: '#fef2f2' },
  { value: 4, label: 'Đang xử lý', color: '#f59e0b', bg: '#fffbeb' },
  { value: 5, label: 'Hoàn thành', color: '#6366f1', bg: '#eef2ff' },
  { value: 6, label: 'Đã hủy', color: '#9ca3af', bg: '#f9fafb' },
];

const getStatusInfo = (value) => {
  const found = PURCHASE_ORDER_STATUSES.find(s => s.value === value || s.value === Number(value));
  return found || { label: value ?? '—', color: '#9ca3af', bg: '#f9fafb' };
};

const emptyOrder = {
  purchaseOrderId: null,
  purchaseOrderCode: '',
  supplierId: null,
  employeeId: null,
  orderDate: '',
  totalAmount: 0,
  status: 0
};

const emptyDetail = {
  productId: '',
  quantity: '',
  unitCost: '',
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const PurchaseOrder = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [supplierQuery, setSupplierQuery] = useState('');
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(emptyOrder);
  const [detail, setDetail] = useState(emptyDetail);
  const [orderDetails, setOrderDetails] = useState([]);
  const [tempDetails, setTempDetails] = useState([]);
  const [detailErrors, setDetailErrors] = useState({});
  const productRef = useRef(null);
  const quantityRef = useRef(null);
  const priceRef = useRef(null);

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
    fetchEmployees();
    fetchProducts();
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

  const fetchSuppliers = async () => {
    try {
      const res = await SupplierService.getAll();
      setSuppliers(res.data || []);
    } catch {
      setSuppliers([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await EmployeeService.getAll();
      setEmployees(res.data || []);
    } catch {
      setEmployees([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await ProductService.getAllProducts();
      setProducts(res.data || []);
    } catch {
      setProducts([]);
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
        supplierId: currentOrder.supplierId ? Number(currentOrder.supplierId) : null,
        totalAmount: currentOrder.totalAmount ? Number(currentOrder.totalAmount) : 0,
        status: currentOrder.status !== '' && currentOrder.status !== null ? Number(currentOrder.status) : null,
        details: tempDetails.map(d => ({
          productId: Number(d.productId),
          quantity: d.quantity ? Number(d.quantity) : null,
          unitCost: d.unitCost ? Number(d.unitCost) : null
        }))
      };

      if (payload.supplierId === null || payload.supplierId === undefined) {
        alert('Vui lòng chọn nhà cung cấp');
        return;
      }

      await PurchaseOrderService.create(payload);
      setShowAddModal(false);
      setTempDetails([]);
      setCurrentOrder(emptyOrder);
      fetchOrders();
    } catch (e) {
      alert('Thêm đơn nhập thất bại: ' + (e.response?.data?.message || e.message));
    }
  };

  const calculateTotalAmount = (details) => {
    return details.reduce((sum, d) => {
      const qty = Number(d.quantity) || 0;
      const price = Number(d.unitCost) || 0;
      return sum + (qty * price);
    }, 0);
  };

  const handleAddTempDetail = () => {
    const errors = {};
    const qty = Number(detail.quantity) || 0;
    const price = Number(detail.unitCost) || 0;

    if (!detail.productId) {
      errors.productId = true;
      productRef.current?.focus();
    }
    if (!detail.quantity || qty <= 0) {
      errors.quantity = true;
      if (!errors.productId) quantityRef.current?.focus();
    }
    if (!detail.unitCost || price <= 0) {
      errors.unitCost = true;
      if (!errors.productId && !errors.quantity) priceRef.current?.focus();
    }

    if (Object.keys(errors).length > 0) {
      setDetailErrors(errors);
      return;
    }

    setDetailErrors({});
    const newDetails = [...tempDetails, { ...detail, id: Date.now() }];
    setTempDetails(newDetails);
    const total = calculateTotalAmount(newDetails);
    setCurrentOrder(prev => ({ ...prev, totalAmount: total }));
    setDetail(emptyDetail);
  };

  const handleRemoveTempDetail = (id) => {
    const newDetails = tempDetails.filter(d => d.id !== id);
    setTempDetails(newDetails);
    const total = calculateTotalAmount(newDetails);
    setCurrentOrder(prev => ({ ...prev, totalAmount: total }));
  };

  const handleEdit = async () => {
    try {
      const payload = {
        purchaseOrderId: currentOrder.purchaseOrderId,
        supplierId: currentOrder.supplierId ? Number(currentOrder.supplierId) : null,
        totalAmount: currentOrder.totalAmount ? Number(currentOrder.totalAmount) : 0,
        status: currentOrder.status !== '' && currentOrder.status !== null ? Number(currentOrder.status) : null
      };

      if (payload.supplierId === null || payload.supplierId === undefined) {
        alert('Vui lòng chọn nhà cung cấp');
        return;
      }

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

  const getSupplierNameById = (id) => {
    if (id === null || id === undefined || id === '') return '';
    const numId = Number(id);
    const found = suppliers.find(s => Number(s.supplierId) === numId);
    return found?.supplierName || '';
  };

  const getEmployeeNameById = (id) => {
    if (id === null || id === undefined || id === '') return '—';
    const numId = Number(id);
    const found = employees.find(e => Number(e.employeeId) === numId);
    return found?.employeeName || found?.fullName || `Employee #${numId}`;
  };

  const getProductNameById = (id) => {
    if (id === null || id === undefined || id === '') return '—';
    const numId = Number(id);
    const found = products.find(p => Number(p.productId) === numId);
    return found?.productName || `Product #${numId}`;
  };

  useEffect(() => {
    if (!showEditModal || !currentOrder) return;
    setSupplierQuery(getSupplierNameById(currentOrder.supplierId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEditModal, currentOrder.supplierId, suppliers]);

  const filteredSuppliers = suppliers.filter(s =>
    (s.supplierName || '').toLowerCase().includes((supplierQuery || '').toLowerCase())
  );

  const handleShowDetail = async (order) => {
    setCurrentOrder(order);
    setShowDetailModal(true);
    setDetail(emptyDetail);
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
      const res = await PurchaseOrderDetailService.getAll();
      setOrderDetails(res.data.filter(d => d.purchaseOrderId === currentOrder.purchaseOrderId));
      setDetail(emptyDetail);
    } catch {
      alert('Thêm chi tiết thất bại');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    background: '#fff',
    color: '#1e293b',
    marginBottom: '10px',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const btnPrimary = {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  };

  const btnSecondary = {
    background: '#f1f5f9',
    color: '#475569',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    padding: '9px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  };

  const btnDanger = {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px', fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .po-table tr:hover td { background: #f0f9ff !important; }
        .po-input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
        .action-btn { background: none; border: none; cursor: pointer; font-size: 13px; font-weight: 600; padding: 5px 10px; border-radius: 6px; transition: background 0.15s; }
        .action-btn.detail { color: #10b981; } .action-btn.detail:hover { background: #ecfdf5; }
        .action-btn.edit { color: #3b82f6; } .action-btn.edit:hover { background: #eff6ff; }
        .action-btn.delete { color: #ef4444; } .action-btn.delete:hover { background: #fef2f2; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.45); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 24px; backdrop-filter: blur(2px); }
        .modal-box { background: #fff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.18); width: 100%; animation: slideUp 0.25s ease; }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .section-card { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 16px; }
        .tag { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .po-search:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            📦 Quản lý đơn nhập hàng
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0' }}>
            {filteredOrders.length} đơn hàng
          </p>
        </div>
        <button
          style={btnPrimary}
          onClick={() => {
            setCurrentOrder(emptyOrder);
            setSupplierQuery('');
            setSupplierOpen(false);
            setTempDetails([]);
            setDetail(emptyDetail);
            setShowAddModal(true);
          }}
        >
          + Thêm đơn mới
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '380px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }}>🔍</span>
          <input
            type="text"
            placeholder="Tìm theo mã, nhà cung cấp, nhân viên..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="po-search"
            style={{ ...inputStyle, marginBottom: 0, paddingLeft: '38px', width: '380px' }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <table className="po-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              {['Mã đơn', 'Nhà cung cấp', 'Nhân viên', 'Ngày nhập', 'Tổng tiền', 'Trạng thái', 'Hành động'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '15px' }}>
                  Không có dữ liệu
                </td>
              </tr>
            ) : filteredOrders.map((order, idx) => {
              const st = getStatusInfo(order.status);
              return (
                <tr key={order.purchaseOrderId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontWeight: '600', color: '#1e293b', fontFamily: 'monospace', fontSize: '13px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                      {order.purchaseOrderCode || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px', color: '#334155', fontSize: '14px' }}>
                    {getSupplierNameById(order.supplierId) || <span style={{ color: '#94a3b8' }}>—</span>}
                  </td>
                  <td style={{ padding: '13px 16px', color: '#334155', fontSize: '14px' }}>
                    {getEmployeeNameById(order.employeeId)}
                  </td>
                  <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>
                    {order.orderDate?.split('T')[0] || '—'}
                  </td>
                  <td style={{ padding: '13px 16px', color: '#0f172a', fontWeight: '600', fontSize: '14px' }}>
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span className="tag" style={{ color: st.color, background: st.bg }}>
                      {st.label}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                    <button className="action-btn detail" onClick={() => handleShowDetail(order)}>📋 Chi tiết</button>
                    <button className="action-btn edit" onClick={() => { setCurrentOrder(order); setSupplierOpen(false); setShowEditModal(true); }}>✏️ Sửa</button>
                    <button className="action-btn delete" onClick={() => { setCurrentOrder(order); setShowDeleteModal(true); }}>🗑 Xóa</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Thêm đơn nhập mới</h2>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' }}>Điền thông tin đơn hàng và chi tiết sản phẩm</p>
              </div>
              <button onClick={() => { setShowAddModal(false); setTempDetails([]); setDetail(emptyDetail); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#94a3b8', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: '24px 28px' }}>
              <div className="section-card">
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>📋 Thông tin đơn hàng</div>
                <label style={labelStyle}>Nhà cung cấp *</label>
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="Tìm nhà cung cấp..."
                    value={supplierQuery}
                    onFocus={() => setSupplierOpen(true)}
                    onBlur={() => setTimeout(() => setSupplierOpen(false), 150)}
                    onChange={(e) => {
                      setSupplierQuery(e.target.value);
                      setSupplierOpen(true);
                      setCurrentOrder(prev => ({ ...prev, supplierId: null }));
                    }}
                    className="po-input"
                    style={{ ...inputStyle, marginBottom: 0 }}
                  />
                  {supplierOpen && filteredSuppliers.length > 0 && (
                    <div style={{ position: 'absolute', zIndex: 20, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '8px', width: '100%', maxHeight: '180px', overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', marginTop: '2px' }}>
                      {filteredSuppliers.slice(0, 10).map(s => (
                        <div key={s.supplierId} style={{ padding: '9px 14px', cursor: 'pointer', fontSize: '14px', color: '#334155', transition: 'background 0.1s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}
                          onMouseDown={() => { setCurrentOrder(prev => ({ ...prev, supplierId: s.supplierId })); setSupplierQuery(s.supplierName || ''); setSupplierOpen(false); }}>
                          {s.supplierName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Ngày nhập</label>
                  <input name="orderDate" type="date" value={currentOrder.orderDate} onChange={handleInputChange} className="po-input" style={{ ...inputStyle }} />
                </div>
                {tempDetails.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '14px 12px', background: '#eff6ff', borderRadius: '8px', border: '1.5px solid #0ea5e9' }}>
                    <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>Tổng tiền</div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: '#0369a1' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentOrder.totalAmount || 0)}
                    </div>
                  </div>
                )}
                <label style={labelStyle}>Trạng thái</label>
                <select name="status" value={currentOrder.status !== null && currentOrder.status !== undefined ? String(currentOrder.status) : ''} onChange={handleInputChange} className="po-input" style={{ ...inputStyle, marginBottom: 0 }}>
                  <option value="">Chọn trạng thái</option>
                  {PURCHASE_ORDER_STATUSES.map(s => <option key={s.value} value={String(s.value)}>{s.label}</option>)}
                </select>
              </div>

              <div className="section-card">
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🛒 Chi tiết hàng hóa</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                  <div>
                    <label style={labelStyle}>Sản phẩm *</label>
                    <select
                      ref={productRef}
                      value={detail.productId}
                      onChange={e => { setDetail(d => ({ ...d, productId: e.target.value })); setDetailErrors(prev => ({ ...prev, productId: false })); }}
                      className="po-input"
                      style={{ ...inputStyle, marginBottom: 0, borderColor: detailErrors.productId ? '#ef4444' : '#e2e8f0', borderWidth: detailErrors.productId ? '2px' : '1.5px' }}
                    >
                      <option value="">-- Chọn sản phẩm --</option>
                      {products.map(p => (
                        <option key={p.productId} value={String(p.productId)}>
                          {p.productName || `Product #${p.productId}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Số lượng *</label>
                    <input
                      ref={quantityRef}
                      type="number"
                      placeholder="0"
                      value={detail.quantity}
                      onChange={e => { setDetail(d => ({ ...d, quantity: e.target.value })); setDetailErrors(prev => ({ ...prev, quantity: false })); }}
                      className="po-input"
                      style={{ ...inputStyle, marginBottom: 0, borderColor: detailErrors.quantity ? '#ef4444' : '#e2e8f0', borderWidth: detailErrors.quantity ? '2px' : '1.5px' }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Đơn giá *</label>
                    <input
                      ref={priceRef}
                      type="number"
                      placeholder="0"
                      value={detail.unitCost}
                      onChange={e => { setDetail(d => ({ ...d, unitCost: e.target.value })); setDetailErrors(prev => ({ ...prev, unitCost: false })); }}
                      className="po-input"
                      style={{ ...inputStyle, marginBottom: 0, borderColor: detailErrors.unitCost ? '#ef4444' : '#e2e8f0', borderWidth: detailErrors.unitCost ? '2px' : '1.5px' }}
                    />
                  </div>
                  <button onClick={handleAddTempDetail} style={{ ...btnPrimary, padding: '9px 14px', whiteSpace: 'nowrap', marginBottom: 0 }}>+ Thêm</button>
                </div>
                {tempDetails.length > 0 && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9' }}>
                        {['Sản phẩm', 'Số lượng', 'Đơn giá', ''].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tempDetails.map(d => (
                        <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', color: '#334155' }}>{getProductNameById(d.productId)}</td>
                          <td style={{ padding: '8px 12px', color: '#334155' }}>{d.quantity}</td>
                          <td style={{ padding: '8px 12px', color: '#334155' }}>{d.unitCost}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <button onClick={() => handleRemoveTempDetail(d.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Xóa</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <div style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => { setShowAddModal(false); setTempDetails([]); setDetail(emptyDetail); }} style={btnSecondary}>Hủy</button>
              <button onClick={handleAdd} style={btnPrimary}>💾 Lưu đơn</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sửa */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '480px' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Sửa đơn nhập</h2>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' }}>Mã: {currentOrder.purchaseOrderCode}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#94a3b8' }}>×</button>
            </div>
            <div style={{ padding: '24px 28px' }}>
              <label style={labelStyle}>Mã đơn</label>
              <input name="purchaseOrderCode" value={currentOrder.purchaseOrderCode} disabled style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }} />
              <label style={labelStyle}>Nhà cung cấp *</label>
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Tìm nhà cung cấp..."
                  value={supplierQuery}
                  onFocus={() => setSupplierOpen(true)}
                  onBlur={() => setTimeout(() => setSupplierOpen(false), 150)}
                  onChange={(e) => { setSupplierQuery(e.target.value); setSupplierOpen(true); setCurrentOrder(prev => ({ ...prev, supplierId: null })); }}
                  className="po-input"
                  style={{ ...inputStyle, marginBottom: 0 }}
                />
                {supplierOpen && filteredSuppliers.length > 0 && (
                  <div style={{ position: 'absolute', zIndex: 20, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '8px', width: '100%', maxHeight: '180px', overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', marginTop: '2px' }}>
                    {filteredSuppliers.slice(0, 10).map(s => (
                      <div key={s.supplierId} style={{ padding: '9px 14px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                        onMouseDown={() => { setCurrentOrder(prev => ({ ...prev, supplierId: s.supplierId })); setSupplierQuery(s.supplierName || ''); setSupplierOpen(false); }}>
                        {s.supplierName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Ngày nhập</label>
                  <input name="orderDate" type="date" value={currentOrder.orderDate} onChange={handleInputChange} className="po-input" style={{ ...inputStyle }} />
                </div>
                <div>
                  <label style={labelStyle}>Tổng tiền</label>
                  <input name="totalAmount" type="number" placeholder="0" value={currentOrder.totalAmount} onChange={handleInputChange} className="po-input" style={{ ...inputStyle }} />
                </div>
              </div>
              <label style={labelStyle}>Trạng thái</label>
              <select name="status" value={currentOrder.status !== null && currentOrder.status !== undefined ? String(currentOrder.status) : ''} onChange={handleInputChange} className="po-input" style={{ ...inputStyle }}>
                <option value="">Chọn trạng thái</option>
                {PURCHASE_ORDER_STATUSES.map(s => <option key={s.value} value={String(s.value)}>{s.label}</option>)}
              </select>
            </div>
            <div style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowEditModal(false)} style={btnSecondary}>Hủy</button>
              <button onClick={handleEdit} style={btnPrimary}>💾 Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xóa */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '400px' }}>
            <div style={{ padding: '32px 28px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
              <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Xác nhận xóa?</h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px' }}>
                Đơn <strong>{currentOrder.purchaseOrderCode}</strong> sẽ bị xóa vĩnh viễn và không thể khôi phục.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button onClick={() => setShowDeleteModal(false)} style={btnSecondary}>Hủy bỏ</button>
                <button onClick={handleDelete} style={btnDanger}>Xác nhận xóa</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chi tiết */}
      {showDetailModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '580px', maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Chi tiết đơn hàng</h2>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#3b82f6', fontWeight: '600' }}>{currentOrder.purchaseOrderCode}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#94a3b8' }}>×</button>
            </div>
            <div style={{ padding: '24px 28px' }}>
              <div className="section-card">
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>➕ Thêm sản phẩm</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={labelStyle}>ID Sản phẩm</label>
                    <input name="productId" placeholder="Mã SP" value={detail.productId} onChange={e => setDetail(d => ({ ...d, productId: e.target.value }))} className="po-input" style={{ ...inputStyle, marginBottom: 0 }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Số lượng</label>
                    <input name="quantity" type="number" placeholder="0" value={detail.quantity} onChange={e => setDetail(d => ({ ...d, quantity: e.target.value }))} className="po-input" style={{ ...inputStyle, marginBottom: 0 }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Đơn giá</label>
                    <input name="unitCost" type="number" placeholder="0" value={detail.unitCost} onChange={e => setDetail(d => ({ ...d, unitCost: e.target.value }))} className="po-input" style={{ ...inputStyle, marginBottom: 0 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleAddDetail} style={btnPrimary}>💾 Lưu chi tiết</button>
                </div>
              </div>

              <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>📦 Danh sách sản phẩm</div>
              <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['ID', 'Sản phẩm', 'Số lượng', 'Đơn giá', 'Thành tiền'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #e2e8f0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails.map(d => (
                      <tr key={d.purchaseOrderDetailId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px', color: '#64748b' }}>{d.purchaseOrderDetailId}</td>
                        <td style={{ padding: '10px 14px', color: '#334155', fontWeight: '600' }}>{d.productId}</td>
                        <td style={{ padding: '10px 14px', color: '#334155' }}>{d.quantity}</td>
                        <td style={{ padding: '10px 14px', color: '#334155' }}>{formatCurrency(d.unitCost)}</td>
                        <td style={{ padding: '10px 14px', color: '#0f172a', fontWeight: '600' }}>{formatCurrency(d.lineTotal)}</td>
                      </tr>
                    ))}
                    {orderDetails.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '14px' }}>Chưa có chi tiết nào</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDetailModal(false)} style={btnSecondary}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrder;