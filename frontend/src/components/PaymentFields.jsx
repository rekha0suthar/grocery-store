import React from 'react';
import Input from './UI/Input.jsx';
import Select from './UI/Select.jsx';

const PaymentFields = ({ contract, values, onChange, errors = {} }) => {
  // Add comprehensive null/undefined checks
  if (!contract) {
    return null;
  }

  if (!contract.fields) {
    return null;
  }

  if (!Array.isArray(contract.fields)) {
    return null;
  }

  if (contract.fields.length === 0) {
    return null;
  }

  const handleFieldChange = (fieldName, value) => {
    onChange(fieldName, value);
  };

  // Auto-format card number with spaces every 4 digits
  const formatCardNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 16 digits
    const limitedDigits = digits.substring(0, 16);
    
    // Add spaces every 4 digits
    return limitedDigits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // Auto-format expiry date (MM/YY)
  const formatExpiryDate = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 4 digits
    const limitedDigits = digits.substring(0, 4);
    
    // Add slash after 2 digits
    if (limitedDigits.length >= 2) {
      return `${limitedDigits.substring(0, 2)}/${limitedDigits.substring(2)}`;
    }
    
    return limitedDigits;
  };

  // Auto-format CVV (limit to 4 digits)
  const formatCVV = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 4 digits
    return digits.substring(0, 4);
  };

  // Format cardholder name (letters, spaces, hyphens, apostrophes only)
  const formatCardholderName = (value) => {
    // Remove any characters that aren't letters, spaces, hyphens, or apostrophes
    return value.replace(/[^a-zA-Z\s\-']/g, '');
  };

  // Get user-friendly format message for each field
  const getFormatMessage = (fieldName) => {
    switch (fieldName) {
      case 'cardNumber':
        return 'Enter 13-19 digits with spaces (e.g., 4111 1111 1111 1111)';
      case 'expiry':
        return 'Enter month and year (e.g., 12/25)';
      case 'cvv':
        return 'Enter 3-4 digits (e.g., 123)';
      case 'cardholder':
        return 'Enter full name (letters and spaces only)';
      case 'upiId':
        return 'Enter UPI ID (e.g., username@bankname)';
      default:
        return null;
    }
  };

  // Handle special formatting for payment fields
  const handlePaymentFieldChange = (fieldName, value, _field) => {
    let formattedValue = value;

    // Apply specific formatting based on field name
    switch (fieldName) {
      case 'cardNumber':
        formattedValue = formatCardNumber(value);
        break;
      case 'expiry':
        formattedValue = formatExpiryDate(value);
        break;
      case 'cvv':
        formattedValue = formatCVV(value);
        break;
      case 'cardholder':
        formattedValue = formatCardholderName(value);
        break;
      default:
        formattedValue = value;
    }

    // Call the parent onChange with formatted value
    handleFieldChange(fieldName, formattedValue);
  };

  const renderField = (field) => {
    const fieldValue = values[field.name] || '';
    const fieldError = errors[field.name];

    const commonProps = {
      value: fieldValue,
      onChange: (e) => handlePaymentFieldChange(field.name, e.target.value, field),
      placeholder: field.placeholder || '',
      required: field.required,
      className: `w-full ${fieldError ? 'border-red-500' : ''}`,
      maxLength: field.maxLength
    };

    // Special handling for card number field
    if (field.name === 'cardNumber') {
      return (
        <Input
          {...commonProps}
          type="text"
          inputMode="numeric"
          pattern="[0-9\s]*"
          placeholder="4111 1111 1111 1111"
          maxLength={23} // 19 digits + 4 spaces
        />
      );
    }

    // Special handling for expiry field
    if (field.name === 'expiry') {
      return (
        <Input
          {...commonProps}
          type="text"
          inputMode="numeric"
          pattern="[0-9\/]*"
          placeholder="MM/YY"
          maxLength={5} // MM/YY format
        />
      );
    }

    // Special handling for CVV field
    if (field.name === 'cvv') {
      return (
        <Input
          {...commonProps}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="123"
          maxLength={4}
        />
      );
    }

    // Special handling for cardholder name field
    if (field.name === 'cardholder') {
      return (
        <Input
          {...commonProps}
          type="text"
          pattern="[a-zA-Z\s]*"
          placeholder="John Doe"
          maxLength={50}
        />
      );
    }

    switch (field.type) {
      case 'select':
        return (
          <Select {...commonProps}>
            <option value="">Select...</option>
            {(field.options || []).map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );

      case 'email':
        return (
          <Input
            {...commonProps}
            type="email"
            autoComplete="email"
          />
        );

      case 'phone':
        return (
          <Input
            {...commonProps}
            type="tel"
            autoComplete="tel"
          />
        );

      case 'password':
        return (
          <Input
            {...commonProps}
            type="password"
            autoComplete="new-password"
          />
        );

      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            min={field.minLength}
            max={field.maxLength}
          />
        );

      case 'hidden':
        return (
          <input
            {...commonProps}
            type="hidden"
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            type="text"
            pattern={field.pattern}
            maxLength={field.maxLength}
            minLength={field.minLength}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        Payment Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contract.fields.map(field => (
          <div 
            key={field.name} 
            className={field.type === 'hidden' ? 'hidden' : 'col-span-1'}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
            {/* Show user-friendly format message instead of regex pattern */}
            {getFormatMessage(field.name) && (
              <p className="text-xs text-gray-500 mt-1">
                {getFormatMessage(field.name)}
              </p>
            )}
            {errors[field.name] && (
              <p className="text-sm text-red-600 mt-1">
                {errors[field.name]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentFields;
