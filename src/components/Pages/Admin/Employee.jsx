import React, { useState, useEffect } from 'react';
import EmployeeService from '../../../Services/EmployeeService';
import { showAlert } from '../../../common/ui';

const Employee = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAccountModal, setShowAccountModal] = useState(false);

    // State chứa dữ liệu nhân viên hiện tại để thao tác Add/Edit/Delete
    const [currentEmployee, setCurrentEmployee] = useState({
        employeeId: null,
        employeeCode: '',
        employeeName: '',
        position: '',
        phone: '',
        email: '',
        hireDate: '',
    });

    const [accountInfo, setAccountInfo] = useState(null);

    // Lấy danh sách nhân viên
    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await EmployeeService.getAllEmployees();
            setEmployees(res.data || []);
            setFilteredEmployees(res.data || []);
        } catch (error) {
            console.error('Lỗi lấy danh sách nhân viên:', error);
        }
    };

    // Tìm kiếm nhân viên theo mã hoặc điện thoại
    useEffect(() => {
        const filtered = employees.filter((emp) =>
        (emp.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.phone?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredEmployees(filtered);
    }, [searchTerm, employees]);

    // Xử lý nhập input tìm kiếm
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Xử lý thay đổi input trong form Add/Edit
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentEmployee((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Reset form currentEmployee
    const resetForm = () => {
        setCurrentEmployee({
            employeeId: null,
            employeeCode: '',
            employeeName: '',
            position: '',
            phone: '',
            email: '',
            hireDate: '',
        });
    };

    // Thêm mới nhân viên
    const handleAddEmployee = async () => {
        try {
            const data = {
                employeeCode: currentEmployee.employeeCode,
                employeeName: currentEmployee.employeeName,
                position: currentEmployee.position,
                phone: currentEmployee.phone,
                email: currentEmployee.email,
                hireDate: currentEmployee.hireDate
            };
            await EmployeeService.createEmployee(data);
            setShowAddModal(false);
            resetForm();
            fetchEmployees();
        } catch (error) {
            console.error('Lỗi thêm nhân viên:', error);
        }
    };

    // Cập nhật nhân viên
    const handleEditEmployee = async () => {
        try {
            const data = {
                employeeId: currentEmployee.employeeId,
                employeeCode: currentEmployee.employeeCode,
                employeeName: currentEmployee.employeeName,
                position: currentEmployee.position,
                phone: currentEmployee.phone,
                email: currentEmployee.email,
                hireDate: currentEmployee.hireDate
            };
            await EmployeeService.updateEmployee(currentEmployee.employeeId, data);
            setShowEditModal(false);
            resetForm();
            fetchEmployees();
        } catch (error) {
            console.error('Lỗi cập nhật nhân viên:', error);
        }
    };

    // Xóa nhân viên
    const handleDeleteEmployee = async () => {
        try {
            await EmployeeService.deleteEmployee(currentEmployee.employeeId);
            setShowDeleteModal(false);
            fetchEmployees();
        } catch (error) {
            console.error('Lỗi xóa nhân viên:', error);
        }
    };

    // Mở modal Thêm
    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    // Mở modal Sửa và điền dữ liệu nhân viên cần sửa
    const openEditModal = (emp) => {
        setCurrentEmployee({
            ...emp,
            hireDate: emp.hireDate ? emp.hireDate.split('T')[0] : '',
        });
        setShowEditModal(true);
    };

    // Mở modal Xóa
    const openDeleteModal = (emp) => {
        setCurrentEmployee(emp);
        setShowDeleteModal(true);
    };

    // Tạo tài khoản đăng nhập cho nhân viên
    const handleGenerateAccount = async (employeeId) => {
        try {
            const result = await EmployeeService.generateAccount(employeeId);
            setAccountInfo(result);
            setShowAccountModal(true);
        } catch (error) {
            showAlert('Tạo tài khoản thất bại hoặc nhân viên đã có tài khoản!', 'error');
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
                .action-btn.account { color: #10b981; } .action-btn.account:hover { background: #ecfdf5; }
            `}</style>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Danh sách nhân viên</h1>
                <button
                    onClick={openAddModal}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Thêm nhân viên
                </button>
            </div>

            <input
                type="text"
                placeholder="Tìm kiếm mã nhân viên hoặc số điện thoại..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full border p-2 rounded mb-4"
            />

            <div style={{ background: '#fff', borderRadius: '14px', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            {['#', 'Mã NV', 'Tên NV', 'Chức vụ', 'SĐT', 'Email', 'Ngày vào làm', 'Thao tác'].map(h => (
                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '15px' }}>
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            filteredEmployees.map((emp, idx) => (
                                <tr key={emp.employeeId || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>{idx + 1}</td>
                                    <td style={{ padding: '13px 16px' }}>
                                        <span style={{ fontWeight: '600', color: '#1e293b', fontFamily: 'monospace', fontSize: '13px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                                            {emp.employeeCode || 'N/A'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '13px 16px', color: '#334155', fontSize: '14px', fontWeight: '600' }}>{emp.employeeName || 'N/A'}</td>
                                    <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>{emp.position || 'N/A'}</td>
                                    <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>{emp.phone || 'N/A'}</td>
                                    <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>{emp.email || 'N/A'}</td>
                                    <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>
                                        {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                                        <button
                                            onClick={() => openEditModal(emp)}
                                            className="action-btn edit"
                                            style={{ marginRight: '4px' }}
                                        >
                                            ✏️ Sửa
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(emp)}
                                            className="action-btn delete"
                                            style={{ marginRight: '4px' }}
                                        >
                                            🗑️ Xóa
                                        </button>
                                        <button
                                            onClick={() => handleGenerateAccount(emp.employeeId)}
                                            className="action-btn account"
                                            title="Tạo tài khoản đăng nhập"
                                        >
                                            🔑 Tạo tài khoản
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Thêm */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">Thêm nhân viên</h2>
                        <input
                            type="text"
                            name="employeeName"
                            placeholder="Tên nhân viên *"
                            value={currentEmployee.employeeName}
                            onChange={handleInputChange}
                            className="border p-2 mb-3 w-full rounded"
                        />
                        <input
                            type="text"
                            name="position"
                            placeholder="Chức vụ"
                            value={currentEmployee.position}
                            onChange={handleInputChange}
                            className="border p-2 mb-3 w-full rounded"
                        />
                        <input
                            type="text"
                            name="phone"
                            placeholder="Số điện thoại"
                            value={currentEmployee.phone}
                            onChange={handleInputChange}
                            className="border p-2 mb-3 w-full rounded"
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={currentEmployee.email}
                            onChange={handleInputChange}
                            className="border p-2 mb-3 w-full rounded"
                        />
                        <label className="block mb-1 font-medium">Ngày vào làm</label>
                        <input
                            type="date"
                            name="hireDate"
                            value={currentEmployee.hireDate}
                            onChange={handleInputChange}
                            className="border p-2 mb-3 w-full rounded"
                        />

                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="mr-3 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAddEmployee}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Thêm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Sửa */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <input
                            type="text"
                            name="employeeName"
                            placeholder="Tên nhân viên *"
                            value={currentEmployee.employeeName}
                            onChange={handleInputChange}
                            className="border p-2 mb-3 w-full rounded"
                        />
                        <input
                            type="text"
                            name="position"
                            placeholder="Chức vụ"
                            value={currentEmployee.position}
                            onChange={handleInputChange}
                            className="border p-2 mb-3 w-full rounded"
                        />
                        <input
                            type="text"
                            name="phone"
                            placeholder="Số điện thoại"
                            value={currentEmployee.phone}
                            onChange={handleInputChange}
                            className="border p-2 mb-3 w-full rounded"
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={currentEmployee.email}
                            onChange={handleInputChange}
                            className="border p-2 mb-3 w-full rounded"
                        />
                        <label className="block mb-1 font-medium">Ngày vào làm</label>
                        <input
                            type="date"
                            name="hireDate"
                            value={currentEmployee.hireDate}
                            onChange={handleInputChange}
                            className="border p-2 mb-3 w-full rounded"
                        />

                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="mr-3 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleEditEmployee}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Xóa */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-80">
                        <h2 className="text-xl font-semibold mb-4">Xác nhận xóa</h2>
                        <p>Bạn có chắc muốn xóa nhân viên <strong>{currentEmployee.employeeName}</strong> không?</p>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="mr-3 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDeleteEmployee}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tạo tài khoản */}
            {showAccountModal && accountInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-80">
                        <h2 className="text-xl font-semibold mb-4 text-green-600">Tạo tài khoản thành công!</h2>
                        <div className="mb-2">Tên đăng nhập: <strong>{accountInfo.username}</strong></div>
                        <div className="mb-4">Mật khẩu mặc định: <strong>{accountInfo.username}</strong></div>
                        <button
                            onClick={() => setShowAccountModal(false)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employee;
