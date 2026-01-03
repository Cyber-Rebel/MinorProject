import axios from 'axios';
import { API_BASE_URLS } from './config';

// Seller Dashboard API instance
const sellerApi = axios.create({
  baseURL: API_BASE_URLS.SELLER_DASHBOARD,
  withCredentials: true,
});

// Product API instance
const productApi = axios.create({
  baseURL: API_BASE_URLS.PRODUCT,
  withCredentials: true,
});

// Seller Dashboard API calls
export const sellerAPI = {
  // Get dashboard metrics
  getMetrics: async () => {
    const response = await sellerApi.get('/api/seller/dashbord/matrics');
    return response.data;
  },

  // Get seller's orders
  getOrders: async (page = 1, limit = 10) => {
    const response = await sellerApi.get(`/api/seller/dashbord/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get single order details
  getOrderById: async (orderId) => {
    const response = await sellerApi.get(`/api/seller/dashbord/orders/${orderId}`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    const response = await sellerApi.patch(`/api/seller/dashbord/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Get seller's products from dashboard
  getProducts: async () => {
    const response = await sellerApi.get('/api/seller/dashbord/products');
    return response.data;
  },
};

// Product API calls for seller
export const productAPI = {
  // Get all seller's products
  getSellerProducts: async () => {
    const response = await productApi.get('/api/products/seller');
    return response.data;
  },

  // Create a new product
  createProduct: async (formData) => {
    const response = await productApi.post('/api/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update a product
  updateProduct: async (id, productData) => {
    const response = await productApi.patch(`/api/products/${id}`, productData);
    return response.data;
  },

  // Delete a product
  deleteProduct: async (id) => {
    const response = await productApi.delete(`/api/products/${id}`);
    return response.data;
  },

  // Get product by ID
  getProductById: async (id) => {
    const response = await productApi.get(`/api/products/${id}`);
    return response.data;
  },
};

export default { sellerAPI, productAPI };
