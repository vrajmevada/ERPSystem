import axiosServices from './axios';

export const getDepartments = async () => {
  const response = await axiosServices.get('/departments');
  return response.data;
};
