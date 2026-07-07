import axiosClient from './axiosClient';

export const userApi = {
    // 1. Lấy danh sách nhân viên
    getAll: (params) => {
        // params có thể chứa: { page: 0, size: 10, search: 'kien', role: 'STAFF' }
        return axiosClient.get('/users', { params }); 
    },

    // 2. Lấy thông tin 1 nhân viên theo ID
    getById: (id) => {
        return axiosClient.get(`/users/${id}`);
    },

    // 3. Tạo nhân viên mới
    create: (data) => {
        return axiosClient.post('/users/create', data);
    },

    // 4. Cập nhật nhân viên
    update: (id, data) => {
        return axiosClient.put(`/users/${id}`, data);
    },

    // 5. Xóa (Vô hiệu hóa) nhân viên
    delete: (id) => {
        return axiosClient.delete(`/users/${id}`);
    }
};