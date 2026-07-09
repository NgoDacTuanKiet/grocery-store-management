import axiosClient from './axiosClient';

export const dashboardApi = {
    getOverview: () => {
        return axiosClient.get('/dashboard');
    }
};
