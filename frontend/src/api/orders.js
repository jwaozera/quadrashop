import client from "./client";

export const getCart = async () => {
  const response = await client.get("/orders/cart");
  return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
  const response = await client.post("/orders/cart", {
    product_id: productId,
    quantity,
  });
  return response.data;
};

export const updateCartItem = async (itemId, quantity) => {
  const response = await client.patch(`/orders/cart/${itemId}`, { quantity });
  return response.data;
};

export const removeCartItem = async (itemId) => {
  const response = await client.delete(`/orders/cart/${itemId}`);
  return response.data;
};

export const checkout = async (
  shippingAddress,
  paymentMethod,
  items,
  total,
) => {
  const response = await client.post("/orders/checkout", {
    items,
    total,
    payment_method: paymentMethod,
    address: { full: shippingAddress },
  });
  return response.data;
};

export const getOrders = async () => {
  const response = await client.get("/orders");
  return response.data;
};

export const getOrder = async (id) => {
  const response = await client.get(`/orders/${id}`);
  return response.data;
};
