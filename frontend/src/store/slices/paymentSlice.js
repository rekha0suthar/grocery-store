import { createSlice } from '@reduxjs/toolkit';
import { getEnabledPaymentMethods } from '@grocery-store/core/contracts/payment.validation.js';

const initialState = {
  methods: getEnabledPaymentMethods(),
  selectedMethod: null,
  loading: false,
  error: null
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    selectPaymentMethod: (state, action) => {
      state.selectedMethod = action.payload;
    }
  }
});

export const { selectPaymentMethod } = paymentSlice.actions;
export default paymentSlice.reducer; 