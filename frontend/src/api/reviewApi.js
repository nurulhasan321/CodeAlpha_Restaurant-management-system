import axiosInstance from './axios';

const reviewApi = {
  addReview: async (reviewData) => {
    const response = await axiosInstance.post('/api/reviews', reviewData);
    return response.data;
  },
  getMyReviews: async () => {
    const response = await axiosInstance.get('/api/reviews/me');
    return response.data;
  }
};

export default reviewApi;
