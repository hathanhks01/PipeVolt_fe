import React, { useEffect, useState } from 'react';
import SupplierService from '../../../Services/SupplierService';

const emptySupplier = {
  supplierId: null,
  supplierName: '',
  address: '',
  phone: '',
  email: '',
};

const Supplier = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(emptySupplier);
  const [errors, setErrors] = useState({});

  // Fetch suppliers on mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await SupplierService.getAll();
      setSuppliers(res.data || []);
      setFilteredSuppliers(res.data || []);
    } catch {
      setSuppliers([]);
      setFilteredSuppliers([]);
    }
  };

  // Real-time search filter
  useEffect(() => {
    const filtered = suppliers.filter(s =>
      (s.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSuppliers(filtered);
  }, [searchTerm, suppliers]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setCurrentSupplier(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!currentSupplier.supplierName?.trim()) newErrors.supplierName = true;
    if (!currentSupplier.address?.trim()) newErrors.address = true;
    if (!currentSupplier.phone?.trim()) newErrors.phone = true;
    if (!currentSupplier.email?.trim()) newErrors.email = true;

    // Email validation
    if (currentSupplier.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(currentSupplier.email)) newErrors.email = 'invalid';
    }

    // Phone validation
    if (currentSupplier.phone?.trim()) {
      const phoneRegex = /^[0-9\-+()\s]+$/;
      if (!phoneRegex.test(currentSupplier.phone)) newErrors.phone = 'invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        supplierName: currentSupplier.supplierName.trim(),
        address: currentSupplier.address.trim(),
        phone: currentSupplier.phone.trim(),
        email: currentSupplier.email.trim(),
      };

      await SupplierService.create(payload);
      setShowAddModal(false);
      setCurrentSupplier(emptySupplier);
      setErrors({});
      fetchSuppliers();
    } catch (e) {
      alert('Thêm nhà cung cấp thất bại: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleEdit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        supplierId: currentSupplier.supplierId,
        supplierName: currentSupplier.supplierName.trim(),
        address: currentSupplier.address.trim(),
        phone: currentSupplier.phone.trim(),
        email: currentSupplier.email.trim(),
      };

      await SupplierService.update(currentSupplier.supplierId, payload);
      setShowEditModal(false);
      setCurrentSupplier(emptySupplier);
      setErrors({});
      fetchSuppliers();
    } catch (e) {
      alert('Cập nhật nhà cung cấp thất bại: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleDelete = async () => {
    try {
      await SupplierService.remove(currentSupplier.supplierId);
      setShowDeleteModal(false);
      setCurrentSupplier(emptySupplier);
      fetchSuppliers();
    } catch (e) {
      alert('Xóa nhà cung cấp thất bại: ' + (e.response?.data?.message || e.message));
    }
  };

  // Styles definitions
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

  const getErrorBorder = (fieldName) => {
    if (!errors[fieldName]) return '1.5px solid #e2e8f0';
    return errors[fieldName] === 'invalid' ? '2px solid #f59e0b' : '2px solid #ef4444';
  };

  const getErrorBgColor = (fieldName) => {
    if (!errors[fieldName]) return '#fff';
    if (errors[fieldName] === 'invalid') return '#fffbeb';
    return '#fef2f2';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px', fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .supplier-table tr:hover td { background: #f0f9ff !important; }
        .supplier-input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
        .action-btn { background: none; border: none; cursor: pointer; font-size: 13px; font-weight: 600; padding: 5px 10px; border-radius: 6px; transition: background 0.15s; }
        .action-btn.edit { color: #3b82f6; } .action-btn.edit:hover { background: #eff6ff; }
        .action-btn.delete { color: #ef4444; } .action-btn.delete:hover { background: #fef2f2; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.45); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 24px; backdrop-filter: blur(2px); }
        .modal-box { background: #fff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.18); width: 100%; animation: slideUp 0.25s ease; }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      {/* Header Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            🏭 Quản lý nhà cung cấp
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0' }}>
            {filteredSuppliers.length} nhà cung cấp
          </p>
        </div>
        <button
          style={btnPrimary}
          onClick={() => {
            setCurrentSupplier(emptySupplier);
            setErrors({});
            setShowAddModal(true);
          }}
        >
          + Thêm NCC mới
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '380px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }}>🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, địa chỉ, SĐT, email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="supplier-input"
            style={{ ...inputStyle, marginBottom: 0, paddingLeft: '38px', width: '380px' }}
          />
        </div>
      </div>

      {/* Table Container */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <table className="supplier-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              {['Mã NCC', 'Tên NCC', 'Địa chỉ', 'SĐT', 'Email', 'Hành động'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '15px' }}>
                  Không có dữ liệu nhà cung cấp
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((supplier) => (
                <tr key={supplier.supplierId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontWeight: '600', color: '#1e293b', fontFamily: 'monospace', fontSize: '13px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                      #{supplier.supplierId || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px', color: '#334155', fontSize: '14px', fontWeight: '600' }}>
                    {supplier.supplierName || '—'}
                  </td>
                  <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>
                    {supplier.address || '—'}
                  </td>
                  <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>
                    <a href={`tel:${supplier.phone}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                      {supplier.phone || '—'}
                    </a>
                  </td>
                  <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>
                    <a href={`mailto:${supplier.email}`} style={{ color: '#3b82f6', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: '180px' }}>
                      {supplier.email || '—'}
                    </a>
                  </td>
                  <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                    <button
                      className="action-btn edit"
                      onClick={() => {
                        setCurrentSupplier(supplier);
                        setErrors({});
                        setShowEditModal(true);
                      }}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => {
                        setCurrentSupplier(supplier);
                        setShowDeleteModal(true);
                      }}
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '520px' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Thêm nhà cung cấp mới</h2>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' }}>Điền thông tin chi tiết nhà cung cấp</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setCurrentSupplier(emptySupplier);
                  setErrors({});
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#94a3b8', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '24px 28px' }}>
              <label style={labelStyle}>Tên nhà cung cấp *</label>
              <input
                type="text"
                name="supplierName"
                placeholder="Nhập tên nhà cung cấp"
                value={currentSupplier.supplierName}
                onChange={handleInputChange}
                className="supplier-input"
                style={{
                  ...inputStyle,
                  borderColor: getErrorBorder('supplierName'),
                  background: getErrorBgColor('supplierName'),
                }}
              />
              {errors.supplierName && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '-8px', marginBottom: '8px' }}>
                  Vui lòng nhập tên nhà cung cấp
                </p>
              )}

              <label style={labelStyle}>Địa chỉ *</label>
              <input
                type="text"
                name="address"
                placeholder="Nhập địa chỉ"
                value={currentSupplier.address}
                onChange={handleInputChange}
                className="supplier-input"
                style={{
                  ...inputStyle,
                  borderColor: getErrorBorder('address'),
                  background: getErrorBgColor('address'),
                }}
              />
              {errors.address && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '-8px', marginBottom: '8px' }}>
                  Vui lòng nhập địa chỉ
                </p>
              )}

              <label style={labelStyle}>Số điện thoại *</label>
              <input
                type="text"
                name="phone"
                placeholder="Nhập số điện thoại"
                value={currentSupplier.phone}
                onChange={handleInputChange}
                className="supplier-input"
                style={{
                  ...inputStyle,
                  borderColor: getErrorBorder('phone'),
                  background: getErrorBgColor('phone'),
                }}
              />
              {errors.phone && (
                <p style={{ color: errors.phone === 'invalid' ? '#f59e0b' : '#ef4444', fontSize: '12px', marginTop: '-8px', marginBottom: '8px' }}>
                  {errors.phone === 'invalid' ? 'Số điện thoại không hợp lệ' : 'Vui lòng nhập số điện thoại'}
                </p>
              )}

              <label style={labelStyle}>Email *</label>
              <input
                type="text"
                name="email"
                placeholder="Nhập email"
                value={currentSupplier.email}
                onChange={handleInputChange}
                className="supplier-input"
                style={{
                  ...inputStyle,
                  borderColor: getErrorBorder('email'),
                  background: getErrorBgColor('email'),
                  marginBottom: 0,
                }}
              />
              {errors.email && (
                <p style={{ color: errors.email === 'invalid' ? '#f59e0b' : '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  {errors.email === 'invalid' ? 'Email không hợp lệ' : 'Vui lòng nhập email'}
                </p>
              )}
            </div>

            <div style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setCurrentSupplier(emptySupplier);
                  setErrors({});
                }}
                style={btnSecondary}
              >
                Hủy
              </button>
              <button onClick={handleAdd} style={btnPrimary}>
                💾 Lưu nhà cung cấp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '520px' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Cập nhật nhà cung cấp</h2>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#3b82f6', fontWeight: '600' }}>Mã: #{currentSupplier.supplierId}</p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setCurrentSupplier(emptySupplier);
                  setErrors({});
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#94a3b8', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '24px 28px' }}>
              <label style={labelStyle}>Tên nhà cung cấp *</label>
              <input
                type="text"
                name="supplierName"
                placeholder="Nhập tên nhà cung cấp"
                value={currentSupplier.supplierName}
                onChange={handleInputChange}
                className="supplier-input"
                style={{
                  ...inputStyle,
                  borderColor: getErrorBorder('supplierName'),
                  background: getErrorBgColor('supplierName'),
                }}
              />
              {errors.supplierName && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '-8px', marginBottom: '8px' }}>
                  Vui lòng nhập tên nhà cung cấp
                </p>
              )}

              <label style={labelStyle}>Địa chỉ *</label>
              <input
                type="text"
                name="address"
                placeholder="Nhập địa chỉ"
                value={currentSupplier.address}
                onChange={handleInputChange}
                className="supplier-input"
                style={{
                  ...inputStyle,
                  borderColor: getErrorBorder('address'),
                  background: getErrorBgColor('address'),
                }}
              />
              {errors.address && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '-8px', marginBottom: '8px' }}>
                  Vui lòng nhập địa chỉ
                </p>
              )}

              <label style={labelStyle}>Số điện thoại *</label>
              <input
                type="text"
                name="phone"
                placeholder="Nhập số điện thoại"
                value={currentSupplier.phone}
                onChange={handleInputChange}
                className="supplier-input"
                style={{
                  ...inputStyle,
                  borderColor: getErrorBorder('phone'),
                  background: getErrorBgColor('phone'),
                }}
              />
              {errors.phone && (
                <p style={{ color: errors.phone === 'invalid' ? '#f59e0b' : '#ef4444', fontSize: '12px', marginTop: '-8px', marginBottom: '8px' }}>
                  {errors.phone === 'invalid' ? 'Số điện thoại không hợp lệ' : 'Vui lòng nhập số điện thoại'}
                </p>
              )}

              <label style={labelStyle}>Email *</label>
              <input
                type="text"
                name="email"
                placeholder="Nhập email"
                value={currentSupplier.email}
                onChange={handleInputChange}
                className="supplier-input"
                style={{
                  ...inputStyle,
                  borderColor: getErrorBorder('email'),
                  background: getErrorBgColor('email'),
                  marginBottom: 0,
                }}
              />
              {errors.email && (
                <p style={{ color: errors.email === 'invalid' ? '#f59e0b' : '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  {errors.email === 'invalid' ? 'Email không hợp lệ' : 'Vui lòng nhập email'}
                </p>
              )}
            </div>

            <div style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setCurrentSupplier(emptySupplier);
                  setErrors({});
                }}
                style={btnSecondary}
              >
                Hủy
              </button>
              <button onClick={handleEdit} style={btnPrimary}>
                💾 Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '400px' }}>
            <div style={{ padding: '32px 28px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
              <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Xác nhận xóa?</h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px', lineHeight: '1.5' }}>
                Nhà cung cấp <strong>{currentSupplier.supplierName}</strong> sẽ bị xóa vĩnh viễn và không thể khôi phục.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCurrentSupplier(emptySupplier);
                  }}
                  style={btnSecondary}
                >
                  Hủy bỏ
                </button>
                <button onClick={handleDelete} style={btnDanger}>
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Supplier;