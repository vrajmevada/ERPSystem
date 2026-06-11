import axiosServices from './axios';

export const getWarehouses = async () => {
  const response = await axiosServices.get('/warehouses');
  return response.data;
};

export const createWarehouse = async (warehouse) => {
  const response = await axiosServices.post('/warehouses', warehouse);
  return response.data;
};

export const updateWarehouse = async (id, warehouse) => {
  const response = await axiosServices.put(`/warehouses/${id}`, warehouse);
  return response.data;
};

export const deleteWarehouse = async (id) => {
  const response = await axiosServices.delete(`/warehouses/${id}`);
  return response.data;
};
