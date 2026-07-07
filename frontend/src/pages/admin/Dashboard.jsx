import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import analyticsApi from '../../api/analyticsApi';
import { useCurrency } from '../../hooks/useCurrency';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await analyticsApi.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="animate-pulse flex space-x-4">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="text-red-500">Failed to load dashboard data. Please make sure the backend is running.</div>;
  }

  // Use partial mock for Revenue Data (historical monthly)
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [{
      label: 'Revenue',
      data: [3200, 3800, 4100, 3900, 4500, 4800, stats.revenue > 0 ? stats.revenue : 4520],
      borderColor: '#e63946',
      backgroundColor: 'rgba(230, 57, 70, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const orderData = {
    labels: ['Dine In', 'Takeaway', 'Delivery'],
    datasets: [{
      data: [
        stats.orderTypes['Dine In'] || 0, 
        stats.orderTypes['Takeaway'] || 0, 
        stats.orderTypes['Delivery'] || 0
      ],
      backgroundColor: ['#e63946', '#1d3557', '#a8dadc'],
      borderWidth: 0,
    }]
  };

  const popularFoodData = {
    labels: stats.popularItems.length > 0 ? stats.popularItems.map(item => item.name) : ['No Data'],
    datasets: [{
      label: 'Orders',
      data: stats.popularItems.length > 0 ? stats.popularItems.map(item => item.count) : [0],
      backgroundColor: '#457b9d',
      borderRadius: 4,
    }]
  };

  const statCards = [
    { name: 'Total Orders', value: stats.totalOrders, icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Revenue', value: formatCurrency(stats.revenue), icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Customers', value: stats.customers, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Available Tables', value: stats.availableTables, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: 'text-teal-600', bg: 'bg-teal-100' },
    { name: 'Active Reservations', value: stats.reservations, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Low Stock Items', value: stats.lowStockItems, icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Today's Metrics</p>
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Live Data Active
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100 hover-lift">
            <div className={`p-4 rounded-lg ${stat.bg} ${stat.color} mr-4`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue Overview</h2>
          <div className="h-72">
            <Line 
              data={revenueData} 
              options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Types</h2>
          <div className="h-72 flex justify-center">
            {stats.totalOrders > 0 ? (
              <Doughnut 
                data={orderData} 
                options={{ maintainAspectRatio: false }} 
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No orders yet</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Popular Food Items</h2>
          <div className="h-72">
            {stats.popularItems.length > 0 ? (
              <Bar 
                data={popularFoodData} 
                options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No popular items data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
