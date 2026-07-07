import React, { useState, useEffect } from 'react';
import inventoryApi from '../../api/inventoryApi';
import categoryApi from '../../api/categoryApi';
import ConfirmModal from '../../components/ConfirmModal';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [itemToRestock, setItemToRestock] = useState(null);
  const [restockAmount, setRestockAmount] = useState('');

  const [isDeductModalOpen, setIsDeductModalOpen] = useState(false);
  const [itemToDeduct, setItemToDeduct] = useState(null);
  const [deductAmount, setDeductAmount] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    itemName: '',
    skuCode: '',
    quantity: '',
    unit: 'kg',
    minimumThreshold: '',
    categoryId: ''
  });

  // Filters State
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredItems = React.useMemo(() => {
    return items.filter(item => {
      if (filterCategory !== 'ALL' && item.categoryName !== filterCategory) return false;
      if (filterStatus !== 'ALL' && item.status?.toUpperCase() !== filterStatus) return false;
      return true;
    });
  }, [items, filterCategory, filterStatus]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invData, catData] = await Promise.all([
        inventoryApi.getAllItems(),
        categoryApi.getAllCategories()
      ]);
      setItems(invData);
      setCategories(catData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await inventoryApi.deleteItem(itemToDelete.id);
      setItems(items.filter(i => i.id !== itemToDelete.id));
      toast.success(`Item deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete item');
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleRestockClick = (item) => {
    setItemToRestock(item);
    setRestockAmount('');
    setIsRestockModalOpen(true);
  };

  const confirmRestock = async (e) => {
    e.preventDefault();
    if (!restockAmount || isNaN(restockAmount) || parseFloat(restockAmount) <= 0) {
      toast.error('Please enter a valid restock amount');
      return;
    }
    
    setSubmitting(true);
    try {
      const updatedItem = await inventoryApi.restockItem(itemToRestock.id, parseFloat(restockAmount));
      setItems(items.map(i => i.id === updatedItem.id ? updatedItem : i));
      toast.success(`Successfully added ${restockAmount} to ${itemToRestock.itemName}`);
      setIsRestockModalOpen(false);
    } catch (error) {
      toast.error('Failed to restock item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeductClick = (item) => {
    setItemToDeduct(item);
    setDeductAmount('');
    setIsDeductModalOpen(true);
  };

  const confirmDeduct = async (e) => {
    e.preventDefault();
    if (!deductAmount || isNaN(deductAmount) || parseFloat(deductAmount) <= 0) {
      toast.error('Please enter a valid deduct amount');
      return;
    }
    
    setSubmitting(true);
    try {
      const updatedItem = await inventoryApi.deductItem(itemToDeduct.id, parseFloat(deductAmount));
      setItems(items.map(i => i.id === updatedItem.id ? updatedItem : i));
      toast.success(`Successfully deducted ${deductAmount} from ${itemToDeduct.itemName}`);
      setIsDeductModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deduct item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (item) => {
    setItemToEdit(item);
    setFormData({
      itemName: item.itemName,
      skuCode: item.skuCode,
      quantity: item.quantity,
      unit: item.unit,
      minimumThreshold: item.minimumThreshold,
      categoryId: item.categoryId || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const payload = {
      ...formData,
      quantity: parseFloat(formData.quantity),
      minimumThreshold: parseFloat(formData.minimumThreshold),
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null
    };
    
    try {
      const updated = await inventoryApi.updateItem(itemToEdit.id, payload);
      setItems(items.map(i => i.id === updated.id ? updated : i));
      toast.success('Inventory item updated successfully');
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error('Failed to update item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAddForm = () => {
    setFormData({
      itemName: '',
      skuCode: '',
      quantity: '',
      unit: 'kg',
      minimumThreshold: '',
      categoryId: categories.length > 0 ? categories[0].id : ''
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const payload = {
      ...formData,
      quantity: parseFloat(formData.quantity),
      minimumThreshold: parseFloat(formData.minimumThreshold),
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null
    };
    
    try {
      await inventoryApi.addItem(payload);
      toast.success('Inventory item created successfully');
      fetchData(); // Refresh list
      setIsAddModalOpen(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : 'Failed to add item');
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status?.toUpperCase()) {
      case 'IN_STOCK': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">In Stock</span>;
      case 'LOW_STOCK': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Low Stock</span>;
      case 'OUT_OF_STOCK': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Out of Stock</span>;
      default: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4">Loading inventory...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <button onClick={handleOpenAddForm} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm">
          + Add Item
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
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Filter Inventory</h2>
        </div>

        <div className="flex flex-wrap gap-4 items-end relative z-10">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Category</label>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full sm:w-48 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-gray-700 transition-all cursor-pointer">
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full sm:w-48 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-gray-700 transition-all cursor-pointer">
              <option value="ALL">All Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
          <button onClick={() => {setFilterCategory('ALL'); setFilterStatus('ALL');}} className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all flex items-center space-x-2">
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Stock</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{item.skuCode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{item.itemName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.categoryName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.quantity} {item.unit}</div>
                  <div className="text-xs text-gray-500">Min: {item.minimumThreshold} {item.unit}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button onClick={() => handleEditClick(item)} className="text-gray-600 hover:text-gray-900">
                    Edit
                  </button>
                  <button onClick={() => handleRestockClick(item)} className="text-blue-600 hover:text-blue-900">
                    Restock
                  </button>
                  <button onClick={() => handleDeductClick(item)} className="text-orange-600 hover:text-orange-900">
                    Deduct
                  </button>
                  <button onClick={() => handleDeleteClick(item)} className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">No inventory items found.</div>
        )}
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        title="Delete Item"
        message={`Are you sure you want to delete ${itemToDelete?.itemName}?`}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isDestructive={true}
      />

      {/* Restock Modal */}
      {isRestockModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsRestockModalOpen(false)}></div>
          <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-xl shadow-2xl max-w-sm w-full p-0 overflow-hidden z-10 animate-fade-in-up m-auto flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center bg-white/50 shrink-0">
              <h3 className="text-lg font-bold text-gray-900">Restock Item</h3>
              <button onClick={() => setIsRestockModalOpen(false)} type="button" className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={confirmRestock} className="flex flex-col">
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  How much <strong>{itemToRestock?.itemName}</strong> are you adding to the current stock ({itemToRestock?.quantity} {itemToRestock?.unit})?
                </p>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Additional Amount ({itemToRestock?.unit})</label>
                  <input 
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 shrink-0">
                <button type="button" onClick={() => setIsRestockModalOpen(false)} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? 'Updating...' : 'Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deduct Modal */}
      {isDeductModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsDeductModalOpen(false)}></div>
          <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-xl shadow-2xl max-w-sm w-full p-0 overflow-hidden z-10 animate-fade-in-up m-auto flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center bg-white/50 shrink-0">
              <h3 className="text-lg font-bold text-gray-900">Deduct Stock</h3>
              <button onClick={() => setIsDeductModalOpen(false)} type="button" className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={confirmDeduct} className="flex flex-col">
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  How much <strong>{itemToDeduct?.itemName}</strong> are you deducting from the current stock ({itemToDeduct?.quantity} {itemToDeduct?.unit})?
                </p>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Deduct Amount ({itemToDeduct?.unit})</label>
                  <input 
                    type="number"
                    min="0.01"
                    max={itemToDeduct?.quantity}
                    step="0.01"
                    required
                    value={deductAmount}
                    onChange={(e) => setDeductAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 shrink-0">
                <button type="button" onClick={() => setIsDeductModalOpen(false)} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50">
                  {submitting ? 'Updating...' : 'Deduct'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-xl shadow-2xl max-w-lg w-full p-0 overflow-hidden z-10 animate-fade-in-up m-auto flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center bg-white/50 shrink-0">
              <h3 className="text-lg font-bold text-gray-900">{isEditModalOpen ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h3>
              <button onClick={() => {setIsAddModalOpen(false); setIsEditModalOpen(false);}} type="button" className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={isEditModalOpen ? handleEditSubmit : handleAddSubmit} className="flex flex-col">
              <div className="p-6 space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Item Name *</label>
                    <input 
                      type="text"
                      required
                      value={formData.itemName}
                      onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">SKU Code *</label>
                    <input 
                      type="text"
                      required
                      value={formData.skuCode}
                      onChange={(e) => setFormData({...formData, skuCode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                      placeholder="e.g. CHK-BRST-01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Initial Qty *</label>
                    <input 
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Unit *</label>
                    <select 
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                      <option value="liters">liters</option>
                      <option value="pcs">pcs</option>
                      <option value="boxes">boxes</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Min Threshold *</label>
                    <input 
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.minimumThreshold}
                      onChange={(e) => setFormData({...formData, minimumThreshold: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category (Optional)</label>
                  <select 
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">No Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 shrink-0">
                <button type="button" onClick={() => {setIsAddModalOpen(false); setIsEditModalOpen(false);}} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
