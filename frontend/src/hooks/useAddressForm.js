import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './redux.js';
import { fetchUserOrders } from '../store/slices/orderSlice.js';

export const useAddressForm = () => {
  const dispatch = useAppDispatch();
  const { orders, loading: ordersLoading, error: ordersError } = useAppSelector((state) => state.orders);
  const { user } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  useEffect(() => {
    // Only fetch orders if user is logged in
    if (user?.id) {
      dispatch(fetchUserOrders());
    }
  }, [dispatch, user?.id]);

  const savedAddresses = React.useMemo(() => {
    if (!orders || orders.length === 0) {
      return [];
    }
    
    const addressMap = new Map();
    orders.forEach(order => {
      if (order.shippingAddress) {
        const addr = order.shippingAddress;
        const key = `${addr.firstName}_${addr.lastName}_${addr.address}_${addr.city}`;
        if (!addressMap.has(key)) {
          addressMap.set(key, {
            id: key,
            ...addr,
            lastUsed: order.createdAt || order.orderDate,
            source: 'order',
            orderId: order.id || order.orderId
          });
        }
      }
    });
    
    return Array.from(addressMap.values()).sort((a, b) => 
      new Date(b.lastUsed) - new Date(a.lastUsed)
    );
  }, [orders]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddressId(address.id);
    setFormData(prev => ({
      ...prev,
      firstName: address.firstName || '',
      lastName: address.lastName || '',
      email: address.email || '',
      phone: address.phone || '',
      address: address.address || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
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

  const handleUseSavedAddressChange = (checked) => {
    setUseSavedAddress(checked);
    if (!checked) {
      setSelectedAddressId('');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
      });
    }
  };

  const handleAddNewAddress = () => {
    setUseSavedAddress(false);
    setSelectedAddressId('');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    });
  };

  return {
    formData,
    setFormData,
    validationErrors,
    setValidationErrors,
    useSavedAddress,
    handleInputChange,
    handleAddressSelect,
    handleUseSavedAddressChange,
    handleAddNewAddress,
    selectedAddressId,
    addresses: savedAddresses,
    addressesLoading: ordersLoading,
    addressesError: ordersError
  };
};
