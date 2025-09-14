import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux.js';
import { selectAddress, deleteAddress, setDefaultAddress } from '../store/slices/addressSlice.js';
import Card from './UI/Card.jsx';
import Button from './UI/Button.jsx';
import { 
  MapPin, 
  Edit, 
  Trash2, 
  Plus, 
  Check,
  Star,
  Clock
} from 'lucide-react';

const AddressSelector = ({ onAddressSelect, onAddNew, selectedAddressId }) => {
  const dispatch = useAppDispatch();
  const { addresses, loading } = useAppSelector((state) => state.addresses);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleSelectAddress = (address) => {
    dispatch(selectAddress(address.id));
    onAddressSelect(address);
  };

  const handleDeleteAddress = (addressId) => {
    dispatch(deleteAddress(addressId));
    setShowDeleteConfirm(null);
  };

  const handleSetDefault = (addressId, e) => {
    e.stopPropagation();
    dispatch(setDefaultAddress(addressId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Saved Addresses ({addresses?.length || 0})
        </h3>
        <Button
          onClick={onAddNew}
          variant="outline"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Address
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : !addresses || addresses.length === 0 ? (
        <Card className="p-6 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No saved addresses</h4>
          <p className="text-gray-500 mb-4">Your addresses from previous orders will appear here</p>
          <Button onClick={onAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Address
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card 
              key={address.id} 
              className={`p-4 cursor-pointer transition-all ${
                selectedAddressId === address.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleSelectAddress(address)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                  <h4 className="font-medium text-gray-900">
                    {address.firstName} {address.lastName}
                  </h4>
                  {address.isDefault && (
                    <Star className="w-4 h-4 text-yellow-500 ml-2" />
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {address.isDefault && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                  
                  {address.source === 'order' && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      From Order
                    </span>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!address.isDefault) {
                        handleSetDefault(address.id, e);
                      }
                    }}
                    className={`p-1 rounded ${
                      address.isDefault 
                        ? 'text-yellow-500' 
                        : 'text-gray-400 hover:text-yellow-500'
                    }`}
                    disabled={address.isDefault}
                    title={address.isDefault ? 'Default address' : 'Set as default'}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(address.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p>{address.address}</p>
                <p>{address.city}, {address.state} {address.zipCode}</p>
                <p>{address.phone}</p>
                <p>{address.email}</p>
                {address.lastUsed && (
                  <p className="text-xs text-gray-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Last used: {new Date(address.lastUsed).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              {selectedAddressId === address.id && (
                <div className="mt-3 flex items-center text-blue-600">
                  <Check className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Selected</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Address</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this address? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowDeleteConfirm(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteAddress(showDeleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
 