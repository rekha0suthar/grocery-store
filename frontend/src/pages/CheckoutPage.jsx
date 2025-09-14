import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux.js';
import { clearCart } from '../store/slices/cartSlice.js';
import { selectAddress, clearSelectedAddress, fetchUserAddresses } from '../store/slices/addressSlice.js';
import Card from '../components/UI/Card.jsx';
import Button from '../components/UI/Button.jsx';
import Input from '../components/UI/Input.jsx';
import AddressSelector from '../components/AddressSelector.jsx';
import AddressForm from '../components/AddressForm.jsx';
import { 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail, 
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../store/slices/orderSlice.js';
import { 
  PaymentValidationRules, 
  PaymentFormatters, 
  validateOrderData 
} from '../utils/validation.js';

const CheckoutPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, totalItems, totalPrice } = useAppSelector((state) => state.cart);
  const { selectedAddressId, addresses, loading: addressesLoading, error: addressesError } = useAppSelector((state) => state.addresses);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [useSavedAddress, setUseSavedAddress] = useState(false);

  useEffect(() => {
    if (selectedAddressId && useSavedAddress) {
      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
      if (selectedAddress) {
        setFormData(prev => ({
          ...prev,
          firstName: selectedAddress.firstName,
          lastName: selectedAddress.lastName,
          email: selectedAddress.email,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
        }));
      }
    }
  }, [selectedAddressId, addresses, useSavedAddress]);

  useEffect(() => {
    console.log('Fetching addresses...');
    dispatch(fetchUserAddresses()).then((result) => {
      console.log('Addresses fetched:', result);
    }).catch((error) => {
      console.log('Error fetching addresses:', error);
    });
  }, [dispatch]);

  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case 'email':
        if (value && !PaymentValidationRules.validateEmail(value).isValid) {
          error = PaymentValidationRules.validateEmail(value).message;
        }
        break;
      case 'phone':
        if (value && !PaymentValidationRules.validatePhone(value).isValid) {
          error = PaymentValidationRules.validatePhone(value).message;
        }
        break;
      case 'zipCode':
        if (value && !PaymentValidationRules.validateZIPCode(value).isValid) {
          error = PaymentValidationRules.validateZIPCode(value).message;
        }
        break;
      case 'cardNumber':
        if (value && formData.paymentMethod === 'card' && !PaymentValidationRules.validateCardNumber(value).isValid) {
          error = PaymentValidationRules.validateCardNumber(value).message;
        }
        break;
      case 'expiryDate':
        if (value && formData.paymentMethod === 'card' && !PaymentValidationRules.validateExpiryDate(value).isValid) {
          error = PaymentValidationRules.validateExpiryDate(value).message;
        }
        break;
      case 'cvv':
        if (value && formData.paymentMethod === 'card' && !PaymentValidationRules.validateCVV(value).isValid) {
          error = PaymentValidationRules.validateCVV(value).message;
        }
        break;
      default:
        if (!value.trim()) {
          error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
        }
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'cardNumber') {
      formattedValue = PaymentFormatters.formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = PaymentFormatters.formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = PaymentFormatters.formatCVV(value);
    } else if (name === 'phone') {
      formattedValue = PaymentFormatters.formatPhone(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    const error = validateField(name, formattedValue);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (useSavedAddress) {
      if (!Array.isArray(addresses) || addresses.length === 0) {
        errors.savedAddress = 'No saved addresses available';
        return false;
      }
      
      if (!selectedAddressId) {
        errors.savedAddress = 'Please select a saved address';
        return false;
      }
      
      if (formData.paymentMethod === 'card') {
        const cardFields = ['cardNumber', 'expiryDate', 'cvv'];
        cardFields.forEach(field => {
          if (!formData[field].trim()) {
            errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required for card payments`;
          } else {
            const error = validateField(field, formData[field]);
            if (error) {
              errors[field] = error;
            }
          }
        });
      }
    } else {
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
      requiredFields.forEach(field => {
        if (!formData[field].trim()) {
          errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        } else {
          const error = validateField(field, formData[field]);
          if (error) {
            errors[field] = error;
          }
        }
      });

      if (formData.paymentMethod === 'card') {
        const cardFields = ['cardNumber', 'expiryDate', 'cvv'];
        cardFields.forEach(field => {
          if (!formData[field].trim()) {
            errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required for card payments`;
          } else {
            const error = validateField(field, formData[field]);
            if (error) {
              errors[field] = error;
            }
          }
        });
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddressSelect = (address) => {
    setFormData(prev => ({
      ...prev,
      firstName: address.firstName,
      lastName: address.lastName,
      email: address.email,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
    }));

    setValidationErrors(prev => {
      const newErrors = { ...prev };
      const addressFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
      addressFields.forEach(field => {
        delete newErrors[field];
      });
      return newErrors;
    });
  };

  const handleAddNewAddress = () => {
    setShowAddressForm(true);
  };

  const handleAddressFormSave = () => {
    setShowAddressForm(false);
    toast.success('Address saved successfully!');
  };

  const handleAddressFormCancel = () => {
    setShowAddressForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    if (!validateForm()) {
      const errorCount = Object.keys(validationErrors).length;
      if (useSavedAddress) {
        if (validationErrors.savedAddress) {
          toast.error(validationErrors.savedAddress);
        } else {
          toast.error(`Please fix the ${errorCount} validation error${errorCount > 1 ? 's' : ''} in payment details`);
        }
      } else {
        toast.error(`Please fix the ${errorCount} validation error${errorCount > 1 ? 's' : ''} in the form`);
      }
      return;
    }

    if (useSavedAddress && !selectedAddressId) {
      toast.error('Please select a saved address');
      return;
    }

    setIsProcessing(true);

    try {
      const paymentMethodMap = {
        'card': 'credit_card',
        'cod': 'cash_on_delivery'
      };

      const subtotal = totalPrice;
      const shippingAmount = 0;
      const taxAmount = 0;
      const discountAmount = 0;
      const finalAmount = subtotal + shippingAmount + taxAmount - discountAmount;

      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        })),
        totalAmount: subtotal,
        shippingAmount: shippingAmount,
        taxAmount: taxAmount,
        discountAmount: discountAmount,
        finalAmount: finalAmount,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          phone: formData.phone,
          email: formData.email
        },
        billingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          phone: formData.phone,
          email: formData.email
        },
        paymentMethod: paymentMethodMap[formData.paymentMethod] || 'credit_card',
        paymentStatus: 'paid',
        notes: ''
      };

      const result = await dispatch(createOrder(orderData)).unwrap();
      
      dispatch(clearCart());
      dispatch(clearSelectedAddress());
      setIsOrderPlaced(true);
      toast.success('Order placed successfully!');
      
    } catch (error) {
      console.error('Order creation failed:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isOrderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 text-center p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. You will receive a confirmation email shortly.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/products')}
              className="w-full"
            >
              Continue Shopping
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              Go Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Order Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.productName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} × ${item.productPrice.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ${(item.productPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">Free</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Address Selection */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Shipping Information
                  </h2>
                  {/* Debug info */}
                  <div className="text-sm text-gray-500">
                    {addressesLoading ? 'Loading addresses...' : `${Array.isArray(addresses) ? addresses.length : 0} saved addresses`}
                  </div>
                </div>

                {/* Always show the checkbox, but handle empty state */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={useSavedAddress}
                      onChange={(e) => {
                        setUseSavedAddress(e.target.checked);
                        if (!e.target.checked) {
                          dispatch(clearSelectedAddress());
                        }
                      }}
                      className="mr-2"
                      disabled={!addresses || !Array.isArray(addresses) || addresses.length === 0}
                    />
                    <span className={`text-sm ${(!addresses || !Array.isArray(addresses) || addresses.length === 0) ? 'text-gray-400' : 'text-gray-700'}`}>
                      Use saved address {(!addresses || !Array.isArray(addresses) || addresses.length === 0) && '(no saved addresses)'}
                    </span>
                  </label>
                </div>

                {useSavedAddress ? (
                  <div>
                    {addressesLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : addresses && Array.isArray(addresses) && addresses.length > 0 ? (
                      <AddressSelector
                        onAddressSelect={handleAddressSelect}
                        onAddNew={handleAddNewAddress}
                        selectedAddressId={selectedAddressId}
                      />
                    ) : (
                      <div className="text-center p-8 bg-gray-50 rounded-lg">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No saved addresses</h4>
                        <p className="text-gray-500 mb-4">Your addresses from previous orders will appear here</p>
                        <Button onClick={handleAddNewAddress}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Address
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <Input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className={validationErrors.firstName ? 'border-red-500' : ''}
                      />
                      {validationErrors.firstName && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.firstName}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <Input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className={validationErrors.lastName ? 'border-red-500' : ''}
                      />
                      {validationErrors.lastName && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.lastName}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className={validationErrors.email ? 'border-red-500' : ''}
                      />
                      {validationErrors.email && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.email}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className={validationErrors.phone ? 'border-red-500' : ''}
                      />
                      {validationErrors.phone && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.phone}
                        </p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <Input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className={validationErrors.address ? 'border-red-500' : ''}
                      />
                      {validationErrors.address && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.address}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <Input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className={validationErrors.city ? 'border-red-500' : ''}
                      />
                      {validationErrors.city && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.city}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <Input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className={validationErrors.state ? 'border-red-500' : ''}
                      />
                      {validationErrors.state && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.state}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code *
                      </label>
                      <Input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        className={validationErrors.zipCode ? 'border-red-500' : ''}
                      />
                      {validationErrors.zipCode && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.zipCode}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Card>

              {/* Payment Information */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="card">Credit/Debit Card</option>
                      <option value="cod">Cash on Delivery</option>
                    </select>
                  </div>
                  
                  {formData.paymentMethod === 'card' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number *
                        </label>
                        <Input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          required
                          className={validationErrors.cardNumber ? 'border-red-500' : ''}
                        />
                        {validationErrors.cardNumber && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {validationErrors.cardNumber}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date *
                          </label>
                          <Input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            required
                            className={validationErrors.expiryDate ? 'border-red-500' : ''}
                          />
                          {validationErrors.expiryDate && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {validationErrors.expiryDate}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV *
                          </label>
                          <Input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            required
                            className={validationErrors.cvv ? 'border-red-500' : ''}
                          />
                          {validationErrors.cvv && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {validationErrors.cvv}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isProcessing || items.length === 0}
                  className="px-8 py-3"
                >
                  {isProcessing ? 'Processing...' : `Place Order - $${totalPrice.toFixed(2)}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showAddressForm && (
        <AddressForm
          onSave={handleAddressFormSave}
          onCancel={handleAddressFormCancel}
        />
      )}
    </div>
  );
};

export default CheckoutPage; 
