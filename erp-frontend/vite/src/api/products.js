import axiosServices from './axios';

export const getProducts = async (search = '', page = 1, pageSize = 10) => {
  const response = await axiosServices.get('/products', {
    params: {
      search,
      page,
      pageSize
    }
  });
  return response.data;
};

export const createProduct = async (product) => {
  const response = await axiosServices.post('/products', product);
  return response.data;
};

export const getCategories = async () => {
  const response = await axiosServices.get('/categories');
  return response.data;
};