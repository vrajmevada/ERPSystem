import axiosServices from './axios';

export const getSalesOrders = async (search = '', page = 1, pageSize = 10) => {
  const response = await axiosServices.get('/salesorders', {
    params: {
      search,
      page,
      pageSize
    }
  });
  return response.data;
};

export const createSalesOrder = async (order) => {
  const response = await axiosServices.post('/salesorders', order);
  return response.data;
};

export const confirmSalesOrder = async (id) => {
  const response = await axiosServices.post(`/salesorders/${id}/confirm`);
  return response.data;
};

export const shipSalesOrder = async (id) => {
  const response = await axiosServices.post(`/salesorders/${id}/ship`);
  return response.data;
};
