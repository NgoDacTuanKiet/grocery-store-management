import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Chặn request trước khi gửi đi để nhét Token vào
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Chặn response trả về để format dữ liệu (lấy thẳng phần data)
axiosClient.interceptors.response.use((response) => {
    return response.data;
}, (error) => {
    return Promise.reject(error.response?.data || error.message);
});

export default axiosClient;