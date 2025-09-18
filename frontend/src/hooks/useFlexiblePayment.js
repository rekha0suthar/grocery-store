import { useState, useEffect, useCallback } from 'react';
import { paymentService } from '../services/paymentService.js';
import { PaymentFieldValidator } from '@grocery-store/core/validation/PaymentFieldValidator.js';

export const useFlexiblePayment = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [methodFields, setMethodFields] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [availableMethods, setAvailableMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load payment methods on mount
  useEffect(() => {
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

    loadPaymentMethods();
  }, []);

  const handleMethodChange = (method) => {
    setSelectedMethod(method);
    setMethodFields({});
    setFieldErrors({});
  };

  // Real-time validation using core validation system
  const validateField = (fieldName, value) => {
    if (!selectedMethod) return null;

    const field = selectedMethod.fields?.find(f => f.name === fieldName);
    if (!field) return null;

    // Use core validation system
    return PaymentFieldValidator.validateField(field, value);
  };

  const handleFieldChange = (fieldName, value) => {
    // Update the field value first
    setMethodFields(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Then validate the formatted value
    const error = validateField(fieldName, value);
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const validateFields = () => {
    if (!selectedMethod) {
      return { isValid: false, errors: { method: 'Please select a payment method' } };
    }

    const errors = {};
    const fields = selectedMethod.fields || [];

    fields.forEach(field => {
      const value = methodFields[field.name];
      const error = PaymentFieldValidator.validateField(field, value);
      if (error) {
        errors[field.name] = error;
      }
    });

    setFieldErrors(errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const processPayment = async (orderData) => {
    setLoading(true);
    setError(null);

    try {
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
      
      // Return the response directly (paymentService already returns response.data)
      return response;
    } catch (error) {
      setLoading(false);
      throw error;
    }
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

  // Fixed: Use useCallback to memoize the reset function
  const reset = useCallback(() => {
    setSelectedMethod(null);
    setMethodFields({});
    setFieldErrors({});
    setError(null);
  }, []);

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
