import React, { useState, useEffect } from 'react';
import WarehouseService from '../../../Services/WarehouseService';

const Warehouse = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [filteredWarehouses, setFilteredWarehouses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentWarehouse, setCurrentWarehouse] = useState({
        warehouseId: null,
        warehouseCode: '',
        warehouseName: '',
        address: ''
    });

    const emptyWarehouse = {
        warehouseId: null,
        warehouseCode: '',
        warehouseName: '',
        address: ''
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            const response = await WarehouseService.getAllWarehouses();
            setWarehouses(response.data || []);
            setFilteredWarehouses(response.data || []);
        } catch (error) {
            console.error('Error fetching warehouses:', error);
            alert('Không thể tải danh sách kho hàng. Vui lòng thử lại.');
        }
    };

    useEffect(() => {
        const filtered = warehouses.filter(warehouse =>
            (warehouse.warehouseName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
        setFilteredWarehouses(filtered);
    }, [searchTerm, warehouses]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentWarehouse(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const resetForm = () => {
        setCurrentWarehouse({ ...emptyWarehouse });
    };

    const handleAddWarehouse = async () => {
        try {
            const warehouseData = {
                warehouseCode: currentWarehouse.warehouseCode,
                warehouseName: currentWarehouse.warehouseName,
                address: currentWarehouse.address
            };

            await WarehouseService.createWarehouse(warehouseData);
            setShowAddModal(false);
            resetForm();
            fetchWarehouses();
            alert('Thêm kho hàng thành công!');
        } catch (error) {
            console.error('Error adding warehouse:', error);
            alert(`Không thể thêm kho hàng: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleEditWarehouse = async () => {
        try {
            const warehouseData = {
                warehouseId: currentWarehouse.warehouseId,
                warehouseCode: currentWarehouse.warehouseCode,
                warehouseName: currentWarehouse.warehouseName,
                address: currentWarehouse.address
            };

            await WarehouseService.updateWarehouse(currentWarehouse.warehouseId, warehouseData);
            setShowEditModal(false);
            resetForm();
            fetchWarehouses();
            alert('Cập nhật kho hàng thành công!');
        } catch (error) {
            console.error('Error updating warehouse:', error);
            alert(`Không thể cập nhật kho hàng: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteWarehouse = async () => {
        try {
            await WarehouseService.deleteWarehouse(currentWarehouse.warehouseId);
            setShowDeleteModal(false);
            fetchWarehouses();
            alert('Xóa kho hàng thành công!');
        } catch (error) {
            console.error('Error deleting warehouse:', error);
            alert(`Không thể xóa kho hàng: ${error.response?.data?.message || error.message}`);
        }
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (warehouse) => {
        setCurrentWarehouse({
            warehouseId: warehouse.warehouseId,
            warehouseCode: warehouse.warehouseCode,
            warehouseName: warehouse.warehouseName,
            address: warehouse.address
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (warehouse) => {
        setCurrentWarehouse(warehouse);
        setShowDeleteModal(true);
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
                <h1 className="text-2xl font-bold">Danh sách kho hàng</h1>
                <button
                    onClick={openAddModal}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Thêm kho hàng
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên kho hàng..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div style={{ background: '#fff', borderRadius: '14px', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            {['#', 'Mã kho', 'Tên kho', 'Địa chỉ', 'Thao tác'].map(h => (
                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredWarehouses.slice(0, 20).map((item, index) => (
                            <tr key={item.warehouseId || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>{index + 1}</td>
                                <td style={{ padding: '13px 16px' }}>
                                    <span style={{ fontWeight: '600', color: '#1e293b', fontFamily: 'monospace', fontSize: '13px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                                        {item.warehouseCode || 'N/A'}
                                    </span>
                                </td>
                                <td style={{ padding: '13px 16px', color: '#334155', fontSize: '14px', fontWeight: '600' }}>{item.warehouseName || 'N/A'}</td>
                                <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>{item.address || 'N/A'}</td>
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

            {/* Modal Thêm Kho Hàng */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Thêm kho hàng mới</h2>
                        <div>
                            <div className="mb-4">
                                <label htmlFor="add-warehouse-code" className="block mb-1 font-medium">Mã kho</label>
                                <input
                                    id="add-warehouse-code"
                                    type="text"
                                    name="warehouseCode"
                                    value={currentWarehouse.warehouseCode}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-warehouse-name" className="block mb-1 font-medium">Tên kho</label>
                                <input
                                    id="add-warehouse-name"
                                    type="text"
                                    name="warehouseName"
                                    value={currentWarehouse.warehouseName}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-warehouse-address" className="block mb-1 font-medium">Địa chỉ</label>
                                <input
                                    id="add-warehouse-address"
                                    type="text"
                                    name="address"
                                    value={currentWarehouse.address}
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
                                    onClick={handleAddWarehouse}
                                >
                                    Thêm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Sửa Kho Hàng */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Sửa kho hàng</h2>
                        <div>
                            <div className="mb-4">
                                <label htmlFor="edit-warehouse-code" className="block mb-1 font-medium">Mã kho</label>
                                <input
                                    id="edit-warehouse-code"
                                    type="text"
                                    name="warehouseCode"
                                    value={currentWarehouse.warehouseCode}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-warehouse-name" className="block mb-1 font-medium">Tên kho</label>
                                <input
                                    id="edit-warehouse-name"
                                    type="text"
                                    name="warehouseName"
                                    value={currentWarehouse.warehouseName}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-warehouse-address" className="block mb-1 font-medium">Địa chỉ</label>
                                <input
                                    id="edit-warehouse-address"
                                    type="text"
                                    name="address"
                                    value={currentWarehouse.address}
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
                                    onClick={handleEditWarehouse}
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Xóa Kho Hàng */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
                        <p className="mb-6">
                            Bạn có chắc chắn muốn xóa kho hàng "{currentWarehouse.warehouseName}"?
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
                                onClick={handleDeleteWarehouse}
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

export default Warehouse;