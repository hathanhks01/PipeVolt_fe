import React, { useEffect, useState } from 'react';
import CustomerService from '../../../Services/CustomerService';
import JwtUtils from '../../../constants/JwtUtils';

const Profile = () => {
  const [customer, setCustomer] = useState({
    customerId: '',
    customerName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(customer);

  useEffect(() => {
    // Lấy userId từ token hoặc session
    const userId = JwtUtils.getCurrentUserId();
    if (userId) {
      CustomerService.getCustomerByUserId(userId)
        .then(data => {
          setCustomer(data);
          setForm(data);
        })
        .catch(() => {
          // Xử lý lỗi nếu cần
        });
    }
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // Chỉ cập nhật các trường cho UpdateCustomerDto
      const updateDto = {
        customerId: form.customerId,
        customerName: form.customerName,
        email: form.email,
        phone: form.phone,
        address: form.address
      };
      await CustomerService.updateCustomer(form.customerId, updateDto);
      setCustomer({ ...customer, ...form });
      setEditMode(false);
      alert('Cập nhật thành công!');
    } catch {
      alert('Cập nhật thất bại');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white rounded shadow p-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-600">Thông tin cá nhân</h2>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Tên khách hàng:</label>
        {editMode ? (
          <input
            name="customerName"
            value={form.customerName || ''}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full"
          />
        ) : (
          <div className="border px-3 py-2 rounded bg-gray-100">{customer.customerName || 'Chưa cập nhật'}</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Email:</label>
        {editMode ? (
          <input
            name="email"
            value={form.email || ''}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full"
          />
        ) : (
          <div className="border px-3 py-2 rounded bg-gray-100">{customer.email || 'Chưa cập nhật'}</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Số điện thoại:</label>
        {editMode ? (
          <input
            name="phone"
            value={form.phone || ''}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full"
          />
        ) : (
          <div className="border px-3 py-2 rounded bg-gray-100">{customer.phone || 'Chưa cập nhật'}</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Địa chỉ:</label>
        {editMode ? (
          <input
            name="address"
            value={form.address || ''}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full"
          />
        ) : (
          <div className="border px-3 py-2 rounded bg-gray-100">{customer.address || 'Chưa cập nhật'}</div>
        )}
      </div>
      <div className="flex gap-2">
        {editMode ? (
          <>
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Lưu
            </button>
            <button
              onClick={() => { setEditMode(false); setForm(customer); }}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Hủy
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Sửa thông tin
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;