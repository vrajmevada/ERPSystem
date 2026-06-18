import axiosServices from './axios';

export const getLowStockReport = async () => {
  const response = await axiosServices.get('/reports/low-stock');
  return response.data;
};

export const getInventorySummaryReport = async () => {
  const response = await axiosServices.get('/reports/inventory-summary');
  return response.data;
};

export const getStockReport = async (params) => {
  const response = await axiosServices.get('/reports/stock-report', { params });
  return response.data;
};

export const getStockSummaryReport = async (params) => {
  const response = await axiosServices.get('/reports/stock-summary', { params });
  return response.data;
};

export const getTrackingDetailReport = async (params) => {
  const response = await axiosServices.get('/reports/tracking-detail', { params });
  return response.data;
};
