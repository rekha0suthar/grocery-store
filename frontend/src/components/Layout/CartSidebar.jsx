import React from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { closeCart, removeFromCart, updateQuantity, clearCart } from '../../store/slices/cartSlice.js';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import Button from '../UI/Button.jsx';
import { clsx } from 'clsx';

const CartSidebar = () => {
  const dispatch = useAppDispatch();
  const { isOpen, items, totalItems, totalPrice } = useAppSelector((state) => state.cart);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateQuantity({ productId, quantity: newQuantity }));
    }
  };

  const handleCheckout = () => {
    // TODO: Implement checkout logic
    console.log('Proceeding to checkout...');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => dispatch(closeCart())}
        />
      )}

      {/* Cart Sidebar */}
      <div
        className={clsx(
          'fixed top-0 right-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Shopping Cart ({totalItems})
            </h2>
            <button
              onClick={() => dispatch(closeCart())}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500">Add some products to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.productName}</h4>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => dispatch(removeFromCart(item.productId))}
                      className="p-1 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-semibold text-gray-900">${totalPrice.toFixed(2)}</span>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => dispatch(clearCart())}
                  className="w-full"
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
