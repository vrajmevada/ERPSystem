import axiosServices from './axios';

export const getStockItems = async (search = '', page = 1, pageSize = 100) => {
  const response = await axiosServices.get('/stockitems', {
    params: {
      search,
      page,
      pageSize
    }
  });
  return response.data;
};
