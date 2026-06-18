import axiosServices from './axios';

export const getDeliveryChallans = async (search = '', page = 1, pageSize = 10) => {
  const response = await axiosServices.get('/deliverychallans', {
    params: { search, page, pageSize }
  });
  return response.data;
};

export const getDeliveryChallanById = async (id) => {
  const response = await axiosServices.get(`/deliverychallans/${id}`);
  return response.data;
};

export const createDeliveryChallan = async (challan) => {
  const response = await axiosServices.post('/deliverychallans', challan);
  return response.data;
};

export const shipDeliveryChallan = async (id) => {
  const response = await axiosServices.put(`/deliverychallans/${id}/ship`);
  return response.data;
};

export const cancelDeliveryChallan = async (id) => {
  const response = await axiosServices.put(`/deliverychallans/${id}/cancel`);
  return response.data;
};
