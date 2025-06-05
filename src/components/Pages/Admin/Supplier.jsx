import React, { useEffect, useState } from 'react';
import SupplierService from '../../../Services/SupplierService';

const emptySupplier = {
  supplierId: null,
  supplierName: '',
  address: '',
  phone: '',
  email: ''
};

const Supplier = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(emptySupplier);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await SupplierService.getAll();
      setSuppliers(res.data || []);
    } catch {
      setSuppliers([]);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setCurrentSupplier(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async () => {
    try {
      await SupplierService.create({
        supplierName: currentSupplier.supplierName,
        address: currentSupplier.address,
        phone: currentSupplier.phone,
        email: currentSupplier.email
      });
      setShowAddModal(false);
      fetchSuppliers();
    } catch {
      alert('Thêm nhà cung cấp thất bại');
    }
  };

  const handleEdit = async () => {
    try {
      await SupplierService.update(currentSupplier.supplierId, {
        supplierId: currentSupplier.supplierId,
        supplierName: currentSupplier.supplierName,
        address: currentSupplier.address,
        phone: currentSupplier.phone,
        email: currentSupplier.email
      });
      setShowEditModal(false);
      fetchSuppliers();
    } catch {
      alert('Cập nhật thất bại');
    }
  };

  const handleDelete = async () => {
    try {
      await SupplierService.remove(currentSupplier.supplierId);
      setShowDeleteModal(false);
      fetchSuppliers();
    } catch {
      alert('Xóa thất bại');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý nhà cung cấp</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, địa chỉ, SĐT..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button onClick={() => { setCurrentSupplier(emptySupplier); setShowAddModal(true); }} className="bg-blue-500 text-white px-3 py-1 rounded">
          Thêm mới
        </button>
      </div>
      <table className="w-full border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Tên nhà cung cấp</th>
            <th className="border px-2 py-1">Địa chỉ</th>
            <th className="border px-2 py-1">SĐT</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {suppliers
            .filter(s =>
              (s.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (s.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (s.phone || '').includes(searchTerm)
            )
            .map(supplier => (
              <tr key={supplier.supplierId}>
                <td className="border px-2 py-1">{supplier.supplierId}</td>
                <td className="border px-2 py-1">{supplier.supplierName}</td>
                <td className="border px-2 py-1">{supplier.address}</td>
                <td className="border px-2 py-1">{supplier.phone}</td>
                <td className="border px-2 py-1">{supplier.email}</td>
                <td className="border px-2 py-1">
                  <button
                    onClick={() => { setCurrentSupplier(supplier); setShowEditModal(true); }}
                    className="text-blue-600 mr-2"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => { setCurrentSupplier(supplier); setShowDeleteModal(true); }}
                    className="text-red-600"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {/* Modal Thêm */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="font-bold mb-2">Thêm nhà cung cấp</h2>
            <input name="supplierName" placeholder="Tên nhà cung cấp" value={currentSupplier.supplierName} onChange={handleInputChange} className="border w-full mb-2 px-2 py-1" />
            <input name="address" placeholder="Địa chỉ" value={currentSupplier.address} onChange={handleInputChange} className="border w-full mb-2 px-2 py-1" />
            <input name="phone" placeholder="Số điện thoại" value={currentSupplier.phone} onChange={handleInputChange} className="border w-full mb-2 px-2 py-1" />
            <input name="email" placeholder="Email" value={currentSupplier.email} onChange={handleInputChange} className="border w-full mb-2 px-2 py-1" />
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
            <h2 className="font-bold mb-2">Sửa nhà cung cấp</h2>
            <input name="supplierName" placeholder="Tên nhà cung cấp" value={currentSupplier.supplierName} onChange={handleInputChange} className="border w-full mb-2 px-2 py-1" />
            <input name="address" placeholder="Địa chỉ" value={currentSupplier.address} onChange={handleInputChange} className="border w-full mb-2 px-2 py-1" />
            <input name="phone" placeholder="Số điện thoại" value={currentSupplier.phone} onChange={handleInputChange} className="border w-full mb-2 px-2 py-1" />
            <input name="email" placeholder="Email" value={currentSupplier.email} onChange={handleInputChange} className="border w-full mb-2 px-2 py-1" />
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
    </div>
  );
};

export default Supplier;