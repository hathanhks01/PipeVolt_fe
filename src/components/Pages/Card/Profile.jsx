import React, { useEffect, useState } from 'react';
import UserAccountService from '../../../services/UserAccountService';
const Profile = () => {
  const [user, setUser] = useState({
    userAccountId: '',
    username: '',
    email: '',
    fullName: '',
    phone: '',
    address: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(user);

  useEffect(() => {
    // Lấy username từ sessionStorage
    const usernameStr = sessionStorage.getItem('username');
    if (usernameStr) {
      let username = usernameStr;
      try {
        username = JSON.parse(usernameStr);
      } catch {}
      // Gọi API lấy thông tin user theo username
      UserAccountService.getUserAccountByUsername(username)
        .then(data => {
          setUser(data);
          setForm(data);
        })
        .catch(() => {
          setUser(prev => ({ ...prev, username }));
        });
    }
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
  try {
    // Lấy các trường cần thiết cho UpdateUserAccountDto
    const updateDto = {
      username: form.username,
      password: form.password || undefined, // Nếu có cho phép đổi mật khẩu
      userType: form.userType ?? user.userType ?? 0, // hoặc giá trị mặc định
      employeeId: form.employeeId ?? user.employeeId ?? null,
      customerId: form.customerId ?? user.customerId ?? null,
      status: form.status ?? user.status ?? 1,
      // Các trường bổ sung (nếu BE map được)
      email: form.email,
      fullName: form.fullName,
      phone: form.phone,
      address: form.address
    };
    await UserAccountService.updateUserAccount(form.userAccountId, updateDto);
    setUser({ ...user, ...form });
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
        <label className="block font-semibold mb-1">Tên đăng nhập:</label>
        <div className="border px-3 py-2 rounded bg-gray-100">{user.username}</div>
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
          <div className="border px-3 py-2 rounded bg-gray-100">{user.email || 'Chưa cập nhật'}</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Họ tên:</label>
        {editMode ? (
          <input
            name="fullName"
            value={form.fullName || ''}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full"
          />
        ) : (
          <div className="border px-3 py-2 rounded bg-gray-100">{user.fullName || 'Chưa cập nhật'}</div>
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
          <div className="border px-3 py-2 rounded bg-gray-100">{user.phone || 'Chưa cập nhật'}</div>
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
          <div className="border px-3 py-2 rounded bg-gray-100">{user.address || 'Chưa cập nhật'}</div>
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
              onClick={() => { setEditMode(false); setForm(user); }}
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