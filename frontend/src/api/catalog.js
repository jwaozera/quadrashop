import client from './client';

export const getProducts = async () => {
  const response = await client.get('/catalog/products');
  return response.data;
};

export const getProduct = async (id) => {
  const response = await client.get(`/catalog/products/${id}`);
  return response.data;
};

export const searchProducts = async (query) => {
  const response = await client.get(`/catalog/products?search=${encodeURIComponent(query)}`);
  return response.data;
};
