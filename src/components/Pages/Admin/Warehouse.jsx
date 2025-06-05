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
        <div className="p-4">
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

            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="py-2 px-4 border">#</th>
                        <th className="py-2 px-4 border">Mã kho</th>
                        <th className="py-2 px-4 border">Tên kho</th>
                        <th className="py-2 px-4 border">Địa chỉ</th>
                        <th className="py-2 px-4 border">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredWarehouses.slice(0, 20).map((item, index) => (
                        <tr key={item.warehouseId || index} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border">{index + 1}</td>
                            <td className="py-2 px-4 border">{item.warehouseCode || 'N/A'}</td>
                            <td className="py-2 px-4 border">{item.warehouseName || 'N/A'}</td>
                            <td className="py-2 px-4 border">{item.address || 'N/A'}</td>
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