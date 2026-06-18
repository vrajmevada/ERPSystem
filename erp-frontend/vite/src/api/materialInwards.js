import axiosServices from './axios';

export const getMaterialInwards = async (params) => {
  const response = await axiosServices.get('/materialinwards', { params });
  return response.data;
};

export const getMaterialInwardById = async (id) => {
  const response = await axiosServices.get(`/materialinwards/${id}`);
  return response.data;
};

export const createMaterialInward = async (inward) => {
  const response = await axiosServices.post('/materialinwards', inward);
  return response.data;
};

export const approveMaterialInward = async (id) => {
  const response = await axiosServices.put(`/materialinwards/${id}/approve`);
  return response.data;
};

export const cancelMaterialInward = async (id) => {
  const response = await axiosServices.put(`/materialinwards/${id}/cancel`);
  return response.data;
};
