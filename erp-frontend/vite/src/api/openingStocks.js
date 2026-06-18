import axiosServices from './axios';

export const getOpeningStocks = async (params) => {
  const response = await axiosServices.get('/openingstocks', { params });
  return response.data;
};

export const createOpeningStock = async (openingStock) => {
  const response = await axiosServices.post('/openingstocks', openingStock);
  return response.data;
};

export const deleteOpeningStock = async (id) => {
  const response = await axiosServices.delete(`/openingstocks/${id}`);
  return response.data;
};
