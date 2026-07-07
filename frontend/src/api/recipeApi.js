import api from './axios';

const recipeApi = {
  getRecipe: async (menuId) => {
    const response = await api.get(`/api/menu/${menuId}/recipe`);
    return response.data;
  },

  updateRecipe: async (menuId, ingredients) => {
    const response = await api.put(`/api/menu/${menuId}/recipe`, { ingredients });
    return response.data;
  }
};

export default recipeApi;
