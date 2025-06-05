import React, { useState } from 'react';
import InventoryService from '../../../Services/InventoryService';
import { Url } from '../../../constants/config';

const Inventory = () => {
    const [warehouseId, setWarehouseId] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // State cho modal nhập kho
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [purchaseOrderId, setPurchaseOrderId] = useState('');

    const handleViewInventory = async () => {
        setLoading(true);
        try {
            const data = await InventoryService.getInventoriesByWarehouseCode(warehouseId);
            setProducts(data);
            console.log('Dữ liệu tồn kho:', data);
        } catch (error) {
            setProducts([]);
            alert('Không thể lấy dữ liệu tồn kho.');
        }
        setLoading(false);
    };

    // Hàm nhập kho từ đơn hàng
    const handleReceiveFromPO = async () => {
        if (!warehouseId || !purchaseOrderId) {
            alert('Vui lòng nhập đủ mã kho và ID đơn hàng.');
            return;
        }
        setLoading(true);
        try {
            await InventoryService.receiveFromPurchaseOrder(warehouseId, Number(purchaseOrderId));
            setShowReceiveModal(false);
            setPurchaseOrderId('');
            await handleViewInventory();
            alert('Nhập kho thành công!');
        } catch {
            alert('Nhập kho thất bại!');
        }
        setLoading(false);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Tồn kho theo kho</h1>
            <div className="flex items-center gap-2 mb-6">
                <input
                    type="text"
                    placeholder="Nhập ID kho..."
                    value={warehouseId}
                    onChange={e => setWarehouseId(e.target.value)}
                    className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleViewInventory}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={!warehouseId || loading}
                >
                    {loading ? 'Đang tải...' : 'Xem tồn kho'}
                </button>
                <button
                    onClick={() => setShowReceiveModal(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    disabled={!warehouseId}
                >
                    Nhập kho từ đơn hàng
                </button>
            </div>

            {/* Modal nhập kho */}
            {showReceiveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow w-96">
                        <h2 className="font-bold mb-2">Nhập kho từ đơn hàng</h2>
                        <div className="mb-4">
                            <label className="block mb-1">Mã kho:</label>
                            <input
                                type="text"
                                value={warehouseId}
                                disabled
                                className="border w-full mb-2 px-2 py-1 bg-gray-100"
                            />
                            <label className="block mb-1">ID đơn hàng:</label>
                            <input
                                type="number"
                                value={purchaseOrderId}
                                onChange={e => setPurchaseOrderId(e.target.value)}
                                className="border w-full mb-2 px-2 py-1"
                                placeholder="Nhập ID đơn hàng"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowReceiveModal(false)} className="px-3 py-1">Hủy</button>
                            <button onClick={handleReceiveFromPO} className="bg-green-500 text-white px-3 py-1 rounded">Nhập kho</button>
                        </div>
                    </div>
                </div>
            )}

            {products.length > 0 && (
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 border">Mã sản phẩm</th>
                            <th className="py-2 px-4 border">Tên sản phẩm</th>
                            <th className="py-2 px-4 border">Giá bán</th>
                            <th className="py-2 px-4 border">Số lượng</th>
                            <th className="py-2 px-4 border">Đơn vị</th>
                            <th className="py-2 px-4 border">Mô tả</th>
                            <th className="py-2 px-4 border">Ảnh</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((item, idx) => (
                            <tr key={item.product?.productId || idx} className="hover:bg-gray-50">
                                <td className="py-2 px-4 border">{item.product?.productCode}</td>
                                <td className="py-2 px-4 border">{item.product?.productName}</td>
                                <td className="py-2 px-4 border">{item.product?.sellingPrice?.toLocaleString() || ''}</td>
                                <td className="py-2 px-4 border">{item.quantity?.toLocaleString() || ''}</td>
                                <td className="py-2 px-4 border">{item.product?.unit || ''}</td>
                                <td className="py-2 px-4 border">{item.product?.description}</td>
                                <td className="py-2 px-4 border">
                                    <img src={Url + item.product?.imageUrl} alt={item.product?.productName} className="w-16 h-16 object-cover" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {products.length === 0 && !loading && (
                <div className="text-gray-500 mt-4">Chưa có dữ liệu tồn kho.</div>
            )}
        </div>
    );
};

export default Inventory;