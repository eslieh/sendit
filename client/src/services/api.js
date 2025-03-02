import axios from 'axios';

// Base URL for your API
const API_BASE_URL = 'http://127.0.0.1:5000'; // Change to your actual backend URL

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to get the access token from sessionStorage
const getToken = () => sessionStorage.getItem('access_token');

// Generic functions for different HTTP methods
const api = {
  get: async (endpoint, params = {}) => {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await apiClient.get(endpoint, { params, headers });
      return response.data;
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error.response?.data || error.message);
      throw error;
    }
  },

  post: async (endpoint, data) => {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await apiClient.post(endpoint, data, { headers });
      return response.data;
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error.response?.data || error.message);
      throw error;
    }
  },

  patch: async (endpoint, data) => {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await apiClient.patch(endpoint, data, { headers });
      return response.data;
    } catch (error) {
      console.error(`PATCH ${endpoint} failed:`, error.response?.data || error.message);
      throw error;
    }
  },

  delete: async (endpoint) => {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await apiClient.delete(endpoint, { headers });
      return response.data;
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error.response?.data || error.message);
      throw error;
    }
  },
};

export default api;
