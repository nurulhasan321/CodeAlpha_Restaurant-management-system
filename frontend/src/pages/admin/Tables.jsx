import React, { useState, useEffect } from 'react';
import tableApi from '../../api/tableApi';
import ConfirmModal from '../../components/ConfirmModal';
import { toast } from 'react-toastify';

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 2,
    location: 'Main Hall',
    status: 'AVAILABLE'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const data = await tableApi.getAllTables();
      setTables(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  // Delete Handlers
  const handleDeleteClick = (table) => {
    setTableToDelete(table);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await tableApi.deleteTable(tableToDelete.id);
      setTables(tables.filter(t => t.id !== tableToDelete.id));
      toast.success(`Table ${tableToDelete.tableNumber} deleted successfully`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : 'Failed to delete table');
      toast.error(errorMessage);
    } finally {
      setIsDeleteModalOpen(false);
      setTableToDelete(null);
    }
  };

  // Form Handlers
  const handleOpenForm = (table = null) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        location: table.location,
        status: table.status
      });
    } else {
      setEditingTable(null);
      setFormData({
        tableNumber: '',
        capacity: 2,
        location: 'Main Hall',
        status: 'AVAILABLE'
      });
    }
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setEditingTable(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.capacity || isNaN(formData.capacity)) {
      toast.error('Please enter a valid capacity');
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (editingTable) {
        const updated = await tableApi.updateTable(editingTable.id, formData);
        setTables(tables.map(t => t.id === editingTable.id ? updated : t));
        toast.success(`Table ${updated.tableNumber} updated successfully`);
      } else {
        await tableApi.addTable(formData);
        toast.success(`Table ${formData.tableNumber} added successfully`);
        fetchTables(); // Refresh list to get the new table with its ID
      }
      handleCloseForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : 'Failed to save table');
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4">Loading tables...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tables Management</h1>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm"
        >
          + Add Table
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table No.</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tables.map((table) => (
              <tr key={table.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{table.tableNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{table.location || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{table.capacity} Persons</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    table.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 
                    table.status === 'OCCUPIED' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {table.status}
                  </span>
                  {table.status === 'RESERVED' && table.reservedBy && (
                    <div className="mt-2 text-xs text-gray-500">
                      <div className="font-medium text-gray-900">{table.reservedBy}</div>
                      {table.reservedPhone && table.reservedPhone !== "N/A" && <div>{table.reservedPhone}</div>}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    className="text-primary hover:text-primary-hover mr-4"
                    onClick={() => handleOpenForm(table)}
                  >
                    Edit
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDeleteClick(table)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tables.length === 0 && (
          <div className="text-center py-12 text-gray-500">No tables found.</div>
        )}
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        title="Delete Table"
        message={`Are you sure you want to delete table "${tableToDelete?.tableNumber}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isDestructive={true}
      />

      {/* Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={handleCloseForm}></div>
          <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-2xl max-w-sm w-full p-0 overflow-hidden z-10 animate-fade-in-up m-auto">
            <div className="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center bg-white/50">
              <h3 className="text-lg font-bold text-gray-900">{editingTable ? 'Edit Table' : 'Add Table'}</h3>
              <button onClick={handleCloseForm} type="button" className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Number *</label>
                  <input 
                    type="text" required
                    value={formData.tableNumber}
                    onChange={(e) => setFormData({...formData, tableNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300/50 bg-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="e.g. T-01"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Capacity *</label>
                  <input 
                    type="number" required min="1" max="20"
                    value={formData.capacity === '' ? '' : formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value === '' ? '' : parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300/50 bg-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                  <select 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300/50 bg-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                  >
                    <option value="Main Hall">Main Hall</option>
                    <option value="Window">Window</option>
                    <option value="Patio">Patio</option>
                    <option value="Private Room">Private Room</option>
                    <option value="Bar Area">Bar Area</option>
                    <option value="Balcony">Balcony</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300/50 bg-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="RESERVED">Reserved</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200/50">
                <button 
                  type="button" 
                  onClick={handleCloseForm}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white/50 hover:bg-white focus:outline-none"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;
