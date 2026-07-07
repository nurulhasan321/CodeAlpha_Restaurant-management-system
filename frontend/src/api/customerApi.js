import api from './axios';

const customerApi = {
  getAllCustomers: async () => {
    const response = await api.get('/api/customers');
    return response.data;
  }
};

export default customerApi;
