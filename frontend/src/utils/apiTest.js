import api from '../services/api.js';
import config from '../config/appConfig.js';

export const testApiConnection = async () => {
  try {
    console.log('🔍 Testing API connection to:', config.API_BASE_URL);
    
    const response = await api.get('/health');
    
    console.log('✅ API Connection Successful:', {
      status: response.status,
      data: response.data,
      url: config.API_BASE_URL,
    });
    
    return {
      success: true,
      data: response.data,
      url: config.API_BASE_URL,
    };
  } catch (error) {
    console.error('❌ API Connection Failed:', {
      url: config.API_BASE_URL,
      error: error.message,
      status: error.response?.status,
    });
    
    return {
      success: false,
      error: error.message,
      url: config.API_BASE_URL,
      status: error.response?.status,
    };
  }
};

export const getApiStatus = () => {
  return {
    baseURL: config.API_BASE_URL,
    environment: config.ENVIRONMENT,
    debug: config.DEBUG,
  };
};

// Test specific endpoints
export const testEndpoints = async () => {
  const endpoints = [
    '/health',
    '/products',
    '/categories',
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint);
      const data = response.data?.data || response.data;
      results.push({
        endpoint,
        status: response.status,
        success: true,
        data: data,
      });
    } catch (error) {
      results.push({
        endpoint,
        status: error.response?.status || 'No response',
        success: false,
        error: error.message,
      });
    }
  }
  
  return results;
};

// Test products endpoint specifically
export const testProductsEndpoint = async () => {
  try {
    const response = await api.get('/products');
    const products = response.data?.data?.products || response.data?.products || [];
    
    console.log('📦 Products Test:', {
      totalProducts: products.length,
      firstProduct: products[0],
      responseStructure: {
        hasData: !!response.data?.data,
        hasProducts: !!response.data?.data?.products,
        directProducts: !!response.data?.products,
      }
    });
    
    return {
      success: true,
      products: products,
      count: products.length,
      responseStructure: response.data,
    };
  } catch (error) {
    console.error('❌ Products Test Failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
