import React, { useState, useEffect } from 'react';
import SalesOrderService from '../../../Services/SalesOrderService';
import http from '../../../common/http-common';

const getDefaultStatusLabel = (value) => {
    switch (Number(value)) {
        case 0: return 'Chờ xử lý';
        case 1: return 'Đang xử lý';
        case 2: return 'Đang giao';
        case 3: return 'Hoàn thành';
        case 4: return 'Đã hủy';
        case 5: return 'Hoàn trả';
        default: return String(value ?? 'N/A');
    }
};

const getDefaultPaymentLabel = (value) => {
    if (value === 1) return 'Tiền mặt';
    if (value === 2) return 'Chuyển khoản';
    if (value === 3) return 'Thẻ tín dụng';
    return String(value ?? 'N/A');
};

// Hardcoded fallback options (temporary)
const SALES_ORDER_STATUS_OPTIONS = [
    { value: 0, label: 'Chờ xử lý' },
    { value: 1, label: 'Đang xử lý' },
    { value: 2, label: 'Đang giao' },
    { value: 3, label: 'Hoàn thành' },
    { value: 4, label: 'Đã hủy' },
    { value: 5, label: 'Hoàn trả' },
];

const PAYMENT_METHOD_OPTIONS = [
    { value: 1, label: 'Tiền mặt' },
    { value: 2, label: 'Chuyển khoản' },
    { value: 3, label: 'Thẻ tín dụng' },
];

const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === '') return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const SalesOrder = () => {
    const [salesOrders, setSalesOrders] = useState([]);
    const [filteredSalesOrders, setFilteredSalesOrders] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);
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
        status: 0,
        paymentMethodId: 1,
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
        status: 0,
        paymentMethodId: 1,
        paymentMethod: ''
    };

    useEffect(() => {
        fetchSalesOrders();
        fetchLookups();
    }, []);

    const fetchLookups = async () => {
        try {
            const [statusRes, pmRes] = await Promise.all([
                http.get('Lookups/SaleStatuses'),
                http.get('PaymentMethods/GetList')
            ]);

            const statuses = statusRes?.data || [];
            if (statuses && statuses.length > 0) setStatusOptions(statuses.map(s => ({ value: s.value, label: s.label })));

            const pms = pmRes?.data || [];
            // map possible property names from backend
            if (pms && pms.length > 0) setPaymentMethodOptions(pms.map(pm => ({ value: pm.paymentMethodId ?? pm.PaymentMethodId ?? pm.payment_method_id ?? pm.paymentMethodId, label: pm.methodName ?? pm.MethodName ?? pm.method_name ?? pm.method_name })));
        } catch (err) {
            // API may not exist in this environment; keep hardcoded options
            console.error('Failed to load lookups, using hardcoded defaults', err);
        }
    };

    const getStatusLabel = (value) => {
        const source = (statusOptions && statusOptions.length > 0) ? statusOptions : SALES_ORDER_STATUS_OPTIONS;
        const found = source.find(s => Number(s.value) === Number(value));
        return found ? found.label : getDefaultStatusLabel(value);
    };

    const getPaymentMethodLabel = (value) => {
        if (value === null || value === undefined || value === '') return 'N/A';
        if (typeof value === 'string' && value.trim() !== '') return value;
        const source = (paymentMethodOptions && paymentMethodOptions.length > 0) ? paymentMethodOptions : PAYMENT_METHOD_OPTIONS;
        const found = source.find(p => Number(p.value) === Number(value));
        return found ? found.label : getDefaultPaymentLabel(value);
    };

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
        const filtered = salesOrders.filter(order => {
            const statusLabel = getStatusLabel(order.status);
            const paymentLabel = getPaymentMethodLabel(order.paymentMethodId ?? order.paymentMethod);
            return (
                (order.orderCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                statusLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                paymentLabel.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
        setFilteredSalesOrders(filtered);
        setCurrentPage(1); // Reset to first page when search term changes
    }, [searchTerm, salesOrders]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const normalizedValue = (name === 'status' || name === 'paymentMethodId') ? Number(value) : value;
        setCurrentSalesOrder(prevState => ({
            ...prevState,
            [name]: normalizedValue
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
                status: currentSalesOrder.status != null ? Number(currentSalesOrder.status) : null,
                paymentMethodId: currentSalesOrder.paymentMethodId != null ? Number(currentSalesOrder.paymentMethodId) : null
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
                status: currentSalesOrder.status != null ? Number(currentSalesOrder.status) : null,
                paymentMethodId: currentSalesOrder.paymentMethodId != null ? Number(currentSalesOrder.paymentMethodId) : null
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
            status: order.status != null ? order.status : 0,
            paymentMethodId: order.paymentMethodId != null ? order.paymentMethodId : 1,
            paymentMethod: order.paymentMethod || getPaymentMethodLabel(order.paymentMethodId)
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
        <div className="p-4" style={{ fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
                .admin-table tr:hover td { background: #f0f9ff !important; }
                .action-btn { background: none; border: none; cursor: pointer; font-size: 13px; font-weight: 600; padding: 5px 10px; border-radius: 6px; transition: background 0.15s; }
                .action-btn.edit { color: #3b82f6; } .action-btn.edit:hover { background: #eff6ff; }
                .action-btn.delete { color: #ef4444; } .action-btn.delete:hover { background: #fef2f2; }
            `}</style>
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

            <div style={{ background: '#fff', borderRadius: '14px', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            {['#', 'Mã đơn hàng', 'Mã khách hàng', 'Mã nhân viên', 'Ngày đặt hàng', 'Tổng tiền', 'Trạng thái', 'Phương thức thanh toán', 'Thao tác'].map(h => (
                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item, index) => (
                            <tr key={item.orderId || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>{indexOfFirstItem + index + 1}</td>
                                <td style={{ padding: '13px 16px' }}>
                                    <span style={{ fontWeight: '600', color: '#1e293b', fontFamily: 'monospace', fontSize: '13px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                                        {item.orderCode || 'N/A'}
                                    </span>
                                </td>
                                <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>{item.customerId || 'N/A'}</td>
                                <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>{item.employeeId || 'N/A'}</td>
                                <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>{item.orderDate ? new Date(item.orderDate).toLocaleDateString() : 'N/A'}</td>
                                <td style={{ padding: '13px 16px', color: '#0f172a', fontWeight: '600', fontSize: '14px' }}>{formatCurrency(item.totalAmount)}</td>
                                <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>
                                    <span style={{ fontWeight: '600', color: item.status === 3 ? '#10b981' : '#f59e0b' }}>
                                        {getStatusLabel(item.status)}
                                    </span>
                                </td>
                                <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>{getPaymentMethodLabel(item.paymentMethodId ?? item.paymentMethod)}</td>
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
                                <select
                                    id="add-status"
                                    name="status"
                                    value={currentSalesOrder.status}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {SALES_ORDER_STATUS_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-payment-method" className="block mb-1 font-medium">Phương thức thanh toán</label>
                                <select
                                    id="add-payment-method"
                                    name="paymentMethodId"
                                    value={currentSalesOrder.paymentMethodId}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {PAYMENT_METHOD_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
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
                                <select
                                    id="edit-status"
                                    name="status"
                                    value={currentSalesOrder.status}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {SALES_ORDER_STATUS_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-payment-method" className="block mb-1 font-medium">Phương thức thanh toán</label>
                                <select
                                    id="edit-payment-method"
                                    name="paymentMethodId"
                                    value={currentSalesOrder.paymentMethodId}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {PAYMENT_METHOD_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
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