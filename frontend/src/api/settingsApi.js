import api from './axios';

const settingsApi = {
    getSettings: async () => {
        const response = await api.get('/api/settings');
        return response.data;
    },

    updateRestaurantInfo: async (data) => {
        const response = await api.put('/api/settings/restaurant', data);
        return response.data;
    },

    updateNotificationPreferences: async (data) => {
        const response = await api.put('/api/settings/notifications', data);
        return response.data;
    }
};

export default settingsApi;
