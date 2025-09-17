import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { fetchProductById } from '../../store/slices/productSlice.js';
import { addToCart } from '../../store/slices/cartSlice.js';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice.js';
import Card from '../../components/UI/Card.jsx';
import Button from '../../components/UI/Button.jsx';
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx';
import ProductImageGallery from '../../components/UI/ProductImageGallery.jsx';
import { ArrowLeft, Heart, ShoppingCart, Star, Truck, Shield, RotateCcw, AlertTriangle, Minus, Plus, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const productsState = useAppSelector((state) => state.products) || { currentProduct: null, loading: false, error: null };
  const wishlistState = useAppSelector((state) => state.wishlist) || { items: [] };
  
  const { currentProduct, loading, error } = productsState;
  const { items: wishlistItems } = wishlistState;
  
  const [quantity, setQuantity] = useState(1);
  const [showQuantityLimitDialog, setShowQuantityLimitDialog] = useState(false);
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (!currentProduct) return;

    if (currentProduct.stock && quantity > currentProduct.stock) {
      setRequestedQuantity(quantity);
      setShowQuantityLimitDialog(true);
      return;
    }

    dispatch(addToCart({
      product: currentProduct,
      quantity
    }));
    toast.success(`${currentProduct.name} added to cart!`);
  };

  const handleConfirmQuantityLimit = () => {
    if (!currentProduct) return;
    
    dispatch(addToCart({
      product: currentProduct,
      quantity: currentProduct.stock
    }));
    toast.success(`${currentProduct.name} added to cart! (Limited to ${currentProduct.stock} items)`);
    setShowQuantityLimitDialog(false);
  };

  const handleCancelQuantityLimit = () => {
    setShowQuantityLimitDialog(false);
    if (currentProduct) {
      setQuantity(currentProduct.stock);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (!currentProduct) return;
    
    if (newQuantity <= 0) {
      setQuantity(1);
      return;
    }
    
    const maxQuantity = currentProduct.stock !== undefined ? currentProduct.stock : newQuantity;
    const finalQuantity = Math.min(newQuantity, maxQuantity);
    
    if (finalQuantity !== newQuantity) {
      toast.error(`Only ${maxQuantity} items available in stock!`);
    }
    
    setQuantity(finalQuantity);
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
        <LoadingSpinner data-testid="loading-spinner" size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
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
            <ArrowLeft className="w-4 h-4 mr-2" />
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
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
              <ProductImageGallery
                images={currentProduct.images || []}
                alt={currentProduct.name}
                className="absolute inset-0 w-full h-full"
                showNavigation={true}
                showThumbnails={true}
                autoPlay={false}
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
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(4.5) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">(4.5) • 128 reviews</span>
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
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-16 text-center border-0 focus:ring-0 focus:outline-none"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="p-2 hover:bg-gray-100"
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
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isInStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button
                onClick={handleToggleWishlist}
                variant={isInWishlist ? 'outline' : 'secondary'}
                className="px-4"
                size="lg"
              >
                <Heart className={`w-5 h-5 ${isInWishlist ? 'text-red-500 fill-current' : ''}`} />
              </Button>
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">30-day return policy</span>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Easy returns and exchanges</span>
              </div>
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
      
      {showQuantityLimitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Quantity Limit Reached</h3>
            </div>
            <p className="text-gray-600 mb-4">
              You requested {requestedQuantity} items, but only {currentProduct.stock} are available in stock.
              Would you like to add the maximum available quantity ({currentProduct.stock} items) to your cart?
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={handleConfirmQuantityLimit}
                className="flex-1"
              >
                Add {currentProduct.stock} Items
              </Button>
              <Button
                onClick={handleCancelQuantityLimit}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
