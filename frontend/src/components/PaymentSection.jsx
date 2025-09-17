import React from 'react';
import Card from './UI/Card.jsx';
import Input from './UI/Input.jsx';
import Select from './UI/Select.jsx';
import { CreditCard } from 'lucide-react';

const PaymentSection = ({
  paymentMethod,
  cardData,
  onPaymentMethodChange,
  onCardDataChange
}) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <CreditCard className="w-5 h-5 mr-2" />
        Payment Information
      </h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </label>
        <Select
          value={paymentMethod}
          onChange={onPaymentMethodChange}
          className="w-full"
        >
          <option value="card">Credit/Debit Card</option>
          <option value="cod">Cash on Delivery</option>
        </Select>
      </div>

      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Number
            </label>
            <Input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardData.cardNumber}
              onChange={(e) => onCardDataChange('cardNumber', e.target.value)}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <Input
                type="text"
                placeholder="MM/YY"
                value={cardData.expiryDate}
                onChange={(e) => onCardDataChange('expiryDate', e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <Input
                type="text"
                placeholder="123"
                value={cardData.cvv}
                onChange={(e) => onCardDataChange('cvv', e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cardholder Name
            </label>
            <Input
              type="text"
              placeholder="John Doe"
              value={cardData.cardholderName}
              onChange={(e) => onCardDataChange('cardholderName', e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      )}

      {paymentMethod === 'cod' && (
        <div className="text-center py-8">
          <p className="text-gray-600">You will pay with cash when your order is delivered.</p>
        </div>
      )}
    </Card>
  );
};

export default PaymentSection; 