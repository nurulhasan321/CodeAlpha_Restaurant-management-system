import React, { useState, useEffect } from 'react';
import menuApi from '../../api/menuApi';
import categoryApi from '../../api/categoryApi';
import uploadApi from '../../api/uploadApi';
import ConfirmModal from '../../components/ConfirmModal';
import RecipeModal from '../../components/RecipeModal';
import { toast } from 'react-toastify';
import { useCurrency } from '../../hooks/useCurrency';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState('DEVICE');
  
  // Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [recipeMenuItem, setRecipeMenuItem] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    availability: 'AVAILABLE',
    imageUrl: ''
  });

  // Filters State
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterAvailability, setFilterAvailability] = useState('ALL');

  const filteredMenuItems = React.useMemo(() => {
    return menuItems.filter(item => {
      if (filterCategory !== 'ALL' && item.category !== filterCategory) return false;
      if (filterAvailability !== 'ALL') {
        const isAvail = (item.availability === 'true' || item.availability?.toUpperCase() === 'AVAILABLE');
        if (filterAvailability === 'AVAILABLE' && !isAvail) return false;
        if (filterAvailability === 'UNAVAILABLE' && isAvail) return false;
      }
      return true;
    });
  }, [menuItems, filterCategory, filterAvailability]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menuData, categoryData] = await Promise.all([
        menuApi.getAllMenus(),
        categoryApi.getAllCategories()
      ]);
      setMenuItems(menuData);
      setCategories(categoryData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load menu data');
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
      await menuApi.deleteMenu(itemToDelete.id);
      setMenuItems(menuItems.filter(item => item.id !== itemToDelete.id));
      toast.success(`${itemToDelete.name} deleted successfully`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : 'Failed to delete menu item');
      toast.error(errorMessage);
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleOpenForm = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        category: item.category || '',
        price: item.price || '',
        availability: (item.availability === 'true' ? 'AVAILABLE' : (item.availability === 'false' ? 'UNAVAILABLE' : (item.availability || 'AVAILABLE'))),
        imageUrl: item.imageUrl || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        category: categories.length > 0 ? categories[0].name : '',
        price: '',
        availability: 'AVAILABLE',
        imageUrl: ''
      });
    }
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setEditingItem(null);
  };

  const handleOpenRecipe = (item) => {
    setRecipeMenuItem(item);
    setIsRecipeModalOpen(true);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const url = await uploadApi.uploadImage(file);
      setFormData(prev => ({ ...prev, imageUrl: url }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Ensure price is a number
    const payload = {
      ...formData,
      price: parseFloat(formData.price)
    };
    
    try {
      if (editingItem) {
        await menuApi.updateMenu(editingItem.id, payload);
        toast.success('Menu item updated successfully');
      } else {
        await menuApi.addMenu(payload);
        toast.success('Menu item added successfully');
      }
      fetchData(); // Refresh the list
      handleCloseForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : 'Failed to save menu item');
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4">Loading menu...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <div className="flex space-x-3">
          <button onClick={() => handleOpenForm()} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm">
            + Add Item
          </button>
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
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Filter Menu</h2>
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
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Availability</label>
            <select value={filterAvailability} onChange={e => setFilterAvailability(e.target.value)} className="w-full sm:w-48 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-gray-700 transition-all cursor-pointer">
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>
          <button onClick={() => {setFilterCategory('ALL'); setFilterAvailability('ALL');}} className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all flex items-center space-x-2">
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMenuItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{formatCurrency(item.price)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(item.availability === 'true' || item.availability?.toUpperCase() === 'AVAILABLE') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {(item.availability === 'true' || item.availability?.toUpperCase() === 'AVAILABLE') ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenRecipe(item)} className="text-blue-600 hover:text-blue-800 mr-4">Recipe</button>
                  <button onClick={() => handleOpenForm(item)} className="text-primary hover:text-primary-hover mr-4">Edit</button>
                  <button 
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDeleteClick(item)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredMenuItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">No menu items found.</div>
        )}
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${itemToDelete?.name}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isDestructive={true}
      />

      {/* Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={handleCloseForm}></div>
          <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-xl shadow-2xl max-w-md w-full p-0 overflow-hidden z-10 animate-fade-in-up m-auto">
            <div className="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center bg-white/50">
              <h3 className="text-lg font-bold text-gray-900">{editingItem ? 'Edit Item' : 'Add Item'}</h3>
              <button onClick={handleCloseForm} type="button" className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                  <input 
                    type="text" required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300/50 bg-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300/50 bg-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                    rows="2"
                  />
                </div>

                <div className="col-span-2">
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-xs font-medium text-gray-700">Image</label>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => setImageUploadMode('DEVICE')} 
                        className={`text-xs px-2 py-1 rounded-md transition-colors ${imageUploadMode === 'DEVICE' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                      >
                        Upload File
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setImageUploadMode('URL')} 
                        className={`text-xs px-2 py-1 rounded-md transition-colors ${imageUploadMode === 'URL' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                      >
                        Image URL
                      </button>
                    </div>
                  </div>
                  
                  {imageUploadMode === 'DEVICE' ? (
                    <>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-3 py-2 border border-gray-300/50 bg-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                      />
                      {uploadingImage && <p className="text-xs text-primary mt-1">Uploading...</p>}
                    </>
                  ) : (
                    <input 
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300/50 bg-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  )}

                  {formData.imageUrl && !uploadingImage && (
                    <div className="mt-2">
                      <img src={formData.imageUrl} alt="Preview" className="h-20 w-20 object-cover rounded shadow-sm border border-gray-200" />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                  <select 
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300/50 bg-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Price *</label>
                  <input 
                    type="number" step="0.01" min="0" required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300/50 bg-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Availability</label>
                  <select 
                    value={formData.availability}
                    onChange={(e) => setFormData({...formData, availability: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300/50 bg-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="UNAVAILABLE">Unavailable</option>
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

      {/* Recipe Modal */}
      <RecipeModal 
        isOpen={isRecipeModalOpen}
        onClose={() => {setIsRecipeModalOpen(false); setRecipeMenuItem(null);}}
        menuItem={recipeMenuItem}
      />
    </div>
  );
};

export default Menu;
