import axiosServices from './axios';

export const getStockConversions = async (search = '', page = 1, pageSize = 10) => {
  const response = await axiosServices.get('/stockconversions', {
    params: { search, page, pageSize }
  });
  return response.data;
};

export const getStockConversionById = async (id) => {
  const response = await axiosServices.get(`/stockconversions/${id}`);
  return response.data;
};

export const createStockConversion = async (conversion) => {
  const response = await axiosServices.post('/stockconversions', conversion);
  return response.data;
};

export const approveStockConversion = async (id) => {
  const response = await axiosServices.put(`/stockconversions/${id}/approve`);
  return response.data;
};

export const cancelStockConversion = async (id) => {
  const response = await axiosServices.put(`/stockconversions/${id}/cancel`);
  return response.data;
};
