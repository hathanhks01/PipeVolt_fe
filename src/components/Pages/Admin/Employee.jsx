import React, { useState, useEffect } from 'react';
import EmployeeService from '../../../Services/EmployeeService';

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
            alert('Tạo tài khoản thất bại hoặc nhân viên đã có tài khoản!');
        }
    };

    return (
        <div className="p-4">
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

            <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border px-3 py-2">#</th>
                        <th className="border px-3 py-2">Mã NV</th>
                        <th className="border px-3 py-2">Tên NV</th>
                        <th className="border px-3 py-2">Chức vụ</th>
                        <th className="border px-3 py-2">SĐT</th>
                        <th className="border px-3 py-2">Email</th>
                        <th className="border px-3 py-2">Ngày vào làm</th>
                        <th className="border px-3 py-2">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEmployees.length === 0 && (
                        <tr>
                            <td colSpan={8} className="text-center p-3">
                                Không có dữ liệu
                            </td>
                        </tr>
                    )}
                    {filteredEmployees.map((emp, idx) => (
                        <tr key={emp.employeeId || idx} className="hover:bg-gray-50">
                            <td className="border px-3 py-2">{idx + 1}</td>
                            <td className="border px-3 py-2">{emp.employeeCode || 'N/A'}</td>
                            <td className="border px-3 py-2">{emp.employeeName || 'N/A'}</td>
                            <td className="border px-3 py-2">{emp.position || 'N/A'}</td>
                            <td className="border px-3 py-2">{emp.phone || 'N/A'}</td>
                            <td className="border px-3 py-2">{emp.email || 'N/A'}</td>
                            <td className="border px-3 py-2">
                                {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="border px-3 py-2">
                                <button
                                    onClick={() => openEditModal(emp)}
                                    className="bg-green-500 text-white px-2 py-1 rounded mr-2 hover:bg-green-600"
                                >
                                    Sửa
                                </button>
                                <button
                                    onClick={() => openDeleteModal(emp)}
                                    className="bg-red-500 text-white px-2 py-1 rounded mr-2 hover:bg-red-600"
                                >
                                    Xóa
                                </button>
                                <button
                                    onClick={() => handleGenerateAccount(emp.employeeId)}
                                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                    title="Tạo tài khoản đăng nhập"
                                >
                                    Tạo tài khoản
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

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
