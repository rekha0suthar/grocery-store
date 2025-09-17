import React, { useEffect, useState } from 'react';
import { paymentService } from '../services/paymentService.js';
import { CreditCard, Truck, Smartphone, Apple, DollarSign } from 'lucide-react';

const PaymentMethodPicker = ({ value, onChange, className = '' }) => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getPaymentMethods();
      setMethods(response.data.methods || []);
    } catch (err) {
      setError('Failed to load payment methods');
      // console.error('Error loading payment methods:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (methodId) => {
    const iconMap = {
      'credit_card': CreditCard,
      'cash_on_delivery': Truck,
      'upi': Smartphone,
      'apple_pay': Apple,
      'google_pay': DollarSign,
      'paypal': DollarSign,
      'stripe': CreditCard,
      'razorpay': DollarSign
    };
    
    const IconComponent = iconMap[methodId] || CreditCard;
    return <IconComponent className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Payment Method
      </label>
      <div className="space-y-2">
        {methods.map(method => (
          <label
            key={method.id}
            className={`
              flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors
              ${value === method.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <input
              type="radio"
              name="payment_method"
              value={method.id}
              checked={value === method.id}
              onChange={() => onChange(method)}
              className="sr-only"
            />
            <div className="flex-shrink-0">
              {getMethodIcon(method.id)}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                {method.displayName}
              </div>
              {method.description && (
                <div className="text-sm text-gray-500">
                  {method.description}
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              <div className={`
                w-4 h-4 rounded-full border-2 flex items-center justify-center
                ${value === method.id 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300'
                }
              `}>
                {value === method.id && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodPicker;
