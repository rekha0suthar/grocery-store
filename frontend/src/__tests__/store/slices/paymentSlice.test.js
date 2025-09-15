import paymentReducer, {
  selectPaymentMethod
} from '../../../store/slices/paymentSlice.js';

// Mock the payment validation import
jest.mock('@grocery-store/core/contracts/payment.validation.js', () => ({
  getEnabledPaymentMethods: () => [
    {
      id: 'credit_card',
      name: 'Credit/Debit Card',
      description: 'Pay with your credit or debit card',
      icon: 'credit-card',
      enabled: true,
      requiresCardDetails: true,
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay securely with PayPal',
      icon: 'paypal',
      enabled: true,
      requiresCardDetails: false,
    },
    {
      id: 'cash_on_delivery',
      name: 'Cash on Delivery',
      description: 'Pay when your order arrives',
      icon: 'truck',
      enabled: true,
      requiresCardDetails: false,
    },
  ]
}));

describe('paymentSlice', () => {
  const initialState = {
    methods: [
      {
        id: 'credit_card',
        name: 'Credit/Debit Card',
        description: 'Pay with your credit or debit card',
        icon: 'credit-card',
        enabled: true,
        requiresCardDetails: true,
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Pay securely with PayPal',
        icon: 'paypal',
        enabled: true,
        requiresCardDetails: false,
      },
      {
        id: 'cash_on_delivery',
        name: 'Cash on Delivery',
        description: 'Pay when your order arrives',
        icon: 'truck',
        enabled: true,
        requiresCardDetails: false,
      },
    ],
    selectedMethod: null,
    loading: false,
    error: null
  };

  it('should return the initial state', () => {
    expect(paymentReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle selectPaymentMethod', () => {
    const method = 'credit_card';
    const actual = paymentReducer(initialState, selectPaymentMethod(method));
    expect(actual.selectedMethod).toEqual(method);
    expect(actual.methods).toEqual(initialState.methods); // methods should remain unchanged
  });

  it('should handle selectPaymentMethod with different method', () => {
    const method = 'paypal';
    const actual = paymentReducer(initialState, selectPaymentMethod(method));
    expect(actual.selectedMethod).toEqual(method);
  });

  it('should handle selectPaymentMethod with null', () => {
    const stateWithMethod = { ...initialState, selectedMethod: 'credit_card' };
    const actual = paymentReducer(stateWithMethod, selectPaymentMethod(null));
    expect(actual.selectedMethod).toBeNull();
  });

  it('should preserve other state when selecting payment method', () => {
    const stateWithChanges = { 
      ...initialState, 
      loading: true, 
      error: 'Some error' 
    };
    const actual = paymentReducer(stateWithChanges, selectPaymentMethod('paypal'));
    expect(actual.selectedMethod).toEqual('paypal');
    expect(actual.loading).toBe(true);
    expect(actual.error).toBe('Some error');
    expect(actual.methods).toEqual(initialState.methods);
  });
});
