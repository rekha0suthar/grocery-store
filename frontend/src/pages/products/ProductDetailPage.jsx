import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { fetchProductById } from '../../store/slices/productSlice.js';
import { addToCart } from '../../store/slices/cartSlice.js';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice.js';
import Card from '../../components/UI/Card.jsx';
import Button from '../../components/UI/Button.jsx';
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx';
import { ArrowLeft, ShoppingCart, Package, Minus, Plus, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const productsState = useAppSelector((state) => state.products) || { currentProduct: null, loading: false };
  const wishlistState = useAppSelector((state) => state.wishlist) || { items: [] };
  
  const { currentProduct, loading } = productsState;
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

  const hasAdditionalInfo = () => {
    if (!currentProduct) return false;
    
    const hasSpecs = currentProduct.specifications && 
      Object.keys(currentProduct.specifications).length > 0 &&
      Object.values(currentProduct.specifications).some(value => value && value.toString().trim() !== '');
    
    const hasNutrition = currentProduct.nutritionInfo && 
      Object.keys(currentProduct.nutritionInfo).length > 0 &&
      Object.values(currentProduct.nutritionInfo).some(value => value && value.toString().trim() !== '');
    
    const hasOtherInfo = (currentProduct.weight && currentProduct.weight.toString().trim() !== '') ||
      (currentProduct.barcode && currentProduct.barcode.toString().trim() !== '') ||
      (currentProduct.manufacturer && currentProduct.manufacturer.toString().trim() !== '') ||
      (currentProduct.countryOfOrigin && currentProduct.countryOfOrigin.toString().trim() !== '') ||
      (currentProduct.tags && currentProduct.tags.toString().trim() !== '');
    
    return hasSpecs || hasNutrition || hasOtherInfo;
  };

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
          <p className="text-gray-500 mb-4">The product you&apos;re looking for doesn&apos;t exist.</p>
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

  const isInStock = currentProduct.stock !== undefined && currentProduct.stock > 0;
  const stockCount = currentProduct.stock || 0;

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
                src={currentProduct.images?.[0] || '/placeholder-product.jpg'}
                alt={currentProduct.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-product.jpg';
                }}
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
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-green-600">${discountPrice.toFixed(2)}</span>
                    <span className="text-xl text-gray-500 line-through">${currentProduct.price.toFixed(2)}</span>
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
                      {currentProduct.discount}% OFF
                    </span>
                  </div>
                  {(currentProduct.weight || currentProduct.unit) && (
                    <span className="text-sm text-gray-500 mt-1">
                      per {currentProduct.weight || '1'} {currentProduct.unit || 'unit'}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-gray-900">${currentProduct.price.toFixed(2)}</span>
                  {(currentProduct.weight || currentProduct.unit) && (
                    <span className="text-sm text-gray-500 mt-1">
                      per {currentProduct.weight || '1'} {currentProduct.unit || 'unit'}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {isInStock ? (
                <span className="text-green-600 font-medium">In Stock ({stockCount} available)</span>
              ) : (
                <span className="text-red-600 font-medium">Out of Stock</span>
              )}
            </div>

            {isInStock && (
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
                    max={stockCount}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-16 text-center border-0 focus:ring-0 focus:outline-none"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= stockCount}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                disabled={!isInStock}
                className="flex-1"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isInStock ? 'Add' : 'Out of Stock'}
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
                  className={`flex items-center justify-between w-full p-4 bg-gray-100 hover:bg-gray-200 transition-colors ${isAdditionalInfoOpen ? 'rounded-t-lg' : 'rounded-lg'
                    }`}
                >
                  <span className="font-medium">Additional Information</span>
                  {isAdditionalInfoOpen ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>

                {isAdditionalInfoOpen && (
                  <div className="p-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {currentProduct.specifications &&
                        Object.keys(currentProduct.specifications).length > 0 &&
                        Object.values(currentProduct.specifications).some(value => value && value.toString().trim() !== '') && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                            <div className="space-y-2">
                              {Object.entries(currentProduct.specifications)
                                .filter(([_key, value]) => value && value.toString().trim() !== '')
                                .map(([_key, value]) => (
                                  <div key={_key} className="flex justify-between">
                                    <span className="text-gray-600 capitalize">{_key}:</span>
                                    <span className="text-gray-900">{value}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                      {currentProduct.nutritionInfo &&
                        Object.keys(currentProduct.nutritionInfo).length > 0 &&
                        Object.values(currentProduct.nutritionInfo).some(value => value && value.toString().trim() !== '') && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition Information</h3>
                            <div className="space-y-2">
                              {Object.entries(currentProduct.nutritionInfo)
                                .filter(([_key, value]) => value && value.toString().trim() !== '')
                                .map(([_key, value]) => (
                                  <div key={_key} className="flex justify-between">
                                    <span className="text-gray-600 capitalize">{_key}:</span>
                                    <span className="text-gray-900">{value}{_key !== 'calories' ? 'g' : ''}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                      {(currentProduct.weight || currentProduct.barcode || currentProduct.manufacturer ||
                        currentProduct.countryOfOrigin || currentProduct.tags) && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                            <div className="space-y-2">
                              {currentProduct.weight && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Weight:</span>
                                  <span className="text-gray-900">{currentProduct.weight}</span>
                                </div>
                              )}
                              {currentProduct.barcode && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Barcode:</span>
                                  <span className="text-gray-900">{currentProduct.barcode}</span>
                                </div>
                              )}
                              {currentProduct.manufacturer && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Manufacturer:</span>
                                  <span className="text-gray-900">{currentProduct.manufacturer}</span>
                                </div>
                              )}
                              {currentProduct.countryOfOrigin && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Country of Origin:</span>
                                  <span className="text-gray-900">{currentProduct.countryOfOrigin}</span>
                                </div>
                              )}
                              {currentProduct.tags && (
                                <div className="flex flex-col space-y-2">
                                  <span className="text-gray-600 font-medium">Tags:</span>
                                  <div className="flex flex-wrap gap-2">
                                    {(() => {
                                      if (typeof currentProduct.tags === 'string') {
                                        if (currentProduct.tags.includes(',')) {
                                          return currentProduct.tags.split(',').map((tag, index) => (
                                            <span
                                              key={index}
                                              className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
                                            >
                                              {tag.trim()}
                                            </span>
                                          ));
                                        } else {
                                          const spacedTags = currentProduct.tags.replace(/([a-z])([A-Z])/g, '$1 $2');
                                          return spacedTags.split(' ').map((tag, index) => (
                                            <span
                                              key={index}
                                              className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
                                            >
                                              {tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()}
                                            </span>
                                          ));
                                        }
                                      } else if (Array.isArray(currentProduct.tags)) {
                                        return currentProduct.tags.map((tag, index) => (
                                          <span
                                            key={index}
                                            className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
                                          >
                                            {tag}
                                          </span>
                                        ));
                                      } else {
                                        return (
                                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200">
                                            {currentProduct.tags}
                                          </span>
                                        );
                                      }
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
