import React, { useState, useEffect } from 'react';
import UserAccountService from '../../../Services/UserAccountService';

const UserAccount = () => {
    const [userAccounts, setUserAccounts] = useState([]);
    const [filteredUserAccounts, setFilteredUserAccounts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20); // Number of user accounts per page
    const [currentUserAccount, setCurrentUserAccount] = useState({
        userId: null,
        username: '',
        password: '',
        userType: '',
        employeeId: '',
        customerId: '',
        status: ''
    });

    const emptyUserAccount = {
        userId: null,
        username: '',
        password: '',
        userType: '',
        employeeId: '',
        customerId: '',
        status: ''
    };

    useEffect(() => {
        fetchUserAccounts();
    }, []);

    const fetchUserAccounts = async () => {
        try {
            const response = await UserAccountService.getAllUserAccounts();
            // Đảm bảo lấy đúng mảng dữ liệu từ response.data
            const data = Array.isArray(response.data) ? response.data : [];
            setUserAccounts(data);
            setFilteredUserAccounts(data);
        } catch (error) {
            console.error('Error fetching user accounts:', error.response?.data || error.message);
            setUserAccounts([]);
            setFilteredUserAccounts([]);
            alert('Không thể tải danh sách tài khoản người dùng. Vui lòng thử lại.');
        }
    };

    useEffect(() => {
        const filtered = Array.isArray(userAccounts) ? userAccounts.filter(account =>
            (account.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (account.userType?.toString() || '').includes(searchTerm.toLowerCase())
        ) : [];
        setFilteredUserAccounts(filtered);
        setCurrentPage(1); // Reset to first page when search term changes
    }, [searchTerm, userAccounts]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentUserAccount(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const resetForm = () => {
        setCurrentUserAccount({ ...emptyUserAccount });
    };

    const handleAddUserAccount = async () => {
        try {
            if (!currentUserAccount.username || !currentUserAccount.password || !currentUserAccount.userType) {
                alert('Tên người dùng, mật khẩu và loại người dùng là bắt buộc!');
                return;
            }

            const userData = {
                username: currentUserAccount.username,
                password: currentUserAccount.password,
                userType: parseInt(currentUserAccount.userType),
                employeeId: currentUserAccount.employeeId ? parseInt(currentUserAccount.employeeId) : null,
                customerId: currentUserAccount.customerId ? parseInt(currentUserAccount.customerId) : null,
                status: currentUserAccount.status ? parseInt(currentUserAccount.status) : null
            };

            await UserAccountService.createUserAccount(userData);
            setShowAddModal(false);
            resetForm();
            fetchUserAccounts();
            alert('Thêm tài khoản người dùng thành công!');
        } catch (error) {
            console.error('Error adding user account:', error);
            alert(`Không thể thêm tài khoản người dùng: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleEditUserAccount = async () => {
        try {
            if (!currentUserAccount.username || !currentUserAccount.userType) {
                alert('Tên người dùng và loại người dùng là bắt buộc!');
                return;
            }

            const userData = {
                username: currentUserAccount.username,
                password: currentUserAccount.password || null, // Password is optional for update
                userType: parseInt(currentUserAccount.userType),
                employeeId: currentUserAccount.employeeId ? parseInt(currentUserAccount.employeeId) : null,
                customerId: currentUserAccount.customerId ? parseInt(currentUserAccount.customerId) : null,
                status: currentUserAccount.status ? parseInt(currentUserAccount.status) : null
            };

            await UserAccountService.updateUserAccount(currentUserAccount.userId, userData);
            setShowEditModal(false);
            resetForm();
            fetchUserAccounts();
            alert('Cập nhật tài khoản người dùng thành công!');
        } catch (error) {
            console.error('Error updating user account:', error);
            alert(`Không thể cập nhật tài khoản người dùng: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteUserAccount = async () => {
        try {
            await UserAccountService.deleteUserAccount(currentUserAccount.userId);
            setShowDeleteModal(false);
            fetchUserAccounts();
            alert('Xóa tài khoản người dùng thành công!');
        } catch (error) {
            console.error('Error deleting user account:', error);
            alert(`Không thể xóa tài khoản người dùng: ${error.response?.data?.message || error.message}`);
        }
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (account) => {
        setCurrentUserAccount({
            userId: account.userId,
            username: account.username || '',
            password: '', // Password is not fetched for security, leave empty
            userType: account.userType || '',
            employeeId: account.employeeId || '',
            customerId: account.customerId || '',
            status: account.status || ''
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (account) => {
        setCurrentUserAccount(account);
        setShowDeleteModal(true);
    };

    // Pagination logic
    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    const currentItems = Array.isArray(filteredUserAccounts) ? filteredUserAccounts.slice(indexOfFirstItem, indexOfLastItem) : [];
    const totalPages = Math.ceil((Array.isArray(filteredUserAccounts) ? filteredUserAccounts.length : 0) / pageSize);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="p-4" style={{ fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
                .admin-table tr:hover td { background: #f0f9ff !important; }
                .action-btn { background: none; border: none; cursor: pointer; font-size: 13px; font-weight: 600; padding: 5px 10px; border-radius: 6px; transition: background 0.15s; }
                .action-btn.edit { color: #3b82f6; } .action-btn.edit:hover { background: #eff6ff; }
                .action-btn.delete { color: #ef4444; } .action-btn.delete:hover { background: #fef2f2; }
            `}</style>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Danh sách tài khoản người dùng</h1>
                <button
                    onClick={openAddModal}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Thêm tài khoản
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên người dùng hoặc loại người dùng..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div style={{ background: '#fff', borderRadius: '14px', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            {['Mã tài khoản', 'Tên người dùng', 'Loại người dùng', 'Mã nhân viên', 'Mã khách hàng', 'Trạng thái', 'Thao tác'].map(h => (
                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item, index) => (
                            <tr key={item.userId || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '13px 16px' }}>
                                    <span style={{ fontWeight: '600', color: '#1e293b', fontFamily: 'monospace', fontSize: '13px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                                        #{item.userId}
                                    </span>
                                </td>
                                <td style={{ padding: '13px 16px', color: '#334155', fontSize: '14px', fontWeight: '600' }}>{item.username || 'N/A'}</td>
                                <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>
                                    {item.userType === 0 && <span style={{ fontWeight: '600', color: '#3b82f6' }}>Admin</span>}
                                    {item.userType === 1 && <span style={{ fontWeight: '600', color: '#10b981' }}>Employee</span>}
                                    {item.userType === 2 && <span style={{ fontWeight: '600', color: '#6366f1' }}>Customer</span>}
                                    {(item.userType !== 0 && item.userType !== 1 && item.userType !== 2) && 'N/A'}
                                </td>
                                <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>{item.employeeId || 'N/A'}</td>
                                <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>{item.customerId || 'N/A'}</td>
                                <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>{item.status || 'N/A'}</td>
                                <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                                    <button
                                        onClick={() => openEditModal(item)}
                                        className="action-btn edit"
                                        style={{ marginRight: '4px' }}
                                    >
                                        ✏️ Sửa
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(item)}
                                        className="action-btn delete"
                                    >
                                        🗑️ Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg border transition-colors ${currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Trước
                    </button>
                    <div className="flex space-x-1">
                        {[...Array(totalPages)].map((_, index) => {
                            const page = index + 1;
                            const isCurrentPage = page === currentPage;
                            if (
                                page === 1 ||
                                page === totalPages ||
                                Math.abs(page - currentPage) <= 1
                            ) {
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-2 rounded-lg transition-colors ${isCurrentPage
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            }
                            if (
                                (page === 2 && currentPage > 4) ||
                                (page === totalPages - 1 && currentPage < totalPages - 3)
                            ) {
                                return (
                                    <span key={page} className="px-3 py-2 text-gray-400">
                                        ...
                                    </span>
                                );
                            }
                            return null;
                        })}
                    </div>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg border transition-colors ${currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Sau
                    </button>
                </div>
            )}

            {/* Add User Account Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Thêm tài khoản mới</h2>
                        <div>
                            <div className="mb-4">
                                <label htmlFor="add-username" className="block mb-1 font-medium">Tên người dùng</label>
                                <input
                                    id="add-username"
                                    type="text"
                                    name="username"
                                    value={currentUserAccount.username}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-password" className="block mb-1 font-medium">Mật khẩu</label>
                                <input
                                    id="add-password"
                                    type="password"
                                    name="password"
                                    value={currentUserAccount.password}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-user-type" className="block mb-1 font-medium">Loại người dùng</label>
                                <input
                                    id="add-user-type"
                                    type="number"
                                    name="userType"
                                    value={currentUserAccount.userType}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-employee-id" className="block mb-1 font-medium">Mã nhân viên</label>
                                <input
                                    id="add-employee-id"
                                    type="number"
                                    name="employeeId"
                                    value={currentUserAccount.employeeId}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-customer-id" className="block mb-1 font-medium">Mã khách hàng</label>
                                <input
                                    id="add-customer-id"
                                    type="number"
                                    name="customerId"
                                    value={currentUserAccount.customerId}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-status" className="block mb-1 font-medium">Trạng thái</label>
                                <input
                                    id="add-status"
                                    type="number"
                                    name="status"
                                    value={currentUserAccount.status}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetForm();
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                    onClick={handleAddUserAccount}
                                >
                                    Thêm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Account Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Sửa tài khoản</h2>
                        <div>
                            <div className="mb-4">
                                <label htmlFor="edit-username" className="block mb-1 font-medium">Tên người dùng</label>
                                <input
                                    id="edit-username"
                                    type="text"
                                    name="username"
                                    value={currentUserAccount.username}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-password" className="block mb-1 font-medium">Mật khẩu (để trống nếu không thay đổi)</label>
                                <input
                                    id="edit-password"
                                    type="password"
                                    name="password"
                                    value={currentUserAccount.password}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-user-type" className="block mb-1 font-medium">Loại người dùng</label>
                                <input
                                    id="edit-user-type"
                                    type="number"
                                    name="userType"
                                    value={currentUserAccount.userType}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-employee-id" className="block mb-1 font-medium">Mã nhân viên</label>
                                <input
                                    id="edit-employee-id"
                                    type="number"
                                    name="employeeId"
                                    value={currentUserAccount.employeeId}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-customer-id" className="block mb-1 font-medium">Mã khách hàng</label>
                                <input
                                    id="edit-customer-id"
                                    type="number"
                                    name="customerId"
                                    value={currentUserAccount.customerId}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-status" className="block mb-1 font-medium">Trạng thái</label>
                                <input
                                    id="edit-status"
                                    type="number"
                                    name="status"
                                    value={currentUserAccount.status}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        resetForm();
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                                    onClick={handleEditUserAccount}
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete User Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
                        <p className="mb-6">
                            Bạn có chắc chắn muốn xóa tài khoản "{currentUserAccount.username}"?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                onClick={handleDeleteUserAccount}
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserAccount;