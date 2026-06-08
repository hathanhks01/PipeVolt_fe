import React, { useState, useEffect, useCallback } from 'react';
import http from '../../../common/http-common';

// ─────────────────────────────────────────────────────────
// WEIGHTED AVERAGE COST ENGINE
// Mỗi lần nhập hàng → cập nhật giá vốn bình quân di động
// WAC mới = (Tồn cũ × Cost cũ + Nhập × Cost mới) / (Tồn cũ + Nhập)
// ─────────────────────────────────────────────────────────
function computeWeightedAvgCost(purchaseOrderDetails, purchaseOrders, inventories) {
  // Map productId → { totalQty, totalValue } để tính WAC
  const costMap = {};

  // Sắp xếp PO theo ngày nhập để tính rolling WAC
  const sortedPOs = [...purchaseOrders].sort(
    (a, b) => new Date(a.orderDate || 0) - new Date(b.orderDate || 0)
  );

  for (const po of sortedPOs) {
    const details = purchaseOrderDetails.filter(
      d => d.purchaseOrderId === po.purchaseOrderId
    );
    for (const d of details) {
      const pid = d.productId;
      const qty = d.quantity || 0;
      const cost = d.unitCost || 0;

      if (!costMap[pid]) {
        // Khởi tạo: tồn kho ban đầu = 0
        costMap[pid] = { totalQty: 0, totalValue: 0 };
      }

      // WAC mới sau lần nhập này
      const prev = costMap[pid];
      const newQty = prev.totalQty + qty;
      const newValue = prev.totalValue + qty * cost;
      costMap[pid] = {
        totalQty: newQty,
        totalValue: newValue,
        wac: newQty > 0 ? newValue / newQty : cost,
        lastCost: cost,
      };
    }
  }

  // Nếu sản phẩm có tồn kho trong Inventory nhưng chưa có PO → giá 0
  for (const inv of inventories) {
    const pid = inv.productId;
    if (!costMap[pid]) {
      costMap[pid] = { totalQty: inv.quantity, totalValue: 0, wac: 0, lastCost: 0 };
    }
  }

  return costMap; // { productId: { wac, lastCost, totalQty, totalValue } }
}

// ─────────────────────────────────────────────────────────
// REPORT SERVICE - tất cả API calls
// ─────────────────────────────────────────────────────────
const ReportAPI = {
  revenueProfit: (from, to) =>
    http.post('Reports/revenue-profit', { fromDate: from, toDate: to }),
  revenueTrend: (from, to, period) =>
    http.post('Reports/revenue-trend', { fromDate: from, toDate: to, periodType: period }),
  topSellers: (from, to, top) =>
    http.post('Reports/top-sellers', { fromDate: from, toDate: to, top }),
  inventoryStatus: () => http.get('Reports/inventory-status'),
  customerAnalysis: (from, to) =>
    http.post('Reports/customer-analysis', { fromDate: from, toDate: to }),
  supplierAnalysis: (from, to) =>
    http.post('Reports/supplier-analysis', { fromDate: from, toDate: to }),
  profitMargin: (from, to) =>
    http.post('Reports/profit-margin-analysis', { fromDate: from, toDate: to }),
  categoryProfit: (from, to) =>
    http.post('Reports/category-profit-analysis', { fromDate: from, toDate: to }),
  // Raw data để tính WAC client-side
  purchaseOrders: () => http.get('PurchaseOrders/GetList'),
  purchaseOrderDetails: () => http.get('PurchaseOrderDetails/GetList'),
  inventories: () => http.get('Inventories/GetList'),
  products: () => http.get('Products/GetList'),
};

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
const fmt = (v) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(v || 0);

const fmtNum = (v) => (v == null ? '—' : Number(v).toLocaleString('vi-VN'));
const fmtPct = (v) => `${(v || 0).toFixed(1)}%`;

const today = () => new Date().toISOString().split('T')[0];
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

// ─────────────────────────────────────────────────────────
// MINI COMPONENTS
// ─────────────────────────────────────────────────────────
const KPICard = ({ label, value, sub, color, icon, trend }) => (
  <div
    style={{
      background: '#fff',
      border: `1.5px solid ${color}22`,
      borderLeft: `4px solid ${color}`,
      borderRadius: '12px',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      transition: 'transform .15s, box-shadow .15s',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.09)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        {label}
      </span>
      <span style={{ fontSize: '20px' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{value}</div>
    {sub && <div style={{ fontSize: '12px', color: '#64748b' }}>{sub}</div>}
    {trend != null && (
      <div style={{ fontSize: '12px', color: trend >= 0 ? '#10b981' : '#ef4444', fontWeight: '600' }}>
        {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}% so với kỳ trước
      </div>
    )}
  </div>
);

const SectionTitle = ({ children, badge }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', marginTop: '4px' }}>
    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{children}</h3>
    {badge && (
      <span style={{ background: '#eff6ff', color: '#3b82f6', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px' }}>
        {badge}
      </span>
    )}
  </div>
);

const Badge = ({ children, type = 'neutral' }) => {
  const colors = {
    success: { bg: '#ecfdf5', color: '#059669' },
    warning: { bg: '#fffbeb', color: '#d97706' },
    danger:  { bg: '#fef2f2', color: '#dc2626' },
    info:    { bg: '#eff6ff', color: '#2563eb' },
    neutral: { bg: '#f1f5f9', color: '#475569' },
    purple:  { bg: '#f5f3ff', color: '#7c3aed' },
  };
  const c = colors[type] || colors.neutral;
  return (
    <span style={{
      background: c.bg, color: c.color,
      fontSize: '11px', fontWeight: '700',
      padding: '3px 10px', borderRadius: '20px',
      display: 'inline-block',
    }}>
      {children}
    </span>
  );
};

const DataTable = ({ headers, rows, emptyMsg = 'Không có dữ liệu' }) => (
  <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1.5px solid #e2e8f0' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
      <thead>
        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
          {headers.map((h, i) => (
            <th key={i} style={{
              padding: '11px 14px', textAlign: h.right ? 'right' : 'left',
              fontSize: '11px', fontWeight: '700', color: '#64748b',
              textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap',
            }}>
              {h.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={headers.length} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              {emptyMsg}
            </td>
          </tr>
        ) : rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}
          >
            {row.map((cell, j) => (
              <td key={j} style={{
                padding: '11px 14px',
                textAlign: headers[j]?.right ? 'right' : 'left',
                color: '#334155', whiteSpace: 'nowrap',
              }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Loader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: '#94a3b8', gap: '10px' }}>
    <div style={{
      width: '20px', height: '20px', border: '3px solid #e2e8f0',
      borderTopColor: '#3b82f6', borderRadius: '50%',
      animation: 'spin .7s linear infinite',
    }} />
    <span style={{ fontSize: '14px' }}>Đang tải dữ liệu...</span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Mini bar chart (pure CSS)
const MiniBar = ({ value, max, color = '#3b82f6' }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width .4s ease' }} />
      </div>
      <span style={{ fontSize: '11px', color: '#64748b', minWidth: '36px', textAlign: 'right' }}>
        {pct.toFixed(0)}%
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// TAB PANELS
// ─────────────────────────────────────────────────────────

// 1. DOANH THU & LỢI NHUẬN
const RevenueTab = ({ from, to, period }) => {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [wacData, setWacData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      ReportAPI.revenueProfit(from, to),
      ReportAPI.revenueTrend(from, to, period),
      ReportAPI.purchaseOrders(),
      ReportAPI.purchaseOrderDetails(),
      ReportAPI.inventories(),
    ]).then(([sumRes, trendRes, poRes, podRes, invRes]) => {
      setSummary(sumRes.data?.data);
      setTrend(trendRes.data?.data || []);

      const wac = computeWeightedAvgCost(
        podRes.data || [],
        poRes.data || [],
        invRes.data || []
      );
      setWacData(wac);
    }).catch(console.error).finally(() => setLoading(false));
  }, [from, to, period]);

  if (loading) return <Loader />;

  // Tính lại cost dùng WAC
  const totalWACCost = Object.values(wacData).reduce((s, v) => s + (v.totalValue || 0), 0);
  const revenue = summary?.revenue || 0;
  const grossProfit = revenue - (summary?.cost || 0);
  const profitPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  const maxRevenue = Math.max(...trend.map(t => t.revenue || 0), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* WAC INFO BOX */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
        border: '1.5px solid #bfdbfe',
        borderRadius: '12px', padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: '10px',
        fontSize: '13px', color: '#1e40af',
      }}>
        <span style={{ fontSize: '18px' }}>💡</span>
        <span>
          <strong>Phương pháp giá vốn:</strong> Giá vốn bình quân di động (WAC).
          Mỗi lần nhập hàng sẽ cập nhật giá vốn mới theo công thức:
          <code style={{ background: '#dbeafe', padding: '1px 6px', borderRadius: '4px', marginLeft: '4px' }}>
            WAC = (Tồn cũ × Cost cũ + Nhập × Cost mới) / (Tồn cũ + Nhập)
          </code>
        </span>
      </div>

      {/* KPI GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <KPICard label="Doanh thu" value={fmt(revenue)} icon="💰" color="#3b82f6" />
        <KPICard label="Giá vốn (WAC)" value={fmt(summary?.cost)} sub="Bình quân di động" icon="🏭" color="#f59e0b" />
        <KPICard label="Lợi nhuận gộp" value={fmt(grossProfit)} sub={`Biên LN: ${fmtPct(profitPct)}`} icon="📈" color="#10b981" />
        <KPICard label="Lợi nhuận ròng" value={fmt(summary?.netProfit)} icon="✅" color="#8b5cf6" />
      </div>

      {/* TREND TABLE */}
      <div>
        <SectionTitle badge={`${trend.length} kỳ`}>📊 Xu hướng doanh thu theo kỳ</SectionTitle>
        <DataTable
          headers={[
            { label: 'Kỳ' },
            { label: 'Doanh thu', right: true },
            { label: 'Giá vốn WAC', right: true },
            { label: 'Lợi nhuận gộp', right: true },
            { label: 'Tỷ suất', right: true },
            { label: 'Phân bổ doanh thu' },
          ]}
          rows={trend.map(t => {
            const gp = (t.revenue || 0) - (t.cost || 0);
            const pct = t.revenue > 0 ? (gp / t.revenue) * 100 : 0;
            return [
              <span style={{ fontWeight: '600', color: '#1e293b' }}>{t.period}</span>,
              <span style={{ fontWeight: '700', color: '#3b82f6' }}>{fmt(t.revenue)}</span>,
              fmt(t.cost),
              <span style={{ color: gp >= 0 ? '#10b981' : '#ef4444', fontWeight: '700' }}>{fmt(gp)}</span>,
              <Badge type={pct >= 20 ? 'success' : pct >= 10 ? 'warning' : 'danger'}>{fmtPct(pct)}</Badge>,
              <MiniBar value={t.revenue} max={maxRevenue} />,
            ];
          })}
        />
      </div>
    </div>
  );
};

// 2. TOP SẢN PHẨM BÁN CHẠY (có WAC)
const SalesTab = ({ from, to }) => {
  const [data, setData] = useState([]);
  const [wacData, setWacData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      ReportAPI.topSellers(from, to, 20),
      ReportAPI.purchaseOrders(),
      ReportAPI.purchaseOrderDetails(),
      ReportAPI.inventories(),
    ]).then(([salesRes, poRes, podRes, invRes]) => {
      setData(salesRes.data?.data || []);
      const wac = computeWeightedAvgCost(
        podRes.data || [],
        poRes.data || [],
        invRes.data || []
      );
      setWacData(wac);
    }).catch(console.error).finally(() => setLoading(false));
  }, [from, to]);

  if (loading) return <Loader />;

  const maxRev = Math.max(...data.map(d => d.totalRevenue || 0), 1);

  const enriched = data.map(item => {
    const wac = wacData[item.productId]?.wac || 0;
    const totalCost = wac * (item.totalQuantitySold || 0);
    const gp = (item.totalRevenue || 0) - totalCost;
    const margin = item.totalRevenue > 0 ? (gp / item.totalRevenue) * 100 : 0;
    return { ...item, wac, totalCost, grossProfit: gp, margin };
  }).sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <KPICard label="Tổng doanh thu" value={fmt(enriched.reduce((s, d) => s + d.totalRevenue, 0))} icon="💰" color="#3b82f6" />
        <KPICard label="Tổng giá vốn (WAC)" value={fmt(enriched.reduce((s, d) => s + d.totalCost, 0))} icon="🏭" color="#f59e0b" />
        <KPICard label="Lợi nhuận gộp" value={fmt(enriched.reduce((s, d) => s + d.grossProfit, 0))} icon="📈" color="#10b981" />
      </div>

      <SectionTitle badge={`Top ${enriched.length}`}>🏆 Sản phẩm bán chạy — Phân tích lợi nhuận (WAC)</SectionTitle>
      <DataTable
        headers={[
          { label: '#' },
          { label: 'Sản phẩm' },
          { label: 'Danh mục' },
          { label: 'SL bán', right: true },
          { label: 'Doanh thu', right: true },
          { label: 'Giá vốn WAC/đv', right: true },
          { label: 'Tổng giá vốn', right: true },
          { label: 'Lợi nhuận gộp', right: true },
          { label: 'Biên LN', right: true },
          { label: 'Phân bổ' },
        ]}
        rows={enriched.map((item, i) => [
          <span style={{
            background: i < 3 ? ['#fbbf24','#d1d5db','#cd7c2f'][i] : '#f1f5f9',
            color: i < 3 ? '#fff' : '#64748b',
            width: '24px', height: '24px', borderRadius: '50%',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '800',
          }}>
            {i + 1}
          </span>,
          <div>
            <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '13px' }}>{item.productName}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>{item.productCode}</div>
          </div>,
          item.categoryName,
          fmtNum(item.totalQuantitySold),
          <span style={{ fontWeight: '700', color: '#3b82f6' }}>{fmt(item.totalRevenue)}</span>,
          <span style={{ color: '#f59e0b', fontWeight: '600' }}>{fmt(item.wac)}</span>,
          fmt(item.totalCost),
          <span style={{ color: item.grossProfit >= 0 ? '#10b981' : '#ef4444', fontWeight: '700' }}>
            {fmt(item.grossProfit)}
          </span>,
          <Badge type={item.margin >= 25 ? 'success' : item.margin >= 10 ? 'warning' : 'danger'}>
            {fmtPct(item.margin)}
          </Badge>,
          <MiniBar value={item.totalRevenue} max={maxRev} color={item.margin >= 25 ? '#10b981' : item.margin >= 10 ? '#f59e0b' : '#ef4444'} />,
        ])}
      />

      {/* Ghi chú phương pháp */}
      <div style={{
        background: '#fffbeb', border: '1px solid #fde68a',
        borderRadius: '10px', padding: '14px 18px',
        fontSize: '12px', color: '#92400e', lineHeight: '1.7',
      }}>
        <strong>📌 Lưu ý phương pháp tính:</strong><br />
        Giá vốn WAC (Weighted Average Cost) được tính dựa trên toàn bộ lịch sử nhập kho.
        Mỗi lần nhập hàng từ đơn mua, hệ thống cập nhật giá vốn bình quân mới.
        <br />
        Công thức: <code>WAC_mới = (SL_tồn × WAC_cũ + SL_nhập × Giá_nhập) ÷ (SL_tồn + SL_nhập)</code>
      </div>
    </div>
  );
};

// 3. TỒN KHO
const InventoryTab = () => {
  const [data, setData] = useState([]);
  const [wacData, setWacData] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      ReportAPI.inventoryStatus(),
      ReportAPI.purchaseOrders(),
      ReportAPI.purchaseOrderDetails(),
      ReportAPI.inventories(),
    ]).then(([invRes, poRes, podRes, rawInvRes]) => {
      setData(invRes.data?.data || []);
      const wac = computeWeightedAvgCost(
        podRes.data || [],
        poRes.data || [],
        rawInvRes.data || []
      );
      setWacData(wac);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const enriched = data.map(item => {
    const wac = wacData[item.productId]?.wac || 0;
    const lastCost = wacData[item.productId]?.lastCost || 0;
    const inventoryValue = wac * (item.totalQuantity || 0);
    return { ...item, wac, lastCost, inventoryValue };
  });

  const filtered = filter === 'all' ? enriched
    : enriched.filter(d => d.status?.toLowerCase() === filter);

  const totalValue = enriched.reduce((s, d) => s + d.inventoryValue, 0);
  const lowStock = enriched.filter(d => d.status === 'LowStock').length;
  const overStock = enriched.filter(d => d.status === 'OverStock').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <KPICard label="Tổng giá trị tồn kho (WAC)" value={fmt(totalValue)} icon="🏪" color="#8b5cf6" />
        <KPICard label="Số mã sản phẩm" value={fmtNum(enriched.length)} icon="📦" color="#3b82f6" />
        <KPICard label="Sắp hết hàng" value={lowStock} sub="Cần nhập thêm" icon="⚠️" color="#f59e0b" />
        <KPICard label="Tồn thừa" value={overStock} sub="Cân nhắc giảm giá" icon="📊" color="#ef4444" />
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'Tất cả', count: enriched.length },
          { key: 'normal', label: '✓ Bình thường', count: enriched.filter(d => d.status === 'Normal').length },
          { key: 'lowstock', label: '⚠️ Sắp hết', count: lowStock },
          { key: 'overstock', label: '📦 Tồn thừa', count: overStock },
        ].map(f => (
          <button key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '7px 16px', borderRadius: '20px', border: '1.5px solid',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all .15s',
              borderColor: filter === f.key ? '#3b82f6' : '#e2e8f0',
              background: filter === f.key ? '#3b82f6' : '#fff',
              color: filter === f.key ? '#fff' : '#64748b',
            }}>
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      <DataTable
        headers={[
          { label: 'Sản phẩm' },
          { label: 'Danh mục' },
          { label: 'Tồn kho', right: true },
          { label: 'Giá vốn WAC', right: true },
          { label: 'Giá nhập gần nhất', right: true },
          { label: 'Giá trị tồn kho', right: true },
          { label: 'Trạng thái' },
        ]}
        rows={filtered.map(item => [
          <div>
            <div style={{ fontWeight: '700', color: '#1e293b' }}>{item.productName}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>{item.productCode}</div>
          </div>,
          item.categoryName,
          <span style={{ fontWeight: '700', color: '#1e293b' }}>{fmtNum(item.totalQuantity)}</span>,
          <span style={{ color: '#8b5cf6', fontWeight: '600' }}>{fmt(item.wac)}</span>,
          <span style={{
            color: item.lastCost > item.wac ? '#ef4444' : item.lastCost < item.wac ? '#10b981' : '#64748b',
            fontWeight: '600',
          }}>
            {fmt(item.lastCost)}
            {item.lastCost !== item.wac && item.lastCost > 0 && (
              <span style={{ fontSize: '10px', marginLeft: '4px' }}>
                {item.lastCost > item.wac ? '↑' : '↓'}
              </span>
            )}
          </span>,
          <span style={{ fontWeight: '700', color: '#0f172a' }}>{fmt(item.inventoryValue)}</span>,
          item.status === 'LowStock' ? <Badge type="danger">⚠️ Sắp hết</Badge>
            : item.status === 'OverStock' ? <Badge type="warning">📦 Tồn thừa</Badge>
            : <Badge type="success">✓ Bình thường</Badge>,
        ])}
      />
    </div>
  );
};

// 4. PHÂN TÍCH KHÁCH HÀNG
const CustomerTab = ({ from, to }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ReportAPI.customerAnalysis(from, to)
      .then(res => setData(res.data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [from, to]);

  if (loading) return <Loader />;

  const vip = data.filter(d => d.customerSegment === 'VIP');
  const regular = data.filter(d => d.customerSegment === 'Regular');
  const atRisk = data.filter(d => d.customerSegment === 'AtRisk');
  const totalRevenue = data.reduce((s, d) => s + (d.totalPurchaseAmount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Segment summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <KPICard label="Tổng khách hàng" value={data.length} icon="👥" color="#3b82f6" />
        <KPICard label="VIP" value={vip.length} sub={fmt(vip.reduce((s, d) => s + (d.totalPurchaseAmount || 0), 0))} icon="👑" color="#f59e0b" />
        <KPICard label="Thường xuyên" value={regular.length} icon="🔄" color="#10b981" />
        <KPICard label="Có thể mất" value={atRisk.length} sub="Cần chăm sóc" icon="⚠️" color="#ef4444" />
      </div>

      {/* Segment bars */}
      <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '20px 24px' }}>
        <SectionTitle>🎯 Phân bổ phân khúc khách hàng</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: '👑 VIP', count: vip.length, revenue: vip.reduce((s, d) => s + (d.totalPurchaseAmount || 0), 0), color: '#f59e0b' },
            { label: '🔄 Thường xuyên', count: regular.length, revenue: regular.reduce((s, d) => s + (d.totalPurchaseAmount || 0), 0), color: '#10b981' },
            { label: '⚠️ Có thể mất', count: atRisk.length, revenue: atRisk.reduce((s, d) => s + (d.totalPurchaseAmount || 0), 0), color: '#ef4444' },
          ].map(seg => (
            <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '140px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>{seg.label}</div>
              <div style={{ flex: 1 }}>
                <MiniBar value={seg.count} max={data.length || 1} color={seg.color} />
              </div>
              <div style={{ width: '60px', fontSize: '13px', fontWeight: '700', color: '#1e293b', textAlign: 'right' }}>
                {seg.count} KH
              </div>
              <div style={{ width: '120px', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>
                {fmt(seg.revenue)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SectionTitle badge={`${data.length} khách hàng`}>📋 Chi tiết phân tích khách hàng</SectionTitle>
      <DataTable
        headers={[
          { label: 'Khách hàng' },
          { label: 'Mã KH' },
          { label: 'Số đơn', right: true },
          { label: 'Tổng mua', right: true },
          { label: 'TB/đơn', right: true },
          { label: 'Mua cuối' },
          { label: 'Ngày chưa mua', right: true },
          { label: 'Phân khúc' },
        ]}
        rows={data.map(item => [
          <span style={{ fontWeight: '700', color: '#1e293b' }}>{item.customerName}</span>,
          <span style={{ fontFamily: 'monospace', fontSize: '12px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
            {item.customerCode}
          </span>,
          fmtNum(item.totalOrders),
          <span style={{ fontWeight: '700', color: '#3b82f6' }}>{fmt(item.totalPurchaseAmount)}</span>,
          fmt(item.averageOrderValue),
          item.lastOrderDate ? new Date(item.lastOrderDate).toLocaleDateString('vi-VN') : '—',
          <span style={{ color: item.daysSinceLastPurchase > 60 ? '#ef4444' : '#64748b' }}>
            {item.daysSinceLastPurchase === 999 ? '—' : `${item.daysSinceLastPurchase} ngày`}
          </span>,
          item.customerSegment === 'VIP' ? <Badge type="warning">👑 VIP</Badge>
            : item.customerSegment === 'Regular' ? <Badge type="info">🔄 Thường xuyên</Badge>
            : <Badge type="danger">⚠️ Có thể mất</Badge>,
        ])}
      />
    </div>
  );
};

// 5. BIÊN LỢI NHUẬN (WAC-based)
const ProfitMarginTab = ({ from, to }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wacData, setWacData] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('product');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      ReportAPI.profitMargin(from, to),
      ReportAPI.categoryProfit(from, to),
      ReportAPI.purchaseOrders(),
      ReportAPI.purchaseOrderDetails(),
      ReportAPI.inventories(),
    ]).then(([pmRes, cpRes, poRes, podRes, invRes]) => {
      const wac = computeWeightedAvgCost(
        podRes.data || [],
        poRes.data || [],
        invRes.data || []
      );
      setWacData(wac);

      // Enriched product data with WAC
      const pData = (pmRes.data?.data || []).map(item => {
        const productWAC = wac[item.productId]?.wac || item.unitCost || 0;
        const totalCost = productWAC * (item.quantitySold || 0);
        const gp = (item.totalGrossProfit || 0); // server-calculated but we override with WAC
        const gpWAC = (item.averageSalePrice - productWAC) * (item.quantitySold || 0);
        const marginWAC = item.averageSalePrice > 0
          ? ((item.averageSalePrice - productWAC) / item.averageSalePrice) * 100
          : 0;
        return {
          ...item,
          unitCostWAC: productWAC,
          grossProfitWAC: gpWAC,
          profitMarginWAC: marginWAC,
          totalCostWAC: totalCost,
        };
      }).sort((a, b) => b.grossProfitWAC - a.grossProfitWAC);

      setProducts(pData);
      setCategories(cpRes.data?.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [from, to]);

  if (loading) return <Loader />;

  const totalGP = products.reduce((s, d) => s + d.grossProfitWAC, 0);
  const avgMargin = products.length > 0
    ? products.reduce((s, d) => s + d.profitMarginWAC, 0) / products.length
    : 0;
  const highMargin = products.filter(d => d.profitMarginWAC >= 25).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* WAC Badge */}
      <div style={{
        background: '#f0fdf4', border: '1.5px solid #bbf7d0',
        borderRadius: '10px', padding: '12px 18px',
        fontSize: '13px', color: '#166534', display: 'flex', gap: '8px',
      }}>
        <span>✅</span>
        <span><strong>Giá vốn WAC:</strong> Báo cáo biên lợi nhuận được tính dùng giá vốn bình quân di động,
        phản ánh chính xác hơn so với giá nhập lần cuối đơn thuần.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <KPICard label="Tổng LN gộp (WAC)" value={fmt(totalGP)} icon="💵" color="#10b981" />
        <KPICard label="Biên LN bình quân" value={fmtPct(avgMargin)} icon="📊" color="#3b82f6" />
        <KPICard label="SP biên LN cao (≥25%)" value={highMargin} sub="Cần ưu tiên bán" icon="⭐" color="#f59e0b" />
        <KPICard label="Tổng SP phân tích" value={products.length} icon="📦" color="#8b5cf6" />
      </div>

      {/* View Toggle */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[{ key: 'product', label: '📦 Theo sản phẩm' }, { key: 'category', label: '🗂️ Theo danh mục' }].map(v => (
          <button key={v.key} onClick={() => setView(v.key)}
            style={{
              padding: '8px 18px', borderRadius: '8px', border: '1.5px solid',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all .15s',
              borderColor: view === v.key ? '#3b82f6' : '#e2e8f0',
              background: view === v.key ? '#3b82f6' : '#fff',
              color: view === v.key ? '#fff' : '#64748b',
            }}>
            {v.label}
          </button>
        ))}
      </div>

      {view === 'product' ? (
        <DataTable
          headers={[
            { label: 'Sản phẩm' },
            { label: 'SL bán', right: true },
            { label: 'Giá bán TB', right: true },
            { label: 'Giá vốn WAC', right: true },
            { label: 'LN gộp/đv (WAC)', right: true },
            { label: 'Tổng LN gộp (WAC)', right: true },
            { label: 'Biên LN (WAC)', right: true },
            { label: 'Mức độ' },
          ]}
          rows={products.map(item => [
            <div>
              <div style={{ fontWeight: '700', color: '#1e293b' }}>{item.productName}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>{item.productCode}</div>
            </div>,
            fmtNum(item.quantitySold),
            fmt(item.averageSalePrice),
            <span style={{ color: '#f59e0b', fontWeight: '600' }}>{fmt(item.unitCostWAC)}</span>,
            <span style={{ color: item.averageSalePrice - item.unitCostWAC >= 0 ? '#10b981' : '#ef4444', fontWeight: '600' }}>
              {fmt(item.averageSalePrice - item.unitCostWAC)}
            </span>,
            <span style={{ fontWeight: '700', color: item.grossProfitWAC >= 0 ? '#10b981' : '#ef4444' }}>
              {fmt(item.grossProfitWAC)}
            </span>,
            <div>
              <div style={{ fontWeight: '700', color: item.profitMarginWAC >= 25 ? '#10b981' : item.profitMarginWAC >= 10 ? '#f59e0b' : '#ef4444' }}>
                {fmtPct(item.profitMarginWAC)}
              </div>
              <MiniBar value={Math.max(item.profitMarginWAC, 0)} max={60} color={item.profitMarginWAC >= 25 ? '#10b981' : item.profitMarginWAC >= 10 ? '#f59e0b' : '#ef4444'} />
            </div>,
            item.profitMarginWAC >= 25 ? <Badge type="success">⭐ Cao</Badge>
              : item.profitMarginWAC >= 10 ? <Badge type="warning">Trung bình</Badge>
              : <Badge type="danger">Thấp</Badge>,
          ])}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {categories.map(cat => {
            const margin = cat.profitMarginPercent || 0;
            return (
              <div key={cat.categoryId} style={{
                background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px',
                padding: '20px 24px', transition: 'box-shadow .15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{cat.categoryName}</h4>
                  <Badge type={margin >= 25 ? 'success' : margin >= 10 ? 'warning' : 'danger'}>
                    {fmtPct(margin)}
                  </Badge>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  {[
                    { label: 'Doanh thu', value: fmt(cat.totalRevenue), color: '#3b82f6' },
                    { label: 'Giá vốn', value: fmt(cat.totalCost), color: '#f59e0b' },
                    { label: 'Lợi nhuận gộp', value: fmt(cat.totalGrossProfit), color: cat.totalGrossProfit >= 0 ? '#10b981' : '#ef4444' },
                    { label: 'Số SP trong danh mục', value: fmtNum(cat.productCount), color: '#64748b' },
                    { label: 'Tổng SL bán', value: fmtNum(cat.totalQuantitySold), color: '#64748b' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>{row.label}:</span>
                      <span style={{ fontWeight: '700', color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '12px' }}>
                  <MiniBar value={Math.max(margin, 0)} max={60} color={margin >= 25 ? '#10b981' : margin >= 10 ? '#f59e0b' : '#ef4444'} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 6. NHÀ CUNG CẤP
const SupplierTab = ({ from, to }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ReportAPI.supplierAnalysis(from, to)
      .then(res => setData(res.data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [from, to]);

  if (loading) return <Loader />;

  const maxAmt = Math.max(...data.map(d => d.totalPurchaseAmount || 0), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <KPICard label="Tổng nhà cung cấp" value={data.length} icon="🏭" color="#3b82f6" />
        <KPICard label="Tổng nhập hàng" value={fmt(data.reduce((s, d) => s + (d.totalPurchaseAmount || 0), 0))} icon="📦" color="#f59e0b" />
        <KPICard label="Tổng đơn nhập" value={fmtNum(data.reduce((s, d) => s + (d.totalPurchaseOrders || 0), 0))} icon="📋" color="#10b981" />
      </div>

      <SectionTitle badge={`${data.length} NCC`}>🏭 Phân tích nhà cung cấp</SectionTitle>
      <DataTable
        headers={[
          { label: 'Nhà cung cấp' },
          { label: 'Tổng PO', right: true },
          { label: 'Tổng nhập', right: true },
          { label: 'TB/PO', right: true },
          { label: 'Số loại SP', right: true },
          { label: 'Phân bổ giá trị nhập' },
        ]}
        rows={data.map(item => [
          <div>
            <div style={{ fontWeight: '700', color: '#1e293b' }}>{item.supplierName}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.contact || '—'}</div>
          </div>,
          fmtNum(item.totalPurchaseOrders),
          <span style={{ fontWeight: '700', color: '#f59e0b' }}>{fmt(item.totalPurchaseAmount)}</span>,
          fmt(item.averageOrderValue),
          fmtNum(item.totalProductCount),
          <MiniBar value={item.totalPurchaseAmount} max={maxAmt} color="#f59e0b" />,
        ])}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
const TABS = [
  { id: 'revenue',   label: 'Doanh thu & LN',      icon: '📈' },
  { id: 'sales',     label: 'Bán hàng',              icon: '🛍️' },
  { id: 'inventory', label: 'Tồn kho',               icon: '📦' },
  { id: 'customer',  label: 'Khách hàng',            icon: '👥' },
  { id: 'margin',    label: 'Biên lợi nhuận (WAC)',  icon: '💰' },
  { id: 'supplier',  label: 'Nhà cung cấp',          icon: '🏭' },
];

const Reports = () => {
  const [tab, setTab] = useState('revenue');
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(today());
  const [period, setPeriod] = useState('Daily');
  const [key, setKey] = useState(0); // force re-render on Apply

  const handleApply = () => setKey(k => k + 1);

  return (
    <div style={{
      minHeight: '100vh', background: '#f8fafc',
      fontFamily: "'Segoe UI', 'Be Vietnam Pro', system-ui, sans-serif",
      padding: '28px 28px',
    }}>
      {/* HEADER */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-.02em' }}>
          📊 Báo cáo & Phân tích
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
          Sử dụng phương pháp <strong>giá vốn bình quân di động (WAC)</strong> để tính lợi nhuận chính xác
        </p>
      </div>

      {/* FILTER BAR */}
      <div style={{
        background: '#fff', border: '1.5px solid #e2e8f0',
        borderRadius: '12px', padding: '16px 20px',
        display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap',
        marginBottom: '24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        {[
          { label: 'Từ ngày', value: from, onChange: setFrom, type: 'date' },
          { label: 'Đến ngày', value: to, onChange: setTo, type: 'date' },
        ].map(f => (
          <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {f.label}
            </label>
            <input type={f.type} value={f.value} onChange={e => f.onChange(e.target.value)}
              style={{
                padding: '8px 12px', border: '1.5px solid #e2e8f0',
                borderRadius: '8px', fontSize: '14px', color: '#1e293b',
                outline: 'none', background: '#f8fafc',
              }}
              onFocus={e => (e.target.style.borderColor = '#3b82f6')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>
        ))}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Kiểu kỳ
          </label>
          <select value={period} onChange={e => setPeriod(e.target.value)}
            style={{
              padding: '8px 12px', border: '1.5px solid #e2e8f0',
              borderRadius: '8px', fontSize: '14px', color: '#1e293b',
              outline: 'none', background: '#f8fafc', cursor: 'pointer',
            }}>
            <option value="Daily">Hàng ngày</option>
            <option value="Monthly">Hàng tháng</option>
            <option value="Yearly">Hàng năm</option>
          </select>
        </div>

        {/* Quick range buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Nhanh
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { label: '7 ngày', days: 7 },
              { label: '30 ngày', days: 30 },
              { label: '90 ngày', days: 90 },
            ].map(r => (
              <button key={r.label}
                onClick={() => { setFrom(daysAgo(r.days)); setTo(today()); }}
                style={{
                  padding: '7px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  background: '#f8fafc', color: '#475569', transition: 'all .12s',
                }}
                onMouseEnter={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.color = '#3b82f6'; }}
                onMouseLeave={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.color = '#475569'; }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleApply}
          style={{
            padding: '8px 22px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#fff', border: 'none', borderRadius: '8px',
            fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            transition: 'opacity .15s', boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
          }}
          onMouseEnter={e => (e.target.style.opacity = '.85')}
          onMouseLeave={e => (e.target.style.opacity = '1')}
        >
          🔄 Áp dụng
        </button>
      </div>

      {/* TABS */}
      <div style={{
        display: 'flex', gap: '2px', marginBottom: '24px',
        background: '#f1f5f9', borderRadius: '10px', padding: '4px',
        overflowX: 'auto',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '9px 16px', borderRadius: '7px', border: 'none',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'all .15s',
              background: tab === t.id ? '#fff' : 'transparent',
              color: tab === t.id ? '#1e293b' : '#64748b',
              boxShadow: tab === t.id ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{
        background: '#fff', border: '1.5px solid #e2e8f0',
        borderRadius: '14px', padding: '24px 24px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        minHeight: '400px',
      }}>
        {tab === 'revenue'   && <RevenueTab key={`rev-${key}`} from={from} to={to} period={period} />}
        {tab === 'sales'     && <SalesTab key={`sales-${key}`} from={from} to={to} />}
        {tab === 'inventory' && <InventoryTab key={`inv-${key}`} />}
        {tab === 'customer'  && <CustomerTab key={`cust-${key}`} from={from} to={to} />}
        {tab === 'margin'    && <ProfitMarginTab key={`margin-${key}`} from={from} to={to} />}
        {tab === 'supplier'  && <SupplierTab key={`sup-${key}`} from={from} to={to} />}
      </div>
    </div>
  );
};

export default Reports;