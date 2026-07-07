import React, { useState, useEffect, useCallback } from 'react';
import recipeApi from '../api/recipeApi';
import inventoryApi from '../api/inventoryApi';
import { toast } from 'react-toastify';

const RecipeModal = ({ isOpen, onClose, menuItem }) => {
  const [ingredients, setIngredients] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [recipeData, invData] = await Promise.all([
        recipeApi.getRecipe(menuItem.id),
        inventoryApi.getAllItems()
      ]);
      setIngredients(recipeData);
      setInventoryItems(invData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load recipe data');
    } finally {
      setLoading(false);
    }
  }, [menuItem]);

  useEffect(() => {
    if (isOpen && menuItem) {
      fetchData();
    }
  }, [isOpen, menuItem, fetchData]);

  const handleAddIngredient = () => {
    if (inventoryItems.length === 0) return;
    setIngredients([...ingredients, {
      inventoryItemId: inventoryItems[0].id,
      quantityRequired: ''
    }]);
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    if (field === 'inventoryItemId') {
      newIngredients[index].inventoryItemId = parseInt(value);
    } else if (field === 'quantityRequired') {
      newIngredients[index].quantityRequired = value;
    }
    setIngredients(newIngredients);
  };

  const handleSave = async () => {
    // Validate
    for (let i = 0; i < ingredients.length; i++) {
      const ing = ingredients[i];
      if (!ing.inventoryItemId || !ing.quantityRequired || isNaN(ing.quantityRequired) || parseFloat(ing.quantityRequired) <= 0) {
        toast.error('Please ensure all ingredients have a valid quantity greater than 0.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = ingredients.map(ing => ({
        inventoryItemId: parseInt(ing.inventoryItemId),
        quantityRequired: parseFloat(ing.quantityRequired)
      }));
      await recipeApi.updateRecipe(menuItem.id, payload);
      toast.success('Recipe saved successfully!');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-xl shadow-2xl max-w-2xl w-full p-0 overflow-hidden z-10 animate-fade-in-up m-auto flex flex-col max-h-[80vh]">
        <div className="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center bg-white/50 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Manage Recipe</h3>
            <p className="text-sm text-gray-500">{menuItem?.name}</p>
          </div>
          <button onClick={onClose} type="button" className="text-gray-400 hover:text-gray-600 focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-4 text-gray-500 animate-pulse">Loading recipe...</div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Define the inventory items and quantities required to make this dish. When an order is moved to "PREPARING", these quantities will automatically be deducted from inventory.
              </p>

              {ingredients.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 mb-4">
                  <p className="text-sm text-gray-500">No ingredients defined for this recipe.</p>
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  {ingredients.map((ing, index) => {
                    const selectedItem = inventoryItems.find(i => i.id === ing.inventoryItemId);
                    const unit = selectedItem ? selectedItem.unit : '';
                    
                    return (
                      <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Ingredient</label>
                          <select 
                            value={ing.inventoryItemId}
                            onChange={(e) => handleIngredientChange(index, 'inventoryItemId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            {inventoryItems.map(item => (
                              <option key={item.id} value={item.id}>{item.itemName} ({item.skuCode})</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-32">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Quantity ({unit})</label>
                          <input 
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={ing.quantityRequired}
                            onChange={(e) => handleIngredientChange(index, 'quantityRequired', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div className="pt-5">
                          <button 
                            type="button" 
                            onClick={() => handleRemoveIngredient(index)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                            title="Remove"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button 
                type="button" 
                onClick={handleAddIngredient}
                className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Ingredient
              </button>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Recipe'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
