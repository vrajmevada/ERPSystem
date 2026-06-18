import axiosServices from './axios';

export const getGoodsReceiptNotes = async (search = '', page = 1, pageSize = 10) => {
  const response = await axiosServices.get('/goodsreceiptnotes', {
    params: { search, page, pageSize }
  });
  return response.data;
};

export const getGoodsReceiptNoteById = async (id) => {
  const response = await axiosServices.get(`/goodsreceiptnotes/${id}`);
  return response.data;
};

export const createGoodsReceiptNote = async (grn) => {
  const response = await axiosServices.post('/goodsreceiptnotes', grn);
  return response.data;
};

export const approveGoodsReceiptNote = async (id) => {
  const response = await axiosServices.put(`/goodsreceiptnotes/${id}/approve`);
  return response.data;
};
