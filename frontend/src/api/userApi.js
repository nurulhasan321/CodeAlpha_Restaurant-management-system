import axiosInstance from './axios';

const userApi = {
  getMyProfile: async () => {
    const response = await axiosInstance.get('/api/users/me/profile');
    return response.data;
  },
  addFundsToWallet: async (amount) => {
    const response = await axiosInstance.post(`/api/users/me/wallet/add?amount=${amount}`);
    return response.data;
  }
};

export default userApi;
