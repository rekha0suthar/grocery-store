export const PAYMENT_METHOD_IDS = Object.freeze({
  CREDIT_CARD: 'credit_card',
  CASH_ON_DELIVERY: 'cash_on_delivery',
  UPI: 'upi',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
  PAYPAL: 'paypal',
  RAZORPAY: 'razorpay',
  STRIPE: 'stripe'
});

/**
 * A method advertises what fields it needs at checkout.
 * Keep this UI-agnostic: just types, names, constraints.
 */
export const PaymentFieldType = Object.freeze({
  STRING: 'string',
  NUMBER: 'number',
  SELECT: 'select',
  HIDDEN: 'hidden',
  EMAIL: 'email',
  PHONE: 'phone',
  PASSWORD: 'password'
});

export class PaymentField {
  constructor({ name, type, label, required = true, mask = null, options = null, pattern = null, placeholder = null, minLength = null, maxLength = null }) {
    this.name = name;
    this.type = type;
    this.label = label;
    this.required = required;
    this.mask = mask;       // e.g., "#### #### #### ####"
    this.options = options; // [{label, value}]
    this.pattern = pattern; // regex string (optional)
    this.placeholder = placeholder;
    this.minLength = minLength;
    this.maxLength = maxLength;
  }
}

/**
 * Contract a method exposes to UI/backends.
 * - id: stable identifier
 * - displayName: human readable
 * - fields: PaymentField[]
 * - description: optional description
 * - icon: optional icon identifier
 * - requiresOnlineAuth: whether this method requires online authorization
 */
export class PaymentMethodContract {
  constructor({ id, displayName, fields = [], description = '', icon = null, requiresOnlineAuth = true, enabled = true }) {
    this.id = id;
    this.displayName = displayName;
    this.fields = fields;
    this.description = description;
    this.icon = icon;
    this.requiresOnlineAuth = requiresOnlineAuth;
    this.enabled = enabled;
  }
}

/**
 * Payment method configuration for UI rendering
 */
export class PaymentMethodConfig {
  constructor({ 
    id, 
    displayName, 
    description = '', 
    icon = null, 
    requiresOnlineAuth = true, 
    enabled = true,
    uiConfig = {} 
  }) {
    this.id = id;
    this.displayName = displayName;
    this.description = description;
    this.icon = icon;
    this.requiresOnlineAuth = requiresOnlineAuth;
    this.enabled = enabled;
    this.uiConfig = uiConfig; // UI-specific configuration
  }
}
