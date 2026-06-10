import axiosServices from './axios';

export async function login(username, password) {
  const response = await axiosServices.post('/auth/login', { username, password });
  return response.data;
}

export async function register(username, password, role) {
  const response = await axiosServices.post('/auth/register', { username, password, role });
  return response.data;
}
