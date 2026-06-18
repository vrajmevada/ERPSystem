import axiosServices from './axios';

export const getIndents = async (search = '', page = 1, pageSize = 10) => {
  const response = await axiosServices.get('/indents', {
    params: { search, page, pageSize }
  });
  return response.data;
};

export const getIndentById = async (id) => {
  const response = await axiosServices.get(`/indents/${id}`);
  return response.data;
};

export const createIndent = async (indent) => {
  const response = await axiosServices.post('/indents', indent);
  return response.data;
};

export const approveIndent = async (id) => {
  const response = await axiosServices.put(`/indents/${id}/approve`);
  return response.data;
};

export const disapproveIndent = async (id) => {
  const response = await axiosServices.put(`/indents/${id}/disapprove`);
  return response.data;
};

export const deleteIndent = async (id) => {
  const response = await axiosServices.delete(`/indents/${id}`);
  return response.data;
};

export const shortCloseIndent = async (id, dto) => {
  const response = await axiosServices.put(`/indents/${id}/short-close`, dto);
  return response.data;
};
