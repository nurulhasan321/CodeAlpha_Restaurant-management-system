import axiosInstance from './axios';

const uploadApi = {
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        // Do NOT set Content-Type to multipart/form-data manually, axios will handle it
        const response = await axiosInstance.post('/api/upload', formData);
        return response.data.imageUrl;
    }
};

export default uploadApi;
