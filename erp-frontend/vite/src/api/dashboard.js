import axiosServices from './axios';

export const getSalesSummary = async () => {
  const response = await axiosServices.get('/reports/sales-summary');
  return response.data;
};

export const getPurchaseSummary = async () => {
  const response = await axiosServices.get('/reports/purchase-summary');
  return response.data;
};

export const getInventorySummary = async () => {
  const response = await axiosServices.get('/reports/inventory-summary');
  return response.data;
};

export const getLowStock = async () => {
  const response = await axiosServices.get('/reports/low-stock');
  return response.data;
};