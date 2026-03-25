import http from '../common/http-common';

const ReportService = {
  // 1. Revenue & Profit Report
  getRevenueProfit: (fromDate, toDate, periodType = 'Daily') =>
    http.post('Reports/revenue-profit', {
      fromDate,
      toDate,
      periodType,
    }),

  getRevenueTrend: (fromDate, toDate, periodType = 'Daily') =>
    http.post('Reports/revenue-trend', {
      fromDate,
      toDate,
      periodType,
    }),

  // 2. Sales Report
  getTopSellers: (fromDate, toDate, top = 10, periodType = 'Daily') =>
    http.post('Reports/top-sellers', {
      fromDate,
      toDate,
      top,
      periodType,
    }),

  // 3. Inventory Report
  getInventoryStatus: () =>
    http.get('Reports/inventory-status'),

  // 4. Customer Report
  getCustomerAnalysis: (fromDate, toDate, periodType = 'Daily') =>
    http.post('Reports/customer-analysis', {
      fromDate,
      toDate,
      periodType,
    }),

  // 5. Purchase & Supplier Report
  getSupplierAnalysis: (fromDate, toDate, periodType = 'Daily') =>
    http.post('Reports/supplier-analysis', {
      fromDate,
      toDate,
      periodType,
    }),

  // 7. Cost & Profit Margin Report
  getProfitMarginAnalysis: (fromDate, toDate, periodType = 'Daily') =>
    http.post('Reports/profit-margin-analysis', {
      fromDate,
      toDate,
      periodType,
    }),

  getCategoryProfitAnalysis: (fromDate, toDate, periodType = 'Daily') =>
    http.post('Reports/category-profit-analysis', {
      fromDate,
      toDate,
      periodType,
    }),
};

export default ReportService;
