import React, { useState, useEffect } from 'react';
import ReportService from '../../../Services/ReportService';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const Reports = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [fromDate, setFromDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [periodType, setPeriodType] = useState('Daily');
  const [loading, setLoading] = useState(false);

  // Revenue Report
  const [revenueData, setRevenueData] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);

  // Sales Report
  const [salesData, setSalesData] = useState([]);

  // Inventory Report
  const [inventoryData, setInventoryData] = useState([]);

  // Customer Report
  const [customerData, setCustomerData] = useState([]);

  // Supplier Report
  const [supplierData, setSupplierData] = useState([]);

  // Profit Margin Report
  const [profitMarginData, setProfitMarginData] = useState([]);
  const [categoryProfitData, setCategoryProfitData] = useState([]);

  // Load data based on active tab
  useEffect(() => {
    loadReportData();
  }, [activeTab, fromDate, toDate, periodType]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'revenue':
          await loadRevenueReport();
          break;
        case 'sales':
          await loadSalesReport();
          break;
        case 'inventory':
          await loadInventoryReport();
          break;
        case 'customer':
          await loadCustomerReport();
          break;
        case 'supplier':
          await loadSupplierReport();
          break;
        case 'profitmargin':
          await loadProfitMarginReport();
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error loading report:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRevenueReport = async () => {
    try {
      const profitRes = await ReportService.getRevenueProfit(fromDate, toDate);
      setRevenueData(profitRes.data?.data);

      const trendRes = await ReportService.getRevenueTrend(fromDate, toDate, periodType);
      setRevenueTrend(trendRes.data?.data || []);
    } catch (err) {
      console.error('Error loading revenue report:', err);
    }
  };

  const loadSalesReport = async () => {
    try {
      const res = await ReportService.getTopSellers(fromDate, toDate, 20);
      setSalesData(res.data?.data || []);
    } catch (err) {
      console.error('Error loading sales report:', err);
    }
  };

  const loadInventoryReport = async () => {
    try {
      const res = await ReportService.getInventoryStatus();
      setInventoryData(res.data?.data || []);
    } catch (err) {
      console.error('Error loading inventory report:', err);
    }
  };

  const loadCustomerReport = async () => {
    try {
      const res = await ReportService.getCustomerAnalysis(fromDate, toDate);
      setCustomerData(res.data?.data || []);
    } catch (err) {
      console.error('Error loading customer report:', err);
    }
  };

  const loadSupplierReport = async () => {
    try {
      const res = await ReportService.getSupplierAnalysis(fromDate, toDate);
      setSupplierData(res.data?.data || []);
    } catch (err) {
      console.error('Error loading supplier report:', err);
    }
  };

  const loadProfitMarginReport = async () => {
    try {
      const marginRes = await ReportService.getProfitMarginAnalysis(fromDate, toDate);
      setProfitMarginData(marginRes.data?.data || []);

      const categoryRes = await ReportService.getCategoryProfitAnalysis(fromDate, toDate);
      setCategoryProfitData(categoryRes.data?.data || []);
    } catch (err) {
      console.error('Error loading profit margin report:', err);
    }
  };

  // ========== REVENUE REPORT COMPONENT ==========
  const RevenueReportTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm">Total Doanh Thu</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(revenueData?.Revenue)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
          <p className="text-gray-600 text-sm">Total Chi Phí</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(revenueData?.Cost)}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
          <p className="text-gray-600 text-sm">Lợi Nhuận Gộp</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(revenueData?.GrossProfit)}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm">Lợi Nhuận Ròng</p>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(revenueData?.NetProfit)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-4">Xu Hướng Doanh Thu</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Ngày</th>
                <th className="px-4 py-2 text-right">Doanh Thu</th>
                <th className="px-4 py-2 text-right">Chi Phí</th>
                <th className="px-4 py-2 text-right">Lợi Nhuận</th>
              </tr>
            </thead>
            <tbody>
              {revenueTrend.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{item.period}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(item.revenue)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(item.cost)}</td>
                  <td className="px-4 py-2 text-right font-semibold text-green-600">
                    {formatCurrency(item.grossProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ========== SALES REPORT COMPONENT ==========
  const SalesReportTab = () => (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold mb-4">Top Sản Phẩm Bán Chạy</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Xếp Hạng</th>
              <th className="px-4 py-2 text-left">Sản Phẩm</th>
              <th className="px-4 py-2 text-left">Danh Mục</th>
              <th className="px-4 py-2 text-right">Số Lượng Bán</th>
              <th className="px-4 py-2 text-right">Doanh Thu</th>
              <th className="px-4 py-2 text-right">Giá Bán TB</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((item) => (
              <tr key={item.productId} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                    #{item.rank}
                  </span>
                </td>
                <td className="px-4 py-2 font-medium">{item.productName}</td>
                <td className="px-4 py-2">{item.categoryName}</td>
                <td className="px-4 py-2 text-right">{item.totalQuantitySold?.toLocaleString()}</td>
                <td className="px-4 py-2 text-right font-semibold">{formatCurrency(item.totalRevenue)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(item.averageUnitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ========== INVENTORY REPORT COMPONENT ==========
  const InventoryReportTab = () => (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold mb-4">Trạng Thái Tồn Kho</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Sản Phẩm</th>
              <th className="px-4 py-2 text-left">Danh Mục</th>
              <th className="px-4 py-2 text-center">Tồn Kho</th>
              <th className="px-4 py-2 text-center">Trạng Thái</th>
              <th className="px-4 py-2 text-right">Giá Trị Tồn Kho</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.map((item) => (
              <tr key={item.productId} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{item.productName}</td>
                <td className="px-4 py-2">{item.categoryName}</td>
                <td className="px-4 py-2 text-center font-semibold">{item.totalQuantity?.toLocaleString()}</td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      item.status === 'LowStock'
                        ? 'bg-red-100 text-red-800'
                        : item.status === 'OverStock'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {item.status === 'LowStock' ? '⚠️ Sắp Hết' : item.status === 'OverStock' ? '📦 Tồn Thừa' : '✓ Bình Thường'}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">{formatCurrency(item.totalValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ========== CUSTOMER REPORT COMPONENT ==========
  const CustomerReportTab = () => (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold mb-4">Phân Tích Khách Hàng</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Khách Hàng</th>
              <th className="px-4 py-2 text-center">Tổng Đơn</th>
              <th className="px-4 py-2 text-right">Tổng Mua</th>
              <th className="px-4 py-2 text-right">TB/Đơn</th>
              <th className="px-4 py-2 text-center">Phân Khúc</th>
              <th className="px-4 py-2 text-center">Lần Mua Cuối</th>
            </tr>
          </thead>
          <tbody>
            {customerData.map((item) => (
              <tr key={item.customerId} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{item.customerName}</td>
                <td className="px-4 py-2 text-center">{item.totalOrders}</td>
                <td className="px-4 py-2 text-right font-semibold">{formatCurrency(item.totalPurchaseAmount)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(item.averageOrderValue)}</td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      item.customerSegment === 'VIP'
                        ? 'bg-yellow-100 text-yellow-800'
                        : item.customerSegment === 'Regular'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.customerSegment === 'VIP' ? '👑 VIP' : item.customerSegment === 'Regular' ? 'Thường xuyên' : 'Rủi ro'}
                  </span>
                </td>
                <td className="px-4 py-2 text-center text-gray-600">{new Date(item.lastOrderDate).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ========== SUPPLIER REPORT COMPONENT ==========
  const SupplierReportTab = () => (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold mb-4">Phân Tích Nhà Cung Cấp</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Nhà Cung Cấp</th>
              <th className="px-4 py-2 text-center">Tổng PO</th>
              <th className="px-4 py-2 text-right">Tổng Nhập</th>
              <th className="px-4 py-2 text-right">TB/PO</th>
              <th className="px-4 py-2 text-center">Số Loại SP</th>
              <th className="px-4 py-2 text-center">Tỷ Lệ Đúng Hạn</th>
            </tr>
          </thead>
          <tbody>
            {supplierData.map((item) => (
              <tr key={item.supplierId} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{item.supplierName}</td>
                <td className="px-4 py-2 text-center">{item.totalPurchaseOrders}</td>
                <td className="px-4 py-2 text-right font-semibold">{formatCurrency(item.totalPurchaseAmount)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(item.averageOrderValue)}</td>
                <td className="px-4 py-2 text-center">{item.totalProductCount}</td>
                <td className="px-4 py-2 text-center">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                    {item.onTimeRate.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ========== PROFIT MARGIN REPORT COMPONENT ==========
  const ProfitMarginReportTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-4">Phân Tích Biên Lợi Nhuận - Sản Phẩm</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Sản Phẩm</th>
                <th className="px-4 py-2 text-right">Giá Vốn</th>
                <th className="px-4 py-2 text-right">Giá Bán TB</th>
                <th className="px-4 py-2 text-right">Lợi Nhuận/Đơn</th>
                <th className="px-4 py-2 text-center">Tỷ Suất %</th>
                <th className="px-4 py-2 text-right">Tổng LN</th>
              </tr>
            </thead>
            <tbody>
              {profitMarginData.map((item) => (
                <tr key={item.productId} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{item.productName}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(item.unitCost)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(item.averageSalePrice)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(item.grossProfitPerUnit)}</td>
                  <td className="px-4 py-2 text-center font-bold text-green-600">{item.profitMarginPercent.toFixed(1)}%</td>
                  <td className="px-4 py-2 text-right font-semibold text-green-600">{formatCurrency(item.totalGrossProfit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-4">Phân Tích Biên Lợi Nhuận - Danh Mục</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryProfitData.map((item) => (
            <div key={item.categoryId} className="border rounded-lg p-4 hover:shadow-md transition">
              <h4 className="font-semibold text-lg mb-3">{item.categoryName}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Doanh Thu:</span>
                  <span className="font-semibold">{formatCurrency(item.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chi Phí:</span>
                  <span className="font-semibold">{formatCurrency(item.totalCost)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Lợi Nhuận:</span>
                  <span className="font-bold text-green-600">{formatCurrency(item.totalGrossProfit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tỷ Suất:</span>
                  <span className="font-bold text-blue-600">{item.profitMarginPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ========== MAIN RENDER ==========
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">📊 Báo Cáo & Phân Tích</h1>

      {/* Filter Section */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Ngày Bắt Đầu</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Ngày Kết Thúc</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Kiểu Kỳ Khoá</label>
            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="Daily">Hằng ngày</option>
              <option value="Monthly">Hàng tháng</option>
              <option value="Yearly">Hàng năm</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadReportData}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              🔄 Làm Mới
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[
          { id: 'revenue', label: '📈 Doanh Thu & Lợi Nhuận' },
          { id: 'sales', label: '🛍️ Bán Hàng' },
          { id: 'inventory', label: '📦 Tồn Kho' },
          { id: 'customer', label: '👥 Khách Hàng' },
          { id: 'supplier', label: '🏭 Nhà Cung Cấp' },
          { id: 'profitmargin', label: '💰 Biên Lợi Nhuận' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium transition ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin">⏳</div>
          <span className="ml-2">Đang tải báo cáo...</span>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <>
          {activeTab === 'revenue' && <RevenueReportTab />}
          {activeTab === 'sales' && <SalesReportTab />}
          {activeTab === 'inventory' && <InventoryReportTab />}
          {activeTab === 'customer' && <CustomerReportTab />}
          {activeTab === 'supplier' && <SupplierReportTab />}
          {activeTab === 'profitmargin' && <ProfitMarginReportTab />}
        </>
      )}
    </div>
  );
};

export default Reports;
