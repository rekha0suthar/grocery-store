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
  const { currentProduct, loading } = useAppSelector((state) => state.products);
  const { categories } = useAppSelector((state) => state.categories);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
          <p className="text-gray-500 mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const getImageUrl = () => {
    return currentProduct.images?.[0] || 
           currentProduct.imageUrl || 
           currentProduct.image || 
           '/api/placeholder/400/300';
  };

  const getCategoryName = () => {
    if (currentProduct.category?.name) return currentProduct.category.name;
    if (currentProduct.categoryName) return currentProduct.categoryName;
    if (currentProduct.category) return currentProduct.category;
    
    if (currentProduct.categoryId && categories) {
      const category = categories.find(cat => cat.id === currentProduct.categoryId);
      if (category) {
        return category.name || category.title || 'Unknown Category';
      }
    }
    
    if (currentProduct.categoryId) {
      return `Category ID: ${currentProduct.categoryId}`;
    }
    
    return 'Uncategorized';
  };

  const getDiscountInfo = () => {
    if (currentProduct.discountPrice && currentProduct.discountPrice < currentProduct.price) {
      const discountPercent = Math.round(((currentProduct.price - currentProduct.discountPrice) / currentProduct.price) * 100);
      return {
        hasDiscount: true,
        originalPrice: currentProduct.price,
        discountPrice: currentProduct.discountPrice,
        discountPercent
      };
    }
    return { hasDiscount: false };
  };

  const discountInfo = getDiscountInfo();

  const hasAdditionalInfo = () => {
    return currentProduct.sku || 
           currentProduct.manufacturer || 
           currentProduct.countryOfOrigin || 
           currentProduct.unit || 
           currentProduct.weight || 
           currentProduct.dimensions || 
           currentProduct.barcode || 
           (currentProduct.tags && currentProduct.tags.length > 0) || 
           currentProduct.nutritionInfo;
  };

  const renderNutritionInfo = () => {
    if (!currentProduct.nutritionInfo) return null;

    const nutritionEntries = Object.entries(currentProduct.nutritionInfo);
    
    if (nutritionEntries.length === 0) return null;

    return (
      <div className="py-2">
        <dt className="text-sm font-medium text-gray-500 mb-2">Nutrition Information</dt>
        <dd className="text-sm text-gray-900">
          <div className="grid grid-cols-2 gap-2">
            {nutritionEntries.map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </dd>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/products')}
          className="flex items-center mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="overflow-hidden h-fit">
            <div className="aspect-w-1 aspect-h-1">
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                <img
                  src={getImageUrl()}
                  alt={currentProduct.name || 'Product Image'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Card>

          <div className="space-y-6 h-fit">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentProduct.name || 'Unnamed Product'}
              </h1>
              
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-3xl font-bold text-blue-600">
                  ${discountInfo.hasDiscount ? discountInfo.discountPrice : currentProduct.price}
                </span>
                {discountInfo.hasDiscount && (
                  <>
                    <span className="text-lg text-red-600 line-through">
                      ${discountInfo.originalPrice}
                    </span>
                    <span className="bg-green-100 text-green-800 text-sm font-bold px-2 py-1 rounded-full">
                      {discountInfo.discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-1 mb-4">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-700">4.5</span>
                <span className="text-sm text-gray-500">(24 reviews)</span>
              </div>

              <p className="text-gray-600 leading-relaxed text-lg">
                {currentProduct.description || 'No description available.'}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Availability:</span>
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                (currentProduct.stock || 0) > 10 
                  ? 'bg-green-100 text-green-800' 
                  : (currentProduct.stock || 0) > 0 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {(currentProduct.stock || 0) > 0 ? `${currentProduct.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {getCategoryName()}
              </span>
            </div>

            {(currentProduct.stock || 0) > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= (currentProduct.stock || 0)}
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                disabled={(currentProduct.stock || 0) === 0}
                size="lg"
                className="flex-1"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {(currentProduct.stock || 0) === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="px-6"
                onClick={handleToggleWishlist}
              >
                <Heart className={`w-5 h-5 mr-2 ${isInWishlist ? 'text-red-500 fill-current' : ''}`} />
                {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>
          </div>
        </div>

        {hasAdditionalInfo() && (
          <Card className="mt-8">
            <button
              onClick={() => setIsAdditionalInfoOpen(!isAdditionalInfoOpen)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {isAdditionalInfoOpen ? 'Hide details' : 'Show details'}
                </span>
                {isAdditionalInfoOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isAdditionalInfoOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="px-6 pb-6 border-t border-gray-100">
                <dl className="space-y-3 pt-4">
                  {currentProduct.sku && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-sm font-medium text-gray-500">SKU</dt>
                      <dd className="text-sm text-gray-900 font-mono">{currentProduct.sku}</dd>
                    </div>
                  )}
                  
                  {currentProduct.manufacturer && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-sm font-medium text-gray-500">Manufacturer</dt>
                      <dd className="text-sm text-gray-900">{currentProduct.manufacturer}</dd>
                    </div>
                  )}
                  
                  {currentProduct.countryOfOrigin && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-sm font-medium text-gray-500">Country of Origin</dt>
                      <dd className="text-sm text-gray-900">{currentProduct.countryOfOrigin}</dd>
                    </div>
                  )}
                  
                  {currentProduct.unit && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-sm font-medium text-gray-500">Unit</dt>
                      <dd className="text-sm text-gray-900">{currentProduct.unit}</dd>
                    </div>
                  )}
                  
                  {currentProduct.weight && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-sm font-medium text-gray-500">Weight</dt>
                      <dd className="text-sm text-gray-900">{currentProduct.weight} {currentProduct.unit || 'kg'}</dd>
                    </div>
                  )}
                  
                  {currentProduct.dimensions && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-sm font-medium text-gray-500">Dimensions</dt>
                      <dd className="text-sm text-gray-900">
                        {currentProduct.dimensions.length} × {currentProduct.dimensions.width} × {currentProduct.dimensions.height} cm
                      </dd>
                    </div>
                  )}
                  
                  {currentProduct.barcode && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-sm font-medium text-gray-500">Barcode</dt>
                      <dd className="text-sm text-gray-900 font-mono">{currentProduct.barcode}</dd>
                    </div>
                  )}
                  
                  {currentProduct.tags && currentProduct.tags.length > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-sm font-medium text-gray-500">Tags</dt>
                      <dd className="text-sm text-gray-900">
                        <div className="flex flex-wrap gap-1">
                          {currentProduct.tags.map((tag, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                  )}
                  
                  {renderNutritionInfo()}
                </dl>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
