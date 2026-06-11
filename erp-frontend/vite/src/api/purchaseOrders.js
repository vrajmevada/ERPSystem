import axiosServices from './axios';

export const getPurchaseOrders = async (search = '', page = 1, pageSize = 10) => {
  const response = await axiosServices.get('/purchaseorders', {
    params: {
      search,
      page,
      pageSize
    }
  });
  return response.data;
};

export const createPurchaseOrder = async (order) => {
  const response = await axiosServices.post('/purchaseorders', order);
  return response.data;
};

export const receivePurchaseOrder = async (id) => {
  const response = await axiosServices.post(`/purchaseorders/${id}/receive`);
  return response.data;
};

export const approvePurchaseOrder = async (id) => {
  const response = await axiosServices.post(`/purchaseorders/${id}/approve`);
  return response.data;
};
