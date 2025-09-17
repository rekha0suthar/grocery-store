import React from 'react';
import Card from './UI/Card.jsx';
import AddressSelector from './AddressSelector.jsx';
import AddressFormFields from './AddressFormFields.jsx';
import { MapPin } from 'lucide-react';

const AddressSection = ({
  useSavedAddress,
  addresses,
  addressesLoading,
  selectedAddressId,
  formData,
  validationErrors,
  handleInputChange,
  handleAddressSelect,
  handleUseSavedAddressChange,
  handleAddNewAddress
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <MapPin className="w-5 h-5 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-900">Shipping Information</h2>
      </div>

      {/* Use Saved Address Toggle */}
      {addresses && addresses.length > 0 && (
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="useSavedAddress"
            checked={useSavedAddress}
            onChange={handleUseSavedAddressChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="useSavedAddress" className="text-sm font-medium text-gray-700">
            Use saved address from previous orders
          </label>
        </div>
      )}

      {/* Address Selection or Form */}
      {useSavedAddress ? (
        <div>
          {addressesLoading ? (
            <Card className="p-6 text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </Card>
          ) : (
            <AddressSelector
              addresses={addresses || []}
              selectedAddressId={selectedAddressId}
              onAddressSelect={handleAddressSelect}
              onAddNew={handleAddNewAddress}
            />
          )}
        </div>
      ) : (
        <Card className="p-6">
          <AddressFormFields
            formData={formData}
            validationErrors={validationErrors}
            handleInputChange={handleInputChange}
          />
        </Card>
      )}
    </div>
  );
};

export default AddressSection;
