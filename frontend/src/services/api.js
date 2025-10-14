/**
 * API Service for Product Recommender
 * Handles all API calls to the backend using Axios
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API call failed:', error);
    if (error.response) {
      // Server responded with error status
      throw new Error(`API Error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network Error: No response from server');
    } else {
      // Something else happened
      throw new Error(`Request Error: ${error.message}`);
    }
  }
);

// Product API calls
export async function getProducts() {
  return api.get('/products');
}

export async function getProduct(id) {
  return api.get(`/products/${id}`);
}

export async function createProduct(productData) {
  return api.post('/products', productData);
}

// Recommendation API calls
export async function getUserRecommendations(userId, limit = 5) {
  return api.get(`/recommendations/user/${userId}`, {
    params: { limit }
  });
}

export async function getDetailedRecommendations(userId, limit = 10) {
  return api.get(`/recommendations/user/${userId}/detailed`, {
    params: { limit }
  });
}

export async function getSimilarProducts(productId, limit = 5) {
  return api.get(`/recommendations/product/${productId}`, {
    params: { limit }
  });
}

export async function getRecommendationExplanation(userId, productId) {
  return api.get(`/recommendations/explain/${userId}/${productId}`);
}

// User API calls
export async function getUsers() {
  return api.get('/users');
}

export async function getUser(userId) {
  return api.get(`/users/${userId}`);
}

export async function createUser(userData) {
  return api.post('/users', userData);
}

// Interaction API calls
export async function recordInteraction(userId, productId, interactionType, rating = null) {
  return api.post('/interactions', {
    user_id: userId,
    product_id: productId,
    interaction_type: interactionType,
    rating: rating
  });
}

// Analytics API calls
export async function getUserAnalytics(userId) {
  return api.get(`/analytics/user/${userId}`);
}

export async function getCategoryHeatmap(userId) {
  return api.get(`/analytics/user/${userId}/categories`);
}

export async function getRecommendationAccuracy(userId) {
  return api.get(`/analytics/user/${userId}/accuracy`);
}

export async function getPopularProducts(limit = 10) {
  return api.get('/analytics/popular', {
    params: { limit }
  });
}

export async function getUserBehaviorTimeline(userId) {
  return api.get(`/analytics/user/${userId}/timeline`);
}

export async function getSystemMetrics() {
  return api.get('/analytics/system');
}

// Export the axios instance for custom requests
export default api;

