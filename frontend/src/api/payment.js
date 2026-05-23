import client from './client';

export const processPayment = async (orderId, method, amount) => {
  const response = await client.post('/payment/process', { 
    order_id: orderId, 
    method, 
    amount 
  });
  return response.data;
};
