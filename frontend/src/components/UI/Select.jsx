import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const Select = forwardRef(({
  options = [],
  placeholder,
  error,
  helpText,
  label,
  required,
  className,
  children,
  onChange,
  ...props
}, ref) => {
  const renderOption = (option) => {
    if (typeof option === 'string') {
      return option;
    }
    
    if (typeof option === 'object') {
      if (option.label) {
        if (typeof option.label === 'function') {
          return option.label();
        }
        if (Array.isArray(option.label)) {
          return option.label.join(' ');
        }
        if (typeof option.label === 'object' && typeof option.label.toString === 'function') {
          return option.label.toString();
        }
        return option.label;
      }
      if (typeof option.toString === 'function') {
        return option.toString();
      }
      return String(option);
    }
    
    return String(option);
  };

  const handleChange = (e) => {
    if (onChange) {
      const value = e.target ? e.target.value : e;
      onChange(value);
    }
    
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={clsx(
          'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300',
          props.disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onChange={handleChange}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => (
          <option key={option.value || index} value={option.value || option}>
            {renderOption(option)}
          </option>
        ))}
        {children}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
