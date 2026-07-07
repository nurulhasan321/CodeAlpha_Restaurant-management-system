import api from './axios';

const staffApi = {
  getAllStaff: async () => {
    const response = await api.get('/api/staff');
    return response.data;
  },

  createStaff: async (data) => {
    const response = await api.post('/api/staff/add', data);
    return response.data;
  },

  deleteStaff: async (id) => {
    const response = await api.delete(`/api/staff/${id}`);
    return response.data;
  }
};

export default staffApi;
