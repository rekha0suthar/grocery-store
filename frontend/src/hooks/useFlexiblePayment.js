import { useState, useEffect } from 'react';
import { paymentService } from '../services/paymentService.js';

export const useFlexiblePayment = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [methodFields, setMethodFields] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [availableMethods, setAvailableMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load payment methods on mount
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentService.getPaymentMethods();
      setAvailableMethods(response.data.methods || []);
      
      // Auto-select first method if available
      if (response.data.methods && response.data.methods.length > 0) {
        setSelectedMethod(response.data.methods[0]);
        setMethodFields({});
      }
    } catch (err) {
      // console.error('Error loading payment methods:', err);
      setError('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleMethodChange = (method) => {
    setSelectedMethod(method);
    setMethodFields({});
    setFieldErrors({});
  };

  const handleFieldChange = (fieldName, value) => {
    setMethodFields(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
  };

  const validateFields = () => {
    if (!selectedMethod) {
      return { isValid: false, errors: { method: 'Please select a payment method' } };
    }

    const errors = {};
    const fields = selectedMethod.fields || [];

    fields.forEach(field => {
      const value = methodFields[field.name];
      
      if (field.required && (!value || value.trim() === '')) {
        errors[field.name] = `${field.label} is required`;
      } else if (value && field.pattern) {
        const regex = new RegExp(field.pattern);
        if (!regex.test(value)) {
          errors[field.name] = `${field.label} format is invalid`;
        }
      }
    });

    setFieldErrors(errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const processPayment = async (orderData) => {
    setLoading(true);
    setError(null);

    const response = await paymentService.processPayment({
      methodId: selectedMethod.id,
      amount: orderData.amount,
      currency: orderData.currency || 'USD',
      fields: methodFields,
      orderId: orderData.orderId,
      metadata: {
        ...orderData.metadata,
        paymentMethod: selectedMethod.displayName
      }
    });

    setLoading(false);
    return response.data.result;
  };

  const capturePayment = async (intentId, amount, currency = 'USD') => {
    setLoading(true);
    const response = await paymentService.capturePayment({
      intentId,
      amount,
      currency
    });
    setLoading(false);
    return response.data.result;
  };

  const refundPayment = async (paymentId, amount, currency = 'USD', reason = 'Refund requested') => {
    setLoading(true);
    const response = await paymentService.refundPayment({
      paymentId,
      amount,
      currency,
      reason
    });
    setLoading(false);
    return response.data.result;
  };

  const reset = () => {
    setSelectedMethod(null);
    setMethodFields({});
    setFieldErrors({});
    setError(null);
  };

  return {
    selectedMethod,
    methodFields,
    fieldErrors,
    availableMethods,
    loading,
    error,
    handleMethodChange,
    handleFieldChange,
    validateFields,
    processPayment,
    capturePayment,
    refundPayment,
    reset
  };
};
