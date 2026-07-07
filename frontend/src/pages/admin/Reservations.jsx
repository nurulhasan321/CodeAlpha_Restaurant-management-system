import React, { useState, useEffect } from 'react';
import reservationApi from '../../api/reservationApi';
import tableApi from '../../api/tableApi';
import ConfirmModal from '../../components/ConfirmModal';
import { toast } from 'react-toastify';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  
  // Form Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guestCount: 2,
    tableId: ''
  });

  // Filters State
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredReservations = React.useMemo(() => {
    return reservations.filter(res => {
      if (filterStatus !== 'ALL' && res.status?.toUpperCase() !== filterStatus) return false;
      if (dateFrom) {
        if (!res.reservationTime) return true;
        const from = new Date(dateFrom).getTime();
        const resDate = new Date(res.reservationTime).getTime();
        if (resDate < from) return false;
      }
      if (dateTo) {
        if (!res.reservationTime) return true;
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        const resDate = new Date(res.reservationTime).getTime();
        if (resDate > to.getTime()) return false;
      }
      return true;
    });
  }, [reservations, filterStatus, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resData, tableData] = await Promise.all([
        reservationApi.getAllReservations(),
        tableApi.getAllTables()
      ]);
      setReservations(resData.sort((a, b) => b.id - a.id));
      setTables(tableData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load reservation data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (reservation) => {
    setReservationToDelete(reservation);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await reservationApi.deleteReservation(reservationToDelete.id);
      setReservations(reservations.filter(r => r.id !== reservationToDelete.id));
      toast.success(`Reservation #${reservationToDelete.id} deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete reservation');
    } finally {
      setIsDeleteModalOpen(false);
      setReservationToDelete(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await reservationApi.updateReservationStatus(id, newStatus);
      setReservations(reservations.map(r => r.id === id ? { ...r, status: newStatus } : r));
      toast.success(`Reservation status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleOpenForm = () => {
    // Set default date to today and time to now + 1 hour, rounded to nearest 30 mins
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30);
    
    const defaultDate = now.toISOString().split('T')[0];
    const defaultTime = now.toTimeString().substring(0, 5);

    const availableTables = tables.filter(t => t.status?.toUpperCase() === 'AVAILABLE');
    
    setFormData({
      date: defaultDate,
      time: defaultTime,
      guestCount: 2,
      tableId: availableTables.length > 0 ? availableTables[0].id : ''
    });
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Combine date and time into ISO LocalDateTime format expected by backend
    // Format: "YYYY-MM-DDTHH:MM:SS"
    const reservationTime = `${formData.date}T${formData.time}:00`;
    
    const parsedTableId = parseInt(formData.tableId);
    
    const payload = {
      reservationTime: reservationTime,
      guestCount: parseInt(formData.guestCount),
      tableId: !isNaN(parsedTableId) ? parsedTableId : null
    };
    
    try {
      await reservationApi.addReservation(payload);
      toast.success('Reservation created successfully');
      fetchData(); // Refresh list
      handleCloseForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : 'Failed to create reservation');
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4">Loading reservations...</div>;
  }

  const availableTables = tables.filter(t => t.status?.toUpperCase() === 'AVAILABLE');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
        <button onClick={handleOpenForm} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm">
          + New Reservation
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex items-center space-x-2 mb-4 relative z-10">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Filter Reservations</h2>
        </div>

        <div className="flex flex-wrap gap-4 items-end relative z-10">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full sm:w-48 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-gray-700 transition-all cursor-pointer">
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">From Date</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full sm:w-48 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-gray-700 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">To Date</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full sm:w-48 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-gray-700 transition-all" />
          </div>
          <button onClick={() => {setFilterStatus('ALL'); setDateFrom(''); setDateTo('');}} className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReservations.map((res) => (
              <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">#{res.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDateTime(res.reservationTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {res.guestCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {res.tableNumber ? (
                    <span className="text-sm font-medium text-gray-900">Table {res.tableNumber}</span>
                  ) : (
                    <span className="text-sm text-gray-500 italic">Unassigned</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{res.customerName}</div>
                  {res.customerEmail && res.customerEmail !== "N/A" && (
                    <div className="text-xs text-gray-500 mt-1">{res.customerEmail}</div>
                  )}
                  {res.customerPhone && res.customerPhone !== "N/A" && (
                    <div className="text-xs text-gray-500">{res.customerPhone}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select 
                    value={res.status}
                    onChange={(e) => handleStatusChange(res.id, e.target.value)}
                    disabled={res.status === 'COMPLETED' || res.status === 'CANCELLED'}
                    className={`px-2 py-1 text-xs font-semibold rounded-full border-none focus:ring-0 cursor-pointer ${getStatusColor(res.status)} disabled:opacity-75 disabled:cursor-not-allowed`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredReservations.length === 0 && (
          <div className="text-center py-12 text-gray-500">No reservations found.</div>
        )}
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        title="Delete Reservation"
        message={`Are you sure you want to delete Reservation #${reservationToDelete?.id}?`}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isDestructive={true}
      />

      {/* Add Reservation Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={handleCloseForm}></div>
          <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-xl shadow-2xl max-w-md w-full p-0 overflow-hidden z-10 animate-fade-in-up m-auto flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center bg-white/50 shrink-0">
              <h3 className="text-lg font-bold text-gray-900">New Reservation</h3>
              <button onClick={handleCloseForm} type="button" className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="flex flex-col">
              <div className="p-6 space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
                    <input 
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Time *</label>
                    <input 
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Guests *</label>
                    <input 
                      type="number"
                      min="1"
                      required
                      value={formData.guestCount}
                      onChange={(e) => setFormData({...formData, guestCount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Table *</label>
                    <select 
                      required
                      value={formData.tableId}
                      onChange={(e) => setFormData({...formData, tableId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="" disabled>Select Table</option>
                      {availableTables.map(t => (
                        <option key={t.id} value={t.id}>Table {t.tableNumber} (Seats {t.capacity})</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {availableTables.length === 0 && (
                  <p className="text-xs text-red-500 mt-2">No tables are currently available.</p>
                )}

              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 shrink-0">
                <button 
                  type="button" 
                  onClick={handleCloseForm}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting || availableTables.length === 0}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
