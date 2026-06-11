import axiosServices from './axios';

export const getSuppliers = async (search = '', page = 1, pageSize = 10) => {
  const response = await axiosServices.get('/suppliers', {
    params: {
      search,
      page,
      pageSize
    }
  });
  return response.data;
};

export const createSupplier = async (supplier) => {
  const response = await axiosServices.post('/suppliers', supplier);
  return response.data;
};

export const updateSupplier = async (id, supplier) => {
  const response = await axiosServices.put(`/suppliers/${id}`, supplier);
  return response.data;
};

export const deleteSupplier = async (id) => {
  const response = await axiosServices.delete(`/suppliers/${id}`);
  return response.data;
};
