import axiosClient from './axiosClient';

export const invoiceApi = {
    getAll: (params) => {
        return axiosClient.get('/invoices', { params });
    },
    getById: (id) => {
        return axiosClient.get(`/invoices/${id}`);
    },
    create: (data) => {
        return axiosClient.post('/invoices', data);
    }
};