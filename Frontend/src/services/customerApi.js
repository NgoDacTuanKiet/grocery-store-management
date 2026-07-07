import axiosClient from './axiosClient';

export const customerApi = {
    // Lấy danh sách khách hàng (phân trang, tìm kiếm theo tên/sđt)
    getAll: (params) => {
        return axiosClient.get('/customers', { params });
    },
    getDetail: (id) => {
        return axiosClient.get(`/customers/${id}`); 
    },
    create: (data) => {
        return axiosClient.post('/customers/create', data);
    }
};