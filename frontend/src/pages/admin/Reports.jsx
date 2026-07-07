import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import analyticsApi from '../../api/analyticsApi';
import orderApi from '../../api/orderApi';
import { useCurrency } from '../../hooks/useCurrency';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// ── Stat Card ──────────────────────────────────────────
const StatCard = ({ label, value, icon, color, subLabel }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <div className={`p-2 rounded-lg ${color.bg}`}>
        <svg className={`w-5 h-5 ${color.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
        </svg>
      </div>
    </div>
    <p className="text-3xl font-extrabold text-gray-900">{value}</p>
    {subLabel && <p className="text-xs text-gray-400 mt-1">{subLabel}</p>}
  </div>
);

// ── Export helpers ──────────────────────────────────────
const exportToCSV = (orders) => {
  if (!orders || orders.length === 0) return;
  const headers = ['Order ID', 'Type', 'Table', 'Customer', 'Total Amount', 'Payment Method', 'Payment Status', 'Status', 'Created At'];
  const rows = orders.map(o => [
    o.id,
    o.orderType,
    o.tableName || 'N/A',
    o.customerName || 'Guest',
    o.totalAmount?.toFixed(2),
    o.paymentMethod || 'N/A',
    o.paymentStatus || 'N/A',
    o.status,
    o.createdAt ? new Date(o.createdAt).toLocaleString() : 'N/A',
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `savory_orders_report_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const exportToJSON = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `savory_analytics_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ── Main Component ──────────────────────────────────────
const Reports = () => {
  const { formatCurrency } = useCurrency();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('COMPLETED');
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsData, ordersData] = await Promise.all([
        analyticsApi.getDashboardStats(),
        orderApi.getAllOrders(),
      ]);
      setStats(analyticsData);
      setOrders(ordersData.sort((a, b) => b.id - a.id));
    } catch (err) {
      console.error('Failed to load reports data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Derived filtered orders ──
  const filteredOrders = React.useMemo(() => {
    return orders.filter(o => {
      if (statusFilter !== 'ALL' && o.status?.toUpperCase() !== statusFilter) return false;
      if (dateFrom) {
        const from = new Date(dateFrom).getTime();
        const d = new Date(o.createdAt).getTime();
        if (d < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(o.createdAt).getTime() > to.getTime()) return false;
      }
      return true;
    });
  }, [orders, statusFilter, dateFrom, dateTo]);

  // ── Revenue by day (last 7 days from real orders) ──
  const revenueByDay = React.useMemo(() => {
    const days = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days[key] = 0;
    }
    orders
      .filter(o => o.status === 'COMPLETED' && o.createdAt)
      .forEach(o => {
        const d = new Date(o.createdAt);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (key in days) days[key] += o.totalAmount || 0;
      });
    return { labels: Object.keys(days), data: Object.values(days) };
  }, [orders]);

  // ── Orders by status ──
  const ordersByStatus = React.useMemo(() => {
    const counts = { PENDING: 0, PREPARING: 0, READY: 0, COMPLETED: 0, CANCELLED: 0 };
    orders.forEach(o => {
      const s = o.status?.toUpperCase();
      if (s in counts) counts[s]++;
    });
    return counts;
  }, [orders]);

  // ── Popular Items (All-time from orders) ──
  const popularItemsFromOrders = React.useMemo(() => {
    const itemCounts = {};
    orders.filter(o => o.status === 'COMPLETED').forEach(order => {
      (order.items || []).forEach(item => {
        const name = item.menuItemName || 'Unknown';
        itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 1);
      });
    });
    
    return Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl h-28 border border-gray-100" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl h-72 border border-gray-100" />
          <div className="bg-white rounded-xl h-72 border border-gray-100" />
        </div>
      </div>
    );
  }

  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const totalRevenue = completedOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  const revenueChartData = {
    labels: revenueByDay.labels,
    datasets: [{
      label: 'Revenue',
      data: revenueByDay.data,
      borderColor: '#e63946',
      backgroundColor: 'rgba(230,57,70,0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#e63946',
      pointRadius: 4,
    }],
  };

  const statusChartData = {
    labels: ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
    datasets: [{
      data: [
        ordersByStatus.PENDING,
        ordersByStatus.PREPARING,
        ordersByStatus.READY,
        ordersByStatus.COMPLETED,
        ordersByStatus.CANCELLED,
      ],
      backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'],
      borderWidth: 0,
    }],
  };

  const popularItemsData = popularItemsFromOrders.length > 0 ? {
    labels: popularItemsFromOrders.map(i => i.name),
    datasets: [{
      label: 'Times Ordered',
      data: popularItemsFromOrders.map(i => i.count),
      backgroundColor: ['#e63946', '#457b9d', '#a8dadc', '#1d3557', '#f1faee'],
      borderRadius: 6,
    }],
  } : null;

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      exportToCSV(filteredOrders);
    } finally {
      setExporting(false);
    }
  };

  const handleExportJSON = async () => {
    setExporting(true);
    try {
      exportToJSON({ stats, generatedAt: new Date().toISOString() });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Historical data, order breakdowns, and downloadable reports</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            disabled={exporting || filteredOrders.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={handleExportJSON}
            disabled={exporting || !stats}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Analytics JSON
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Orders" value={orders.length} icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" color={{ bg: 'bg-blue-100', text: 'text-blue-600' }} subLabel="All time" />
        <StatCard label="Completed Revenue" value={formatCurrency(totalRevenue)} icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" color={{ bg: 'bg-green-100', text: 'text-green-600' }} subLabel="From completed orders" />
        <StatCard label="Avg Order Value" value={formatCurrency(avgOrderValue)} icon="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M9 15h.01M12 15h.01M3 5h18M3 19h18M3 9h18" color={{ bg: 'bg-purple-100', text: 'text-purple-600' }} subLabel="Per completed order" />
        <StatCard label="Customers" value={stats?.customers ?? '—'} icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" color={{ bg: 'bg-indigo-100', text: 'text-indigo-600' }} subLabel="Registered customers" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue last 7 days */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">Revenue — Last 7 Days</h2>
          <p className="text-xs text-gray-400 mb-6">Completed orders only</p>
          <div className="h-64">
            <Line data={revenueChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => '$' + v } } } }} />
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">Order Status</h2>
          <p className="text-xs text-gray-400 mb-4">All orders breakdown</p>
          <div className="h-52 flex justify-center">
            {orders.length > 0 ? (
              <Doughnut data={statusChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } } } }} />
            ) : (
              <div className="flex items-center justify-center text-gray-400 text-sm">No orders yet</div>
            )}
          </div>
        </div>

      </div>

      {/* Popular Items Chart */}
      {popularItemsData && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">Most Popular Items</h2>
          <p className="text-xs text-gray-400 mb-6">Ranked by total quantity ordered (completed orders)</p>
          <div className="h-64">
            <Bar data={popularItemsData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, indexAxis: 'y' }} />
          </div>
        </div>
      )}

      {/* Filtered Order Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table Filter Controls */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">Order Ledger</h2>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium text-gray-700">
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PREPARING">Preparing</option>
                <option value="READY">Ready</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">From Date</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-gray-700" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">To Date</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-gray-700" />
            </div>
            <button onClick={() => { setStatusFilter('COMPLETED'); setDateFrom(''); setDateTo(''); }} className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 font-medium transition-colors">
              Reset
            </button>
            <span className="ml-auto text-sm text-gray-500 font-medium">{filteredOrders.length} orders · {formatCurrency(filteredOrders.reduce((s, o) => s + (o.totalAmount || 0), 0))} total</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Order ID', 'Date', 'Type', 'Customer', 'Items', 'Total', 'Payment', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.slice(0, 50).map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">#{order.id}</td>
                  <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">{order.orderType}</td>
                  <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">{order.customerName || 'Guest'}</td>
                  <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{order.items?.length ?? 0} items</td>
                  <td className="px-5 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{order.paymentMethod || '—'}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                      order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      order.status === 'PREPARING' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'READY' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-medium">No orders match your filters.</p>
            </div>
          )}
          {filteredOrders.length > 50 && (
            <div className="text-center py-4 text-xs text-gray-400">
              Showing first 50 of {filteredOrders.length} orders. Export CSV to see all.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
