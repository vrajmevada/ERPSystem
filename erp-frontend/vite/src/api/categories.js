import axiosServices from './axios';

export const getCategories = async () => {
  const response = await axiosServices.get('/categories');
  return response.data;
};

export const createCategory = async (category) => {
  const response = await axiosServices.post('/categories', category);
  return response.data;
};

export const updateCategory = async (id, category) => {
  const response = await axiosServices.put(`/categories/${id}`, category);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await axiosServices.delete(`/categories/${id}`);
  return response.data;
};
