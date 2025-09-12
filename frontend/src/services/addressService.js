import api from './api.js';

export const addressService = {
  async getUserAddresses() {
    try {
      const response = await api.get('/addresses');
      return response;
    } catch (error) {
      // If 404, return empty array instead of throwing
      if (error.response?.status === 404) {
        return { data: [] };
      }
      throw error;
    }
  },

  async saveAddress(addressData) {
    const response = await api.post('/addresses', addressData);
    return response;
  },

  async updateAddress(id, addressData) {
    const response = await api.put(`/addresses/${id}`, addressData);
    return response;
  },

  async deleteAddress(id) {
    const response = await api.delete(`/addresses/${id}`);
    return response;
  },

  async setDefaultAddress(id) {
    const response = await api.put(`/addresses/${id}/default`);
    return response;
  }
}; 