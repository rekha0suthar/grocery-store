import { addressService } from '../../services/addressService.js';

// Mock the api service
jest.mock('../../services/api.js', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }
}));

import api from '../../services/api.js';

describe('addressService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserAddresses', () => {
    it('should fetch user addresses', async () => {
      const mockAddresses = [
        { id: '1', street: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001' },
        { id: '2', street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zipCode: '90210' }
      ];
      api.get.mockResolvedValue({ data: mockAddresses });

      const result = await addressService.getUserAddresses();

      expect(api.get).toHaveBeenCalledWith('/addresses');
      expect(result).toEqual({ data: mockAddresses });
    });

    it('should handle 404 errors by returning empty array', async () => {
      const error = new Error('Not Found');
      error.response = { status: 404 };
      api.get.mockRejectedValue(error);

      const result = await addressService.getUserAddresses();

      expect(result).toEqual({ data: [] });
    });

    it('should handle other API errors', async () => {
      const error = new Error('API Error');
      api.get.mockRejectedValue(error);

      await expect(addressService.getUserAddresses()).rejects.toThrow('API Error');
    });
  });

  describe('saveAddress', () => {
    it('should save a new address', async () => {
      const newAddress = { street: '789 Pine St', city: 'Chicago', state: 'IL', zipCode: '60601' };
      const savedAddress = { id: '3', ...newAddress };
      api.post.mockResolvedValue({ data: savedAddress });

      const result = await addressService.saveAddress(newAddress);

      expect(api.post).toHaveBeenCalledWith('/addresses', newAddress);
      expect(result).toEqual({ data: savedAddress });
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to save address');
      api.post.mockRejectedValue(error);

      await expect(addressService.saveAddress({})).rejects.toThrow('Failed to save address');
    });
  });

  describe('updateAddress', () => {
    it('should update an existing address', async () => {
      const addressId = '1';
      const updatedAddress = { street: 'Updated Street', city: 'Updated City', state: 'NY', zipCode: '10001' };
      const resultAddress = { id: addressId, ...updatedAddress };
      api.put.mockResolvedValue({ data: resultAddress });

      const result = await addressService.updateAddress(addressId, updatedAddress);

      expect(api.put).toHaveBeenCalledWith(`/addresses/${addressId}`, updatedAddress);
      expect(result).toEqual({ data: resultAddress });
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to update address');
      api.put.mockRejectedValue(error);

      await expect(addressService.updateAddress('1', {})).rejects.toThrow('Failed to update address');
    });
  });

  describe('deleteAddress', () => {
    it('should delete an address', async () => {
      api.delete.mockResolvedValue({ data: { success: true } });

      const result = await addressService.deleteAddress('1');

      expect(api.delete).toHaveBeenCalledWith('/addresses/1');
      expect(result).toEqual({ data: { success: true } });
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to delete address');
      api.delete.mockRejectedValue(error);

      await expect(addressService.deleteAddress('1')).rejects.toThrow('Failed to delete address');
    });
  });

  describe('setDefaultAddress', () => {
    it('should set an address as default', async () => {
      api.put.mockResolvedValue({ data: { success: true } });

      const result = await addressService.setDefaultAddress('1');

      expect(api.put).toHaveBeenCalledWith('/addresses/1/default');
      expect(result).toEqual({ data: { success: true } });
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to set default address');
      api.put.mockRejectedValue(error);

      await expect(addressService.setDefaultAddress('1')).rejects.toThrow('Failed to set default address');
    });
  });
});
