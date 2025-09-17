/**
 * Order Utilities
 * Handles order-related utility functions
 */

/**
 * Generate a unique order ID
 * @returns {string} - Unique order ID
 */
export const generateOrderId = () => {
  return `order_${Date.now()}`;
};

/**
 * Calculate order totals
 * @param {number} subtotal - Subtotal amount
 * @param {number} shipping - Shipping cost (default: 0)
 * @param {number} tax - Tax amount (default: 0)
 * @returns {Object} - Calculated totals
 */
export const calculateOrderTotals = (subtotal, shipping = 0, tax = 0) => {
  const total = subtotal + shipping + tax;
  
  return {
    subtotal,
    shipping,
    tax,
    total
  };
};

/**
 * Validate address form data
 * @param {Object} formData - Address form data
 * @returns {Object} - Validation result with errors
 */
export const validateAddressForm = (formData) => {
  const errors = {};
  
  if (!formData.firstName?.trim()) errors.firstName = 'First name is required';
  if (!formData.lastName?.trim()) errors.lastName = 'Last name is required';
  if (!formData.email?.trim()) errors.email = 'Email is required';
  if (!formData.phone?.trim()) errors.phone = 'Phone is required';
  if (!formData.address?.trim()) errors.address = 'Address is required';
  if (!formData.city?.trim()) errors.city = 'City is required';
  if (!formData.state?.trim()) errors.state = 'State is required';
  if (!formData.zipCode?.trim()) errors.zipCode = 'ZIP code is required';
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Prepare order data for API submission
 * @param {Object} params - Order preparation parameters
 * @returns {Object} - Prepared order data
 */
export const prepareOrderData = ({
  orderId,
  customerId,
  cartItems,
  shippingAddress,
  billingAddress,
  totals,
  paymentMethod,
  metadata = {}
}) => {
  return {
    orderId,
    customerId,
    items: cartItems.map(item => ({
      productId: item.productId,
      productName: item.productName,
      productPrice: item.productPrice,
      quantity: item.quantity,
      unit: item.unit || 'piece',
      lineTotal: item.productPrice * item.quantity
    })),
    shippingAddress,
    billingAddress,
    totals,
    totalAmount: totals.total,
    currency: 'USD',
    paymentMethod,
    metadata: {
      source: 'web',
      timestamp: new Date().toISOString(),
      ...metadata
    }
  };
};
