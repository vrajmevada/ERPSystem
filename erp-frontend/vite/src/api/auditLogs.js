import axiosServices from './axios';

export const getAuditLogs = async (search = '', page = 1, pageSize = 10) => {
  const response = await axiosServices.get('/AuditLogs', {
    params: {
      search,
      page,
      pageSize
    }
  });
  return response.data;
};
