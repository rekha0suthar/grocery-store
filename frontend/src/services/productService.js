import api from './api.js';

export const productService = {
  async getProducts(params = {}) {
    const response = await api.get('/products', { params });
    return response;
  },

  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    return response;
  },

  async searchProducts(searchParams) {
    const response = await api.get('/products/search', { params: searchParams });
    return response;
  },

  async createProduct(productData) {
    const response = await api.post('/products', productData);
    return response;
  },

  async updateProduct(id, productData) {
    const response = await api.put(`/products/${id}`, productData);
    return response;
  },

  async updateStock(id, stockData) {
    const response = await api.patch(`/products/${id}/stock`, stockData);
    return response;
  },

  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response;
  },

  async getProductsByCategory(categoryId, params = {}) {
    const response = await api.get(`/products/category/${categoryId}`, { params });
    return response;
  },
};
