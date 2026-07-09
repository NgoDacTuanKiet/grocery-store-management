import axiosClient from './axiosClient';

export const paymentReceiptApi = {
    create: (data) => {
        return axiosClient.post('/payment-receipts', data);
    },
    getByCustomer: (customerId) => {
        return axiosClient.get(`/payment-receipts/customer/${customerId}`);
    }
};
