import React, { useState, useEffect } from 'react';
import orderApi from '../../api/orderApi';
import menuApi from '../../api/menuApi';
import tableApi from '../../api/tableApi';
import ConfirmModal from '../../components/ConfirmModal';
import { toast } from 'react-toastify';
import { useCurrency } from '../../hooks/useCurrency';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();

  // Filters State
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredOrders = React.useMemo(() => {
    return orders.filter(order => {
      if (filterStatus !== 'ALL' && order.status?.toUpperCase() !== filterStatus) return false;
      if (filterType !== 'ALL' && order.orderType?.toUpperCase() !== filterType) return false;
      if (dateFrom) {
        if (!order.createdAt) return true; // If no date, include it or exclude it? Let's assume valid date.
        const from = new Date(dateFrom).getTime();
        const orderDate = new Date(order.createdAt).getTime();
        if (orderDate < from) return false;
      }
      if (dateTo) {
        if (!order.createdAt) return true;
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        const orderDate = new Date(order.createdAt).getTime();
        if (orderDate > to.getTime()) return false;
      }
      return true;
    });
  }, [orders, filterStatus, filterType, dateFrom, dateTo]);

  const stats = React.useMemo(() => {
    const totalOrders = filteredOrders.length;
    const completedOrders = filteredOrders.filter(o => o.status === 'COMPLETED');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
    const activeOrders = filteredOrders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING' || o.status === 'READY').length;

    return { totalOrders, totalRevenue, avgOrderValue, activeOrders };
  }, [filteredOrders]);
  
  // View Items Modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);


  
  // Form Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    orderType: 'DINE_IN',
    tableId: '',
    items: [{ menuItemId: '', quantity: 1, specialNote: '' }]
  });

  useEffect(() => {
    fetchData();

    // Set up SSE connection for real-time updates
    const sseBase = import.meta.env.VITE_API_BASE_URL || '';
    const eventSource = new EventSource(`${sseBase}/api/orders/stream`);
    
    eventSource.addEventListener('orderUpdate', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Real-time admin update received:', data);
        
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === data.orderId 
              ? { ...order, status: data.status } 
              : order
          )
        );
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    });

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orderData, menuData, tableData] = await Promise.all([
        orderApi.getAllOrders(),
        menuApi.getAllMenus(),
        tableApi.getAllTables()
      ]);
      setOrders(orderData.sort((a, b) => b.id - a.id));
      setMenuItems(menuData.filter(m => m.availability?.toUpperCase() === 'AVAILABLE'));
      setTables(tableData.filter(t => t.status?.toUpperCase() === 'AVAILABLE'));
    } catch (error) {
      console.error(error);
      toast.error('Failed to load order data');
    } finally {
      setLoading(false);
    }
  };


  const handleStatusChange = async (id, newStatus) => {
    try {
      await orderApi.updateOrderStatus(id, newStatus);
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleOpenForm = () => {
    setFormData({
      orderType: 'DINE_IN',
      tableId: tables.length > 0 ? tables[0].id : '',
      items: [{ menuItemId: menuItems.length > 0 ? menuItems[0].id : '', quantity: 1, specialNote: '' }]
    });
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
  };

  const handleAddItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { menuItemId: menuItems.length > 0 ? menuItems[0].id : '', quantity: 1, specialNote: '' }]
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleRemoveItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast.error("Order must have at least one item");
      return;
    }
    
    setSubmitting(true);
    
    // Clean payload
    const parsedTableId = parseInt(formData.tableId);
    const payload = {
      orderType: formData.orderType,
      tableId: formData.orderType === 'DINE_IN' && !isNaN(parsedTableId) ? parsedTableId : null,
      items: formData.items.map(item => ({
        menuItemId: parseInt(item.menuItemId) || 0,
        quantity: parseInt(item.quantity) || 1,
        specialNote: item.specialNote || ''
      }))
    };
    
    try {
      await orderApi.addOrder(payload);
      toast.success('Order created successfully');
      fetchData(); // Refresh list
      handleCloseForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create order';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const viewOrderItems = (items) => {
    setSelectedOrderItems(items);
    setIsViewModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PREPARING': return 'bg-blue-100 text-blue-800';
      case 'READY': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4">Loading orders...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <button onClick={handleOpenForm} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm">
          + New Order
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center justify-center transition-transform hover:scale-105">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center justify-center transition-transform hover:scale-105">
          <p className="text-sm font-medium text-gray-500 mb-1">Active Orders</p>
          <p className="text-3xl font-bold text-blue-600">{stats.activeOrders}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center justify-center transition-transform hover:scale-105">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center justify-center transition-transform hover:scale-105">
          <p className="text-sm font-medium text-gray-500 mb-1">Avg Order Value</p>
          <p className="text-3xl font-bold text-purple-600">{formatCurrency(stats.avgOrderValue)}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex items-center space-x-2 mb-4 relative z-10">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Filter Orders</h2>
        </div>

        <div className="flex flex-wrap gap-4 items-end relative z-10">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full sm:w-40 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-gray-700 transition-all cursor-pointer">
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Order Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full sm:w-40 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-gray-700 transition-all cursor-pointer">
              <option value="ALL">All Types</option>
              <option value="DINE_IN">Dine In</option>
              <option value="TAKEAWAY">Takeaway</option>
              <option value="DELIVERY">Delivery</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">From Date</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full sm:w-40 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-gray-700 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">To Date</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full sm:w-40 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-gray-700 transition-all" />
          </div>
          <button onClick={() => {setFilterStatus('ALL'); setFilterType('ALL'); setDateFrom(''); setDateTo('');}} className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Reset</span>
          </button>
          
          <button onClick={() => {
            if (filteredOrders.length === 0) {
              toast.error("No orders to export");
              return;
            }
            const headers = ["Order ID", "Type", "Table", "Total Amount", "Status", "Created At"];
            const csvRows = [headers.join(",")];
            
            filteredOrders.forEach(order => {
              const row = [
                order.id,
                order.orderType,
                order.tableName || "N/A",
                order.totalAmount,
                order.status,
                order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"
              ];
              csvRows.push(row.map(cell => `"${cell}"`).join(","));
            });
            
            const csvString = csvRows.join("\n");
            const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Export successful!");
          }} className="px-5 py-2.5 text-sm font-bold text-white bg-green-600 border border-transparent rounded-xl shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all flex items-center space-x-2 ml-auto">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type / Table</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">#{order.id}</div>
                  {order.createdAt && <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.orderType}</div>
                  {order.tableName && <div className="text-xs text-gray-500">Table: {order.tableName}</div>}
                  {order.orderType === 'DELIVERY' && order.deliveryAddress && (
                    <div className="text-xs text-gray-500 truncate max-w-[200px]" title={order.deliveryAddress}>
                      To: {order.deliveryAddress}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary cursor-pointer hover:underline" onClick={() => viewOrderItems(order.items)}>
                  View {order.items.length} items
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                  {formatCurrency(order.totalAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={order.status === 'COMPLETED' || order.status === 'CANCELLED'}
                    className={`px-2 py-1 text-xs font-semibold rounded-full border-none focus:ring-0 cursor-pointer ${getStatusColor(order.status)} disabled:opacity-75 disabled:cursor-not-allowed`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="READY">Ready</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">No orders found.</div>
        )}
      </div>


      {/* View Items Modal */}
      {isViewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsViewModalOpen(false)}></div>
          <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-2xl max-w-lg w-full p-0 overflow-hidden z-10 animate-fade-in-up m-auto">
            <div className="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center bg-white/50">
              <h3 className="text-lg font-bold text-gray-900">Order Items</h3>
              <button onClick={() => setIsViewModalOpen(false)} type="button" className="text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {selectedOrderItems.map(item => (
                  <li key={item.id} className="py-3 flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.quantity}x {item.menuItemName}</p>
                      {item.specialNote && <p className="text-xs text-gray-500 mt-1 italic">Note: {item.specialNote}</p>}
                    </div>
                    <p className="text-sm text-gray-900">{formatCurrency(item.subtotal)}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
              <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Order Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={handleCloseForm}></div>
          <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-xl shadow-2xl max-w-2xl w-full p-0 overflow-hidden z-10 animate-fade-in-up m-auto max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center bg-white/50 shrink-0">
              <h3 className="text-lg font-bold text-gray-900">New Order</h3>
              <button onClick={handleCloseForm} type="button" className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="flex flex-col overflow-hidden h-full">
              <div className="p-6 overflow-y-auto space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Order Type *</label>
                    <select 
                      value={formData.orderType}
                      onChange={(e) => setFormData({...formData, orderType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="DINE_IN">Dine In</option>
                      <option value="TAKEAWAY">Takeaway</option>
                      <option value="DELIVERY">Delivery</option>
                    </select>
                  </div>
                  
                  {formData.orderType === 'DINE_IN' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Table *</label>
                      <select 
                        required
                        value={formData.tableId}
                        onChange={(e) => setFormData({...formData, tableId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="" disabled>Select Table</option>
                        {tables.map(t => (
                          <option key={t.id} value={t.id}>Table {t.tableNumber} (Seats {t.capacity})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-gray-900">Order Items</label>
                    <button type="button" onClick={handleAddItemRow} className="text-xs text-primary font-bold hover:underline">+ Add Item Row</button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex items-start space-x-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <select 
                            required
                            value={item.menuItemId}
                            onChange={(e) => handleItemChange(index, 'menuItemId', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary"
                          >
                            <option value="" disabled>Select Menu Item</option>
                            {menuItems.map(m => (
                              <option key={m.id} value={m.id}>{m.name} ({formatCurrency(m.price)})</option>
                            ))}
                          </select>
                          <input 
                            type="text" 
                            placeholder="Special notes (e.g. no onions)"
                            value={item.specialNote}
                            onChange={(e) => handleItemChange(index, 'specialNote', e.target.value)}
                            className="w-full mt-2 px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-primary"
                          />
                        </div>
                        <div className="w-20">
                          <input 
                            type="number" min="1" required
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary"
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveItemRow(index)}
                          className="mt-1 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
              
              <div className="mt-auto px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 shrink-0">
                <button 
                  type="button" 
                  onClick={handleCloseForm}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
