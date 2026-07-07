import axiosClient from './axiosClient';

export const categoryApi = {
    getAll: (params) => {
        return axiosClient.get('/categories', { params });
    },
    getById: (id) => {
        return axiosClient.get(`/categories/${id}`);
    },
    create: (data) => {
        return axiosClient.post('/categories', data);
    },
    update: (id, data) => {
        return axiosClient.put(`/categories/${id}`, data);
    },
    delete: (id) => {
        return axiosClient.delete(`/categories/${id}`);
    }
};