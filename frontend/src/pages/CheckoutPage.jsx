import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../components/UI/Card.jsx';
import Button from '../components/UI/Button.jsx';
import AddressSection from '../components/AddressSection.jsx';
import PaymentMethodPicker from '../components/PaymentMethodPicker.jsx';
import PaymentFields from '../components/PaymentFields.jsx';
import { useFlexiblePayment } from '../hooks/useFlexiblePayment.js';
import { useAddressForm } from '../hooks/useAddressForm.js';
import { 
  generateOrderId, 
  calculateOrderTotals, 
  validateAddressForm, 
  prepareOrderData 
} from '../services/orderUtils.js';
import { 
  ShoppingCart, 
  ArrowLeft,
  CheckCircle,
  CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../store/slices/cartSlice.js';
import { orderService } from '../services/orderService.js';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems, totalPrice } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);

  // Payment state
  const {
    selectedMethod,
    methodFields,
    fieldErrors,
    loading: paymentLoading,
    error: paymentError,
    handleMethodChange,
    handleFieldChange,
    validateFields,
    processPayment,
    reset: resetPayment
  } = useFlexiblePayment();

  // Address state
  const {
    formData,
    validationErrors,
    useSavedAddress,
    handleInputChange,
    handleAddressSelect,
    handleUseSavedAddressChange,
    handleAddNewAddress,
    selectedAddressId,
    addresses,
    addressesLoading
  } = useAddressForm();

  // Local state
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/dashboard');
    }
  }, [cartItems.length, navigate]);

  // Reset payment when component unmounts
  useEffect(() => {
    return () => {
      resetPayment();
    };
  }, [resetPayment]);

  const handlePlaceOrder = async () => {
    try {
      setIsProcessing(true);
      
      // Validate address form using service
      const addressValidation = validateAddressForm(formData);
      if (!addressValidation.isValid) {
        toast.error('Please fill in all required address fields');
        return;
      }

      // Validate payment fields
      const paymentValidation = validateFields();
      if (!paymentValidation.isValid) {
        toast.error('Please fix payment validation errors');
        return;
      }

      // Generate order ID
      const orderId = generateOrderId();
      
      // Calculate totals
      const totals = calculateOrderTotals(totalPrice, 0, 0);
      
      // Process payment
      const paymentResult = await processPayment({
        methodId: selectedMethod?.id || 'cash_on_delivery',
        amount: totals.total,
        fields: methodFields,
        orderId
      });

      let isPaymentSuccessful = false;
      
      if (paymentResult.success === true) {
        // Direct success response
        isPaymentSuccessful = true;
      } else if (paymentResult.data && paymentResult.data.success === true) {
        // Nested success response
        isPaymentSuccessful = true;
      } else if (paymentResult.data && paymentResult.data.result) {
        // Result exists (assume success)
        isPaymentSuccessful = true;
      }

      if (isPaymentSuccessful) {
        // Payment successful - proceed with order creation
        const orderData = prepareOrderData({
          orderId,
          customerId: user?.id,
          cartItems,
          shippingAddress: useSavedAddress && selectedAddressId 
            ? addresses.find(addr => addr.id === selectedAddressId)
            : formData,
          paymentMethod: selectedMethod?.id || 'cash_on_delivery',
          paymentFields: methodFields,
          totals
        });

        // Create order
        await orderService.createOrder(orderData);
        
        // Clear cart and redirect
        dispatch(clearCart());
        navigate('/orders');
        
        // Show success message
        alert('Order placed successfully!');
      } else {
        throw new Error('Payment failed. Please try again.');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="p-10 mt-10 bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </Card>
      </div>
    );
  }

  const totals = calculateOrderTotals(totalPrice, 0, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-8">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <AddressSection
              useSavedAddress={useSavedAddress}
              addresses={addresses}
              addressesLoading={addressesLoading}
              selectedAddressId={selectedAddressId}
              formData={formData}
              validationErrors={validationErrors}
              handleInputChange={handleInputChange}
              handleAddressSelect={handleAddressSelect}
              handleUseSavedAddressChange={handleUseSavedAddressChange}
              handleAddNewAddress={handleAddNewAddress}
            />

            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
              </div>

              {paymentLoading ? (
                <Card className="p-6 text-center">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </Card>
              ) : paymentError ? (
                <Card className="p-6 text-center">
                  <p className="text-red-600">Failed to load payment methods</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  <PaymentMethodPicker
                    value={selectedMethod?.id}
                    onChange={handleMethodChange}
                  />
                  
                  {selectedMethod && (
                    <>
                      <PaymentFields
                        contract={selectedMethod}
                        values={methodFields}
                        errors={fieldErrors}
                        onChange={handleFieldChange}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-4">
                    <img
                      src={item.imageUrl || '/placeholder-product.jpg'}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      ${(item.productPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">${totals.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${totals.total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={isProcessing || paymentLoading}
                className="w-full mt-6"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
