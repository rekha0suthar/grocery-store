import React from 'react';
import Input from './UI/Input.jsx';
import { AlertCircle } from 'lucide-react';

const AddressFormFields = ({ 
  formData, 
  validationErrors, 
  handleInputChange 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          First Name *
        </label>
        <Input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          required
          className={validationErrors.firstName ? 'border-red-500' : ''}
        />
        {validationErrors.firstName && (
          <p className="text-red-500 text-xs mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {validationErrors.firstName}
          </p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Last Name *
        </label>
        <Input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          required
          className={validationErrors.lastName ? 'border-red-500' : ''}
        />
        {validationErrors.lastName && (
          <p className="text-red-500 text-xs mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {validationErrors.lastName}
          </p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email *
        </label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className={validationErrors.email ? 'border-red-500' : ''}
        />
        {validationErrors.email && (
          <p className="text-red-500 text-xs mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {validationErrors.email}
          </p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone *
        </label>
        <Input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          required
          className={validationErrors.phone ? 'border-red-500' : ''}
        />
        {validationErrors.phone && (
          <p className="text-red-500 text-xs mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {validationErrors.phone}
          </p>
        )}
      </div>
      
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address *
        </label>
        <Input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          required
          className={validationErrors.address ? 'border-red-500' : ''}
        />
        {validationErrors.address && (
          <p className="text-red-500 text-xs mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {validationErrors.address}
          </p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          City *
        </label>
        <Input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          required
          className={validationErrors.city ? 'border-red-500' : ''}
        />
        {validationErrors.city && (
          <p className="text-red-500 text-xs mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {validationErrors.city}
          </p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          State *
        </label>
        <Input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleInputChange}
          required
          className={validationErrors.state ? 'border-red-500' : ''}
        />
        {validationErrors.state && (
          <p className="text-red-500 text-xs mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {validationErrors.state}
          </p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ZIP Code *
        </label>
        <Input
          type="text"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleInputChange}
          required
          className={validationErrors.zipCode ? 'border-red-500' : ''}
        />
        {validationErrors.zipCode && (
          <p className="text-red-500 text-xs mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {validationErrors.zipCode}
          </p>
        )}
      </div>
    </div>
  );
};

export default AddressFormFields;
