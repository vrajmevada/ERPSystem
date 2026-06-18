import axiosServices from './axios';

export const getMaterialOutwards = async (params) => {
  const response = await axiosServices.get('/materialoutwards', { params });
  return response.data;
};

export const getMaterialOutwardById = async (id) => {
  const response = await axiosServices.get(`/materialoutwards/${id}`);
  return response.data;
};

export const createMaterialOutward = async (outward) => {
  const response = await axiosServices.post('/materialoutwards', outward);
  return response.data;
};

export const approveMaterialOutward = async (id) => {
  const response = await axiosServices.put(`/materialoutwards/${id}/approve`);
  return response.data;
};

export const cancelMaterialOutward = async (id) => {
  const response = await axiosServices.put(`/materialoutwards/${id}/cancel`);
  return response.data;
};
