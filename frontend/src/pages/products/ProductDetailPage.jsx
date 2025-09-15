import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { fetchProductById } from '../../store/slices/productSlice.js';
import { addToCart } from '../../store/slices/cartSlice.js';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice.js';
import Card from '../../components/UI/Card.jsx';
import Button from '../../components/UI/Button.jsx';
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx';
import { ArrowLeft, ShoppingCart, Package, Minus, Plus, Star, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const productsState = useAppSelector((state) => state.products) || { currentProduct: null, loading: false };
  const categoriesState = useAppSelector((state) => state.categories) || { categories: [] };
  const wishlistState = useAppSelector((state) => state.wishlist) || { items: [] };
  
  const { currentProduct, loading } = productsState;
  const { categories } = categoriesState;
  const { items: wishlistItems } = wishlistState;
  
  const [quantity, setQuantity] = useState(1);
  const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (currentProduct) {
      dispatch(addToCart({ product: currentProduct, quantity }));
      toast.success(`${currentProduct.name} added to cart!`);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (currentProduct?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const isInWishlist = wishlistItems.some(item => item.id === currentProduct?.id);

  const handleToggleWishlist = () => {
    if (!currentProduct) return;
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(currentProduct.id));
      toast.success(`${currentProduct.name} removed from wishlist!`);
    } else {
      dispatch(addToWishlist(currentProduct));
      toast.success(`${currentProduct.name} added to wishlist!`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner data-testid="loading-spinner" />
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-500 mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/products')} variant="outline">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const discountPrice = currentProduct.discount > 0 
    ? currentProduct.price * (1 - currentProduct.discount / 100)
    : currentProduct.price;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={currentProduct.image || '/placeholder-product.jpg'}
                alt={currentProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentProduct.name}</h1>
              <p className="text-gray-600 text-lg">{currentProduct.description}</p>
            </div>

            <div className="flex items-center space-x-4">
              {currentProduct.discount > 0 ? (
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-green-600">${discountPrice.toFixed(2)}</span>
                  <span className="text-xl text-gray-500 line-through">${currentProduct.price.toFixed(2)}</span>
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    {currentProduct.discount}% OFF
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-900">${currentProduct.price.toFixed(2)}</span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {currentProduct.inStock && currentProduct.stock > 0 ? (
                <span className="text-green-600 font-medium">In Stock ({currentProduct.stock} available)</span>
              ) : (
                <span className="text-red-600 font-medium">Out of Stock</span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                Quantity:
              </label>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={currentProduct.stock || 1}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-16 text-center border-0 focus:ring-0 focus:outline-none"
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= (currentProduct.stock || 1)}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                disabled={!currentProduct.inStock || currentProduct.stock === 0}
                className="flex-1"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={handleToggleWishlist}
                variant="outline"
                className="flex items-center justify-center px-4"
              >
                <Heart className={`w-5 h-5 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
              </Button>
            </div>

        {hasAdditionalInfo() && (
          <Card className="mt-8">
            <button
              onClick={() => setIsAdditionalInfoOpen(!isAdditionalInfoOpen)}
              className="flex items-center justify-between w-full p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span className="font-medium">Additional Information</span>
              {isAdditionalInfoOpen ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
        
              </Card>
        )}

          </div>
        </div>
        {isAdditionalInfoOpen && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
              <div className="space-y-2">
                {currentProduct.specifications && Object.entries(currentProduct.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{key}:</span>
                    <span className="text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {currentProduct.nutritionInfo && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition Information</h3>
                <div className="space-y-2">
                  {Object.entries(currentProduct.nutritionInfo).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{key}:</span>
                      <span className="text-gray-900">{value}{key !== 'calories' ? 'g' : ''}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
