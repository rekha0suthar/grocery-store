import React from 'react';
import Input from './UI/Input.jsx';
import Select from './UI/Select.jsx';

const PaymentFields = ({ contract, values, onChange, errors = {} }) => {
  if (!contract || !contract.fields || contract.fields.length === 0) {
    return null;
  }

  const handleFieldChange = (fieldName, value) => {
    onChange(fieldName, value);
  };

  const renderField = (field) => {
    const fieldValue = values[field.name] || '';
    const fieldError = errors[field.name];

    const commonProps = {
      value: fieldValue,
      onChange: (e) => handleFieldChange(field.name, e.target.value),
      placeholder: field.placeholder || '',
      required: field.required,
      className: `w-full ${fieldError ? 'border-red-500' : ''}`
    };

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
            {field.pattern && (
              <p className="text-xs text-gray-500 mt-1">
                Format: {field.pattern}
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
