import { PAYMENT_METHOD_IDS, PaymentField, PaymentFieldType, PaymentMethodContract } from './payment.contracts.js';

export const CREDIT_CARD_CONTRACT = new PaymentMethodContract({
  id: PAYMENT_METHOD_IDS.CREDIT_CARD,
  displayName: 'Credit/Debit Card',
  description: 'Pay with your credit or debit card',
  icon: 'credit-card',
  requiresOnlineAuth: true,
  fields: [
    new PaymentField({ 
      name: 'cardNumber', 
      type: PaymentFieldType.STRING, 
      label: 'Card Number', 
      pattern: '^[0-9 ]{19}$',
      placeholder: '1234 5678 9012 3456',
      mask: '#### #### #### ####',
      minLength: 19,
      maxLength: 19
    }),
    new PaymentField({ 
      name: 'expiry', 
      type: PaymentFieldType.STRING, 
      label: 'Expiry (MM/YY)', 
      pattern: '^(0[1-9]|1[0-2])\\/\\d{2}$',
      placeholder: 'MM/YY',
      mask: '##/##',
      minLength: 5,
      maxLength: 5
    }),
    new PaymentField({ 
      name: 'cvv', 
      type: PaymentFieldType.STRING, 
      label: 'CVV', 
      pattern: '^\\d{3,4}$',
      placeholder: '123',
      mask: '###',
      minLength: 3,
      maxLength: 4
    }),
    new PaymentField({ 
      name: 'cardholder', 
      type: PaymentFieldType.STRING, 
      label: 'Cardholder Name',
      placeholder: 'John Doe',
      minLength: 2,
      maxLength: 50
    }),
  ],
});

export const COD_CONTRACT = new PaymentMethodContract({
  id: PAYMENT_METHOD_IDS.CASH_ON_DELIVERY,
  displayName: 'Cash on Delivery',
  description: 'Pay when your order arrives',
  icon: 'truck',
  requiresOnlineAuth: false,
  fields: [], // no extra fields
});

export const UPI_CONTRACT = new PaymentMethodContract({
  id: PAYMENT_METHOD_IDS.UPI,
  displayName: 'UPI',
  description: 'Pay using UPI ID',
  icon: 'smartphone',
  requiresOnlineAuth: true,
  fields: [
    new PaymentField({
      name: 'upiId',
      type: PaymentFieldType.STRING,
      label: 'UPI ID',
      placeholder: 'username@bankname',
      minLength: 5,
      maxLength: 50
    })
  ],
});

// Keep the contracts defined but don't include them in default contracts
export const PAYPAL_CONTRACT = new PaymentMethodContract({
  id: PAYMENT_METHOD_IDS.PAYPAL,
  displayName: 'PayPal',
  description: 'Pay securely with PayPal',
  icon: 'paypal',
  requiresOnlineAuth: true,
  fields: [], // PayPal handles authentication
});

export const APPLE_PAY_CONTRACT = new PaymentMethodContract({
  id: PAYMENT_METHOD_IDS.APPLE_PAY,
  displayName: 'Apple Pay',
  description: 'Pay with Apple Pay',
  icon: 'apple',
  requiresOnlineAuth: true,
  fields: [], // Apple Pay handles authentication
});

export const GOOGLE_PAY_CONTRACT = new PaymentMethodContract({
  id: PAYMENT_METHOD_IDS.GOOGLE_PAY,
  displayName: 'Google Pay',
  description: 'Pay with Google Pay',
  icon: 'google',
  requiresOnlineAuth: true,
  fields: [], // Google Pay handles authentication
});

// Default contracts array - only include methods with working providers
export const DEFAULT_PAYMENT_CONTRACTS = [
  CREDIT_CARD_CONTRACT,
  COD_CONTRACT,
  UPI_CONTRACT
];
