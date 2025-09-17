import React from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux.js';
import { removeFromWishlist } from '../store/slices/wishlistSlice.js';
import { addToCart } from '../store/slices/cartSlice.js';
import Card from '../components/UI/Card.jsx';
import Button from '../components/UI/Button.jsx';
import { 
  Heart, 
  ShoppingCart, 
  ArrowLeft,
  Package,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const WishlistPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
    toast.success('Item removed from wishlist!');
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

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
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-2">Your saved items</p>
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">Start adding items you love to your wishlist!</p>
            <Button onClick={() => navigate('/products')}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Start Shopping
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="w-full h-48 bg-gray-200 rounded-md overflow-hidden mb-4">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-gray-400 m-auto" />
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {item.name}
                  </h3>
                  
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(item.price)}
                  </p>
                  
                  {item.stock !== undefined && (
                    <p className={`text-sm ${
                      item.stock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                    </p>
                  )}
                  
                  <div className="flex space-x-2 pt-2">
                    <Button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.stock === 0}
                      className="flex-1"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
 