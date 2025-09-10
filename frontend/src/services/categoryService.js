import api from './api.js';

export const categoryService = {
  async getCategories(params = {}) {
    const response = await api.get('/categories', { params });
    return response;
  },

  async getCategoryTree() {
    const response = await api.get('/categories/tree');
    return response;
  },

  async getCategoryById(id) {
    const response = await api.get(`/categories/${id}`);
    return response;
  },

  async createCategory(categoryData) {
    const response = await api.post('/categories', categoryData);
    return response;
  },

  async updateCategory(id, categoryData) {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response;
  },

  async deleteCategory(id) {
    const response = await api.delete(`/categories/${id}`);
    return response;
  },
};
