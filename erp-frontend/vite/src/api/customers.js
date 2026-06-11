import axiosServices from './axios';

export const getCustomers = async (search = '', page = 1, pageSize = 10) => {
  const response = await axiosServices.get('/customers', {
    params: {
      search,
      page,
      pageSize
    }
  });
  return response.data;
};

export const createCustomer = async (customer) => {
  const response = await axiosServices.post('/customers', customer);
  return response.data;
};

export const updateCustomer = async (id, customer) => {
  const response = await axiosServices.put(`/customers/${id}`, customer);
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await axiosServices.delete(`/customers/${id}`);
  return response.data;
};
