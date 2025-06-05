import React, { useState, useEffect } from 'react';
import SalesOrderService from '../../../Services/SalesOrderService';

const SalesOrder = () => {
    const [salesOrders, setSalesOrders] = useState([]);
    const [filteredSalesOrders, setFilteredSalesOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20); // Number of sales orders per page
    const [currentSalesOrder, setCurrentSalesOrder] = useState({
        orderId: null,
        orderCode: '',
        customerId: '',
        employeeId: '',
        orderDate: '',
        totalAmount: '',
        discountAmount: '',
        taxAmount: '',
        status: '',
        paymentMethod: ''
    });

    const emptySalesOrder = {
        orderId: null,
        orderCode: '',
        customerId: '',
        employeeId: '',
        orderDate: '',
        totalAmount: '',
        discountAmount: '',
        taxAmount: '',
        status: '',
        paymentMethod: ''
    };

    useEffect(() => {
        fetchSalesOrders();
    }, []);

    const fetchSalesOrders = async () => {
        try {
            const response = await SalesOrderService.getAllSalesOrders();
            setSalesOrders(response || []);
            setFilteredSalesOrders(response || []);
        } catch (error) {
            console.error('Error fetching sales orders:', error);
            alert('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
        }
    };

    useEffect(() => {
        const filtered = salesOrders.filter(order =>
            (order.orderCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (order.status?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
        setFilteredSalesOrders(filtered);
        setCurrentPage(1); // Reset to first page when search term changes
    }, [searchTerm, salesOrders]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentSalesOrder(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const resetForm = () => {
        setCurrentSalesOrder({ ...emptySalesOrder });
    };

    const handleAddSalesOrder = async () => {
        try {
            const orderData = {
                orderCode: currentSalesOrder.orderCode,
                customerId: currentSalesOrder.customerId ? parseInt(currentSalesOrder.customerId) : null,
                employeeId: currentSalesOrder.employeeId ? parseInt(currentSalesOrder.employeeId) : null,
                totalAmount: currentSalesOrder.totalAmount ? parseFloat(currentSalesOrder.totalAmount) : null,
                discountAmount: currentSalesOrder.discountAmount ? parseFloat(currentSalesOrder.discountAmount) : null,
                taxAmount: currentSalesOrder.taxAmount ? parseFloat(currentSalesOrder.taxAmount) : null,
                status: currentSalesOrder.status,
                paymentMethod: currentSalesOrder.paymentMethod
            };

            await SalesOrderService.createSalesOrder(orderData);
            setShowAddModal(false);
            resetForm();
            fetchSalesOrders();
            alert('Thêm đơn hàng thành công!');
        } catch (error) {
            console.error('Error adding sales order:', error);
            alert(`Không thể thêm đơn hàng: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleEditSalesOrder = async () => {
        try {
            const orderData = {
                orderId: currentSalesOrder.orderId,
                orderCode: currentSalesOrder.orderCode,
                customerId: currentSalesOrder.customerId ? parseInt(currentSalesOrder.customerId) : null,
                employeeId: currentSalesOrder.employeeId ? parseInt(currentSalesOrder.employeeId) : null,
                totalAmount: currentSalesOrder.totalAmount ? parseFloat(currentSalesOrder.totalAmount) : null,
                discountAmount: currentSalesOrder.discountAmount ? parseFloat(currentSalesOrder.discountAmount) : null,
                taxAmount: currentSalesOrder.taxAmount ? parseFloat(currentSalesOrder.taxAmount) : null,
                status: currentSalesOrder.status,
                paymentMethod: currentSalesOrder.paymentMethod
            };

            await SalesOrderService.updateSalesOrder(currentSalesOrder.orderId, orderData);
            setShowEditModal(false);
            resetForm();
            fetchSalesOrders();
            alert('Cập nhật đơn hàng thành công!');
        } catch (error) {
            console.error('Error updating sales order:', error);
            alert(`Không thể cập nhật đơn hàng: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteSalesOrder = async () => {
        try {
            await SalesOrderService.deleteSalesOrder(currentSalesOrder.orderId);
            setShowDeleteModal(false);
            fetchSalesOrders();
            alert('Xóa đơn hàng thành công!');
        } catch (error) {
            console.error('Error deleting sales order:', error);
            alert(`Không thể xóa đơn hàng: ${error.response?.data?.message || error.message}`);
        }
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (order) => {
        setCurrentSalesOrder({
            orderId: order.orderId,
            orderCode: order.orderCode || '',
            customerId: order.customerId || '',
            employeeId: order.employeeId || '',
            orderDate: order.orderDate ? order.orderDate.split('T')[0] : '',
            totalAmount: order.totalAmount || '',
            discountAmount: order.discountAmount || '',
            taxAmount: order.taxAmount || '',
            status: order.status || '',
            paymentMethod: order.paymentMethod || ''
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (order) => {
        setCurrentSalesOrder(order);
        setShowDeleteModal(true);
    };

    // Pagination logic
    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    const currentItems = filteredSalesOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSalesOrders.length / pageSize);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Danh sách đơn hàng</h1>
                <button
                    onClick={openAddModal}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Thêm đơn hàng
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo mã đơn hàng hoặc trạng thái..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="py-2 px-4 border">#</th>
                        <th className="py-2 px-4 border">Mã đơn hàng</th>
                        <th className="py-2 px-4 border">Mã khách hàng</th>
                        <th className="py-2 px-4 border">Mã nhân viên</th>
                        <th className="py-2 px-4 border">Ngày đặt hàng</th>
                        <th className="py-2 px-4 border">Tổng tiền</th>
                        <th className="py-2 px-4 border">Trạng thái</th>
                        <th className="py-2 px-4 border">Phương thức thanh toán</th>
                        <th className="py-2 px-4 border">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((item, index) => (
                        <tr key={item.orderId || index} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border">{indexOfFirstItem + index + 1}</td>
                            <td className="py-2 px-4 border">{item.orderCode || 'N/A'}</td>
                            <td className="py-2 px-4 border">{item.customerId || 'N/A'}</td>
                            <td className="py-2 px-4 border">{item.employeeId || 'N/A'}</td>
                            <td className="py-2 px-4 border">{item.orderDate ? new Date(item.orderDate).toLocaleDateString() : 'N/A'}</td>
                            <td className="py-2 px-4 border">{item.totalAmount || 'N/A'}</td>
                            <td className="py-2 px-4 border">{item.status || 'N/A'}</td>
                            <td className="py-2 px-4 border">{item.paymentMethod || 'N/A'}</td>
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

            {/* Add Sales Order Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Thêm đơn hàng mới</h2>
                        <div>
                            <div className="mb-4">
                                <label htmlFor="add-order-code" className="block mb-1 font-medium">Mã đơn hàng</label>
                                <input
                                    id="add-order-code"
                                    type="text"
                                    name="orderCode"
                                    value={currentSalesOrder.orderCode}
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
                                    value={currentSalesOrder.customerId}
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
                                    value={currentSalesOrder.employeeId}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-total-amount" className="block mb-1 font-medium">Tổng tiền</label>
                                <input
                                    id="add-total-amount"
                                    type="number"
                                    name="totalAmount"
                                    value={currentSalesOrder.totalAmount}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-discount-amount" className="block mb-1 font-medium">Số tiền giảm giá</label>
                                <input
                                    id="add-discount-amount"
                                    type="number"
                                    name="discountAmount"
                                    value={currentSalesOrder.discountAmount}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-tax-amount" className="block mb-1 font-medium">Số tiền thuế</label>
                                <input
                                    id="add-tax-amount"
                                    type="number"
                                    name="taxAmount"
                                    value={currentSalesOrder.taxAmount}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-status" className="block mb-1 font-medium">Trạng thái</label>
                                <input
                                    id="add-status"
                                    type="text"
                                    name="status"
                                    value={currentSalesOrder.status}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-payment-method" className="block mb-1 font-medium">Phương thức thanh toán</label>
                                <input
                                    id="add-payment-method"
                                    type="text"
                                    name="paymentMethod"
                                    value={currentSalesOrder.paymentMethod}
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
                                    onClick={handleAddSalesOrder}
                                >
                                    Thêm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Sales Order Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Sửa đơn hàng</h2>
                        <div>
                            <div className="mb-4">
                                <label htmlFor="edit-order-code" className="block mb-1 font-medium">Mã đơn hàng</label>
                                <input
                                    id="edit-order-code"
                                    type="text"
                                    name="orderCode"
                                    value={currentSalesOrder.orderCode}
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
                                    value={currentSalesOrder.customerId}
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
                                    value={currentSalesOrder.employeeId}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-total-amount" className="block mb-1 font-medium">Tổng tiền</label>
                                <input
                                    id="edit-total-amount"
                                    type="number"
                                    name="totalAmount"
                                    value={currentSalesOrder.totalAmount}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-discount-amount" className="block mb-1 font-medium">Số tiền giảm giá</label>
                                <input
                                    id="edit-discount-amount"
                                    type="number"
                                    name="discountAmount"
                                    value={currentSalesOrder.discountAmount}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-tax-amount" className="block mb-1 font-medium">Số tiền thuế</label>
                                <input
                                    id="edit-tax-amount"
                                    type="number"
                                    name="taxAmount"
                                    value={currentSalesOrder.taxAmount}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-status" className="block mb-1 font-medium">Trạng thái</label>
                                <input
                                    id="edit-status"
                                    type="text"
                                    name="status"
                                    value={currentSalesOrder.status}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-payment-method" className="block mb-1 font-medium">Phương thức thanh toán</label>
                                <input
                                    id="edit-payment-method"
                                    type="text"
                                    name="paymentMethod"
                                    value={currentSalesOrder.paymentMethod}
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
                                    onClick={handleEditSalesOrder}
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Sales Order Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
                        <p className="mb-6">
                            Bạn có chắc chắn muốn xóa đơn hàng "{currentSalesOrder.orderCode}"?
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
                                onClick={handleDeleteSalesOrder}
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

export default SalesOrder;