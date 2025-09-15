import addressReducer, { 
  fetchUserAddresses, 
  saveAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress,
  selectAddress,
  clearSelectedAddress,
  clearError
} from '../../../store/slices/addressSlice.js';

// Mock the address service
jest.mock('../../../services/addressService.js', () => ({
  addressService: {
    getUserAddresses: jest.fn(),
    saveAddress: jest.fn(),
    updateAddress: jest.fn(),
    deleteAddress: jest.fn(),
    setDefaultAddress: jest.fn(),
  },
}));

describe('Address Slice', () => {
  const initialState = {
    addresses: [],
    selectedAddressId: null,
    loading: false,
    error: null,
  };

  const mockAddress = {
    id: '1',
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    isDefault: false,
  };

  it('should return the initial state', () => {
    expect(addressReducer(undefined, {})).toEqual(initialState);
  });

  describe('reducers', () => {
    it('should handle selectAddress', () => {
      const action = selectAddress('1');
      const newState = addressReducer(initialState, action);
      expect(newState.selectedAddressId).toBe('1');
    });

    it('should handle clearSelectedAddress', () => {
      const stateWithSelection = { ...initialState, selectedAddressId: '1' };
      const action = clearSelectedAddress();
      const newState = addressReducer(stateWithSelection, action);
      expect(newState.selectedAddressId).toBeNull();
    });

    it('should handle clearError', () => {
      const stateWithError = { ...initialState, error: 'Some error' };
      const action = clearError();
      const newState = addressReducer(stateWithError, action);
      expect(newState.error).toBeNull();
    });
  });

  describe('async thunks', () => {
    it('should handle fetchUserAddresses.pending', () => {
      const action = { type: fetchUserAddresses.pending.type };
      const newState = addressReducer(initialState, action);
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle fetchUserAddresses.fulfilled', () => {
      const addresses = [mockAddress];
      const action = { 
        type: fetchUserAddresses.fulfilled.type, 
        payload: { data: addresses } 
      };
      const newState = addressReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.addresses).toEqual(addresses);
      expect(newState.error).toBeNull();
    });

    it('should handle fetchUserAddresses.rejected', () => {
      const error = 'Failed to fetch addresses';
      const action = { 
        type: fetchUserAddresses.rejected.type, 
        payload: error 
      };
      const newState = addressReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(error);
    });

    it('should handle saveAddress.fulfilled', () => {
      const action = { 
        type: saveAddress.fulfilled.type, 
        payload: mockAddress 
      };
      const newState = addressReducer(initialState, action);
      expect(newState.addresses).toContain(mockAddress);
    });

    it('should handle updateAddress.fulfilled', () => {
      const stateWithAddress = { 
        ...initialState, 
        addresses: [mockAddress] 
      };
      const updatedAddress = { ...mockAddress, street: '456 Oak St' };
      const action = { 
        type: updateAddress.fulfilled.type, 
        payload: updatedAddress 
      };
      const newState = addressReducer(stateWithAddress, action);
      expect(newState.addresses[0].street).toBe('456 Oak St');
    });

    it('should handle deleteAddress.fulfilled', () => {
      const stateWithAddress = { 
        ...initialState, 
        addresses: [mockAddress] 
      };
      const action = { 
        type: deleteAddress.fulfilled.type, 
        payload: '1' 
      };
      const newState = addressReducer(stateWithAddress, action);
      expect(newState.addresses).toHaveLength(0);
    });

    it('should clear selectedAddressId when deleting selected address', () => {
      const stateWithSelection = { 
        ...initialState, 
        addresses: [mockAddress],
        selectedAddressId: '1'
      };
      const action = { 
        type: deleteAddress.fulfilled.type, 
        payload: '1' 
      };
      const newState = addressReducer(stateWithSelection, action);
      expect(newState.selectedAddressId).toBeNull();
    });

    it('should handle setDefaultAddress.fulfilled', () => {
      const addresses = [
        { ...mockAddress, id: '1', isDefault: true },
        { ...mockAddress, id: '2', isDefault: false }
      ];
      const stateWithAddresses = { 
        ...initialState, 
        addresses 
      };
      const action = { 
        type: setDefaultAddress.fulfilled.type, 
        payload: '2' 
      };
      const newState = addressReducer(stateWithAddresses, action);
      expect(newState.addresses[0].isDefault).toBe(false);
      expect(newState.addresses[1].isDefault).toBe(true);
    });
  });
});
