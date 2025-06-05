import React, { useState, useEffect } from 'react';
import CustomerService from '../../../Services/CustomerService';

const Customer = () => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20); 
    const [currentCustomer, setCurrentCustomer] = useState({
        customerId: null,
        customerCode: '',
        customerName: '',
        address: '',
        phone: '',
        email: '',
        registrationDate: ''
    });

    const emptyCustomer = {
        customerId: null,
        customerCode: '',
        customerName: '',
        address: '',
        phone: '',
        email: '',
        registrationDate: ''
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await CustomerService.getAllCustomers();
            setCustomers(response.data || []);
            setFilteredCustomers(response.data || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    useEffect(() => {
        const filtered = customers.filter(customer =>
            (customer.customerCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (customer.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
        setFilteredCustomers(filtered);
        setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm thay đổi
    }, [searchTerm, customers]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentCustomer(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const resetForm = () => {
        setCurrentCustomer({ ...emptyCustomer });
    };

    const handleAddCustomer = async () => {
        try {
            const customerData = {
                customerName: currentCustomer.customerName,
                address: currentCustomer.address,
                phone: currentCustomer.phone,
                email: currentCustomer.email
            };

            await CustomerService.createCustomer(customerData);
            setShowAddModal(false);
            resetForm();
            fetchCustomers();
        } catch (error) {
            console.error('Error adding customer:', error);
        }
    };

    const handleEditCustomer = async () => {
        try {
            const customerData = {
                customerId: currentCustomer.customerId,
                customerName: currentCustomer.customerName,
                address: currentCustomer.address,
                phone: currentCustomer.phone,
                email: currentCustomer.email
            };

            await CustomerService.updateCustomer(currentCustomer.customerId, customerData);
            setShowEditModal(false);
            resetForm();
            fetchCustomers();
        } catch (error) {
            console.error('Error updating customer:', error);
        }
    };

    const handleDeleteCustomer = async () => {
        try {
            await CustomerService.deleteCustomer(currentCustomer.customerId);
            setShowDeleteModal(false);
            fetchCustomers();
        } catch (error) {
            console.error('Error deleting customer:', error);
        }
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (customer) => {
        setCurrentCustomer({
            ...customer,
            registrationDate: customer.registrationDate ? customer.registrationDate.split('T')[0] : ''
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (customer) => {
        setCurrentCustomer(customer);
        setShowDeleteModal(true);
    };

    // Pagination logic
    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCustomers.length / pageSize);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Danh sách khách hàng</h1>
                <button
                    onClick={openAddModal}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Thêm khách hàng
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo mã khách hàng hoặc số điện thoại..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="py-2 px-4 border">#</th>
                        <th className="py-2 px-4 border">Mã khách hàng</th>
                        <th className="py-2 px-4 border">Tên khách hàng</th>
                        <th className="py-2 px-4 border">Địa chỉ</th>
                        <th className="py-2 px-4 border">Số điện thoại</th>
                        <th className="py-2 px-4 border">Email</th>
                        <th className="py-2 px-4 border">Ngày đăng ký</th>
                        <th className="py-2 px-4 border">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((item, index) => (
                        <tr key={item.customerId || index} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border">{indexOfFirstItem + index + 1}</td>
                            <td className="py-2 px-4 border">{item.customerCode || 'N/A'}</td>
                            <td className="py-2 px-4 border">{item.customerName || 'N/A'}</td>
                            <td className="py-2 px-4 border">{item.address || 'N/A'}</td>
                            <td className="py-2 px-4 border">{item.phone || 'N/A'}</td>
                            <td className="py-2 px-4 border">{item.email || 'N/A'}</td>
                            <td className="py-2 px-4 border">
                                {item.registrationDate ? new Date(item.registrationDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-2 px-4 border">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => openEditModal(item)}
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(item)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                            currentPage === 1
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
                                        className={`px-3 py-2 rounded-lg transition-colors ${
                                            isCurrentPage
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
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                            currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Sau
                    </button>
                </div>
            )}

            {/* Modal Thêm Khách Hàng */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Thêm khách hàng mới</h2>
                        <div>
                            <div className="mb-4">
                                <label htmlFor="add-customer-name" className="block mb-1 font-medium">Tên khách hàng</label>
                                <input
                                    id="add-customer-name"
                                    type="text"
                                    name="customerName"
                                    value={currentCustomer.customerName}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-customer-address" className="block mb-1 font-medium">Địa chỉ</label>
                                <input
                                    id="add-customer-address"
                                    type="text"
                                    name="address"
                                    value={currentCustomer.address}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-customer-phone" className="block mb-1 font-medium">Số điện thoại</label>
                                <input
                                    id="add-customer-phone"
                                    type="text"
                                    name="phone"
                                    value={currentCustomer.phone}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-customer-email" className="block mb-1 font-medium">Email</label>
                                <input
                                    id="add-customer-email"
                                    type="email"
                                    name="email"
                                    value={currentCustomer.email}
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
                                    onClick={handleAddCustomer}
                                >
                                    Thêm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Sửa Khách Hàng */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Sửa khách hàng</h2>
                        <div>
                            <div className="mb-4">
                                <label htmlFor="edit-customer-name" className="block mb-1 font-medium">Tên khách hàng</label>
                                <input
                                    id="edit-customer-name"
                                    type="text"
                                    name="customerName"
                                    value={currentCustomer.customerName}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-customer-address" className="block mb-1 font-medium">Địa chỉ</label>
                                <input
                                    id="edit-customer-address"
                                    type="text"
                                    name="address"
                                    value={currentCustomer.address}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-customer-phone" className="block mb-1 font-medium">Số điện thoại</label>
                                <input
                                    id="edit-customer-phone"
                                    type="text"
                                    name="phone"
                                    value={currentCustomer.phone}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-customer-email" className="block mb-1 font-medium">Email</label>
                                <input
                                    id="edit-customer-email"
                                    type="email"
                                    name="email"
                                    value={currentCustomer.email}
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
                                    onClick={handleEditCustomer}
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Xóa Khách Hàng */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
                        <p className="mb-6">
                            Bạn có chắc chắn muốn xóa khách hàng "{currentCustomer.customerName}"?
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
                                onClick={handleDeleteCustomer}
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

export default Customer;