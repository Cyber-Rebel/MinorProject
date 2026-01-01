// API Base URLs for all backend services
export const API_BASE_URLS = {
  AUTH: 'http://localhost:3000/api',
  PRODUCT: 'http://localhost:3001/api',
  CART: 'http://localhost:3002/api',
  ORDER: 'http://localhost:3004/api',
  // AI buddy backend (socket server)
  AI_BUDDY: 'http://localhost:3005',
};

// Default axios config
export const axiosConfig = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
};
