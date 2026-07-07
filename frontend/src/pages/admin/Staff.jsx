import React, { useState, useEffect } from 'react';
import staffApi from '../../api/staffApi';
import ConfirmModal from '../../components/ConfirmModal';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth(); // Logged in user

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    roleName: 'STAFF'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await staffApi.getAllStaff();
      setStaffList(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load staff accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddForm = () => {
    setFormData({ name: '', email: '', password: '', phone: '', roleName: 'STAFF' });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await staffApi.createStaff(formData);
      toast.success('Staff account created successfully!');
      fetchData();
      setIsAddModalOpen(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : 'Failed to create staff account');
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (staffMember) => {
    if (staffMember.id === user?.id) {
      toast.error("You cannot delete your own admin account.");
      return;
    }
    setStaffToDelete(staffMember);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await staffApi.deleteStaff(staffToDelete.id);
      setStaffList(staffList.filter(s => s.id !== staffToDelete.id));
      toast.success(`Account for ${staffToDelete.name} revoked successfully.`);
    } catch (error) {
      toast.error('Failed to delete staff member');
    } finally {
      setIsDeleteModalOpen(false);
      setStaffToDelete(null);
    }
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4">Loading staff data...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500">Manage employee accounts and access roles.</p>
        </div>
        <button onClick={handleOpenAddForm} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm">
          + Add Staff Member
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staffList.map((staff) => (
              <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold uppercase">
                    {staff.name.charAt(0)}
                  </div>
                  {staff.name} {staff.id === user?.id && <span className="text-xs font-normal text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full ml-2">You</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{staff.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${staff.roleName === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {staff.roleName}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleDeleteClick(staff)} 
                    disabled={staff.id === user?.id}
                    className={`text-red-600 hover:text-red-900 ${staff.id === user?.id ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    Revoke Access
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staffList.length === 0 && (
          <div className="text-center py-12 text-gray-500">No staff members found.</div>
        )}
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        title="Revoke Access"
        message={`Are you sure you want to permanently delete the account for ${staffToDelete?.name}? They will lose all access to the system immediately.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isDestructive={true}
      />

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-xl shadow-2xl max-w-md w-full p-0 overflow-hidden z-10 animate-fade-in-up m-auto flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center bg-white/50 shrink-0">
              <h3 className="text-lg font-bold text-gray-900">Add New Staff Member</h3>
              <button onClick={() => setIsAddModalOpen(false)} type="button" className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="flex flex-col">
              <div className="p-6 space-y-4">
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="john@savory.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Temporary Password</label>
                  <input 
                    type="text"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                    placeholder="e.g. TempPass123!"
                  />
                  <p className="text-xs text-gray-500 mt-1">Provide this to the employee so they can log in.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. 123-456-7890"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">System Role</label>
                  <select 
                    required
                    value={formData.roleName}
                    onChange={(e) => setFormData({...formData, roleName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  >
                    <option value="STAFF">STAFF (Waiters, Chefs)</option>
                    <option value="ADMIN">ADMIN (Managers)</option>
                  </select>
                </div>

              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 shrink-0">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
