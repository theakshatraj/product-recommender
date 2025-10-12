/**
 * API Service for Product Recommender
 * Handles all API calls to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Product API calls
export async function getProducts() {
  return fetchAPI('/products');
}

export async function getProduct(id) {
  return fetchAPI(`/products/${id}`);
}

export async function createProduct(productData) {
  return fetchAPI('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
}

// Recommendation API calls
export async function getUserRecommendations(userId, limit = 5) {
  return fetchAPI(`/recommendations/user/${userId}?limit=${limit}`);
}

export async function getSimilarProducts(productId, limit = 5) {
  return fetchAPI(`/recommendations/product/${productId}?limit=${limit}`);
}

// User API calls
export async function getUser(userId) {
  return fetchAPI(`/users/${userId}`);
}

export async function createUser(userData) {
  return fetchAPI('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

