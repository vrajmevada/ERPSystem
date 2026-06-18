import axiosServices from './axios';

export const getTransferSlips = async (search = '', page = 1, pageSize = 10) => {
  const response = await axiosServices.get('/transferslips', {
    params: { search, page, pageSize }
  });
  return response.data;
};

export const getTransferSlipById = async (id) => {
  const response = await axiosServices.get(`/transferslips/${id}`);
  return response.data;
};

export const createTransferSlip = async (slip) => {
  const response = await axiosServices.post('/transferslips', slip);
  return response.data;
};

export const shipTransferSlip = async (id) => {
  const response = await axiosServices.put(`/transferslips/${id}/ship`);
  return response.data;
};

export const receiveTransferSlip = async (id) => {
  const response = await axiosServices.put(`/transferslips/${id}/receive`);
  return response.data;
};

export const shortCloseTransferSlip = async (id, dto) => {
  const response = await axiosServices.put(`/transferslips/${id}/short-close`, dto);
  return response.data;
};
