import axiosServices from './axios';

export const getInventoryTransactions = async () => {
  const response = await axiosServices.get('/inventorytransactions');
  return response.data;
};

export const createInventoryTransaction = async (transaction) => {
  const response = await axiosServices.post('/inventorytransactions', transaction);
  return response.data;
};
