import React, { useState } from 'react';
import InventoryService from '../../../Services/InventoryService';
import { showAlert } from '../../../common/ui';
import { Url } from '../../../constants/config';

const Inventory = () => {
    const [warehouseCode, setWarehouseCode] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // State cho modal nhập kho
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [purchaseOrderCode, setPurchaseOrderCode] = useState('');

    const handleViewInventory = async () => {
        setLoading(true);
        try {
            const data = await InventoryService.getInventoriesByWarehouseCode(warehouseCode);
            setProducts(data);
            console.log('Dữ liệu tồn kho:', data);
        } catch (error) {
            setProducts([]);
            showAlert('Không thể lấy dữ liệu tồn kho.', 'error');
        }
        setLoading(false);
    };

    // Hàm nhập kho từ đơn hàng
    const handleReceiveFromPO = async () => {
        if (!warehouseCode || !purchaseOrderCode) {
            showAlert('Vui lòng nhập đủ mã kho và mã đơn hàng.', 'error');
            return;
        }
        setLoading(true);
        try {
            await InventoryService.receiveFromPurchaseOrder(warehouseCode, purchaseOrderCode);
            setShowReceiveModal(false);
            setPurchaseOrderCode('');
            await handleViewInventory();
            showAlert('Nhập kho thành công!', 'success');
        } catch (error) {
            showAlert('Nhập kho thất bại!', 'error');
            console.error('Error receiving from PO:', error);
        }
        setLoading(false);
    };

    return (
        <div className="p-4" style={{ fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
                .admin-table tr:hover td { background: #f0f9ff !important; }
            `}</style>
            <h1 className="text-2xl font-bold mb-4">Tồn kho theo kho</h1>
            <div className="flex items-center gap-2 mb-6">
                <input
                    type="text"
                    placeholder="Nhập mã kho..."
                    value={warehouseCode}
                    onChange={e => setWarehouseCode(e.target.value)}
                    className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleViewInventory}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={!warehouseCode || loading}
                >
                    {loading ? 'Đang tải...' : 'Xem tồn kho'}
                </button>
                <button
                    onClick={() => setShowReceiveModal(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    disabled={!warehouseCode}
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
                                value={warehouseCode}
                                disabled
                                className="border w-full mb-2 px-2 py-1 bg-gray-100"
                            />
                            <label className="block mb-1">Mã đơn hàng:</label>
                            <input
                                type="string"
                                value={purchaseOrderCode}
                                onChange={e => setPurchaseOrderCode(e.target.value)}
                                className="border w-full mb-2 px-2 py-1"
                                placeholder="Nhập mã đơn hàng"
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
                <div style={{ background: '#fff', borderRadius: '14px', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                    <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                {['Mã sản phẩm', 'Tên sản phẩm', 'Giá bán', 'Số lượng', 'Đơn vị', 'Mô tả', 'Ảnh'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((item, idx) => (
                                <tr key={item.product?.productId || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '13px 16px' }}>
                                        <span style={{ fontWeight: '600', color: '#1e293b', fontFamily: 'monospace', fontSize: '13px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                                            {item.product?.productCode}
                                        </span>
                                    </td>
                                    <td style={{ padding: '13px 16px', color: '#334155', fontSize: '14px', fontWeight: '600' }}>{item.product?.productName}</td>
                                    <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>{item.product?.sellingPrice?.toLocaleString() || ''}</td>
                                    <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px', fontWeight: '600' }}>{item.quantity?.toLocaleString() || ''}</td>
                                    <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>{item.product?.unit || ''}</td>
                                    <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>{item.product?.description}</td>
                                    <td style={{ padding: '13px 16px' }}>
                                        <img src={Url + item.product?.imageUrl} alt={item.product?.productName} className="w-16 h-16 object-cover rounded border" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {products.length === 0 && !loading && (
                <div className="text-gray-500 mt-4">Chưa có dữ liệu tồn kho.</div>
            )}
        </div>
    );
};

export default Inventory;