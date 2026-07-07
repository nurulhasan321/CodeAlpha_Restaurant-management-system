import api from './axios';

const reservationApi = {
  getAllReservations: async () => {
    const response = await api.get('/api/reservations');
    return response.data;
  },

  getMyReservations: async () => {
    const response = await api.get('/api/reservations/my-reservations');
    return response.data;
  },

  addReservation: async (data) => {
    const response = await api.post('/api/reservations/add', data);
    return response.data;
  },

  updateReservationStatus: async (id, status) => {
    const response = await api.put(`/api/reservations/${id}/status?status=${status}`);
    return response.data;
  },

  deleteReservation: async (id) => {
    const response = await api.delete(`/api/reservations/${id}`);
    return response.data;
  }
};

export default reservationApi;
