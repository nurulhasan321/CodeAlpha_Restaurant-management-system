import axiosInstance from './axios';

const addressApi = {
  addAddress: async (addressData) => {
    const response = await axiosInstance.post('/api/addresses', addressData);
    return response.data;
  },
  getMyAddresses: async () => {
    const response = await axiosInstance.get('/api/addresses/me');
    return response.data;
  },
  deleteAddress: async (id) => {
    const response = await axiosInstance.delete(`/api/addresses/${id}`);
    return response.data;
  }
};

export default addressApi;
