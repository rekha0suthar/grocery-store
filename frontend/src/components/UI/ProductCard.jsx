import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { addToCart } from '../../store/slices/cartSlice.js';
import { toggleWishlistItem } from '../../store/slices/wishlistSlice.js';
import Card from './Card.jsx';
import Button from './Button.jsx';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProductCard = ({ 
  product, 
  onAddToCart = null,
  showAddToCart = true
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);

  const getProductId = () => {
    return product?.id || product?._id || product?.productId;
  };

  const productId = getProductId();
  
  const handleToggleWishlist = (e) => {
    e.stopPropagation(); 
    dispatch(toggleWishlistItem(product));
    const isInWishlist = wishlistItems.some(item => (item.id || item._id) === productId);
    if (isInWishlist) {
      toast.success(`${product.name} removed from wishlist!`);
    } else {
      toast.success(`${product.name} added to wishlist!`);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); 
    
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      if (product.stock !== undefined && product.stock <= 0) {
        toast.error('This product is out of stock!');
        return;
      }
      
      const currentCartItem = cartItems.find(item => (item.productId || item.id) === productId);
      const currentQuantity = currentCartItem ? currentCartItem.quantity : 0;
      
      if (product.stock !== undefined && (currentQuantity + 1) > product.stock) {
        toast.error(`Only ${product.stock} items available in stock!`);
        return;
      }
      
      dispatch(addToCart({ product, quantity: 1 }));
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleCardClick = () => {
    if (productId) {
      navigate(`/products/${productId}`);
    } else {
      toast.error('Product ID not found');
    }
  };

  if (!product) {
    return null;
  }

  if (!productId) {
    return null;
  }

  return (
    <Card 
      className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
        <img
          src={product.images?.[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <button 
            className={`transition-colors ${
              wishlistItems.some(item => (item.id || item._id) === productId) 
                ? 'text-red-500' 
                : 'text-gray-400 hover:text-red-500'
            }`}
            onClick={handleToggleWishlist}
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">4.5</span>
          </div>
          <span className="text-sm text-gray-500">
            {product.stock} in stock
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              ${product.price}
            </span>
            {product.discountPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">
                ${product.discountPrice}
              </span>
            )}
          </div>
          
          {showAddToCart && (
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="flex items-center space-x-1"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
