import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { fetchProductById } from '../../store/slices/productSlice.js';
import { addToCart } from '../../store/slices/cartSlice.js';
import Card from '../../components/UI/Card.jsx';
import Button from '../../components/UI/Button.jsx';
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx';
import { ArrowLeft, ShoppingCart, Package, Minus, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentProduct, loading } = useAppSelector((state) => state.products);
  const [quantity, setQuantity] = useState(1);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
        <p className="text-gray-500 mb-4">The product you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/products')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/products')}
        className="flex items-center"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Products
      </Button>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <Card className="overflow-hidden">
          <div className="aspect-w-16 aspect-h-9">
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
              {currentProduct.image ? (
                <img
                  src={currentProduct.image}
                  alt={currentProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-24 h-24 text-gray-400" />
              )}
            </div>
          </div>
        </Card>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentProduct.name}</h1>
            <p className="text-xl text-blue-600 font-semibold mb-4">${currentProduct.price}</p>
            <p className="text-gray-600 leading-relaxed">{currentProduct.description}</p>
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Stock:</span>
            <span className={`text-sm px-2 py-1 rounded-full ${
              currentProduct.stock > 10 
                ? 'bg-green-100 text-green-800' 
                : currentProduct.stock > 0 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
            }`}>
              {currentProduct.stock > 0 ? `${currentProduct.stock} available` : 'Out of stock'}
            </span>
          </div>

          {/* Category */}
          {currentProduct.category && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <span className="text-sm text-gray-600">{currentProduct.category.name}</span>
            </div>
          )}

          {/* Quantity Selector */}
          {currentProduct.stock > 0 && (
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
                  disabled={quantity >= currentProduct.stock}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={currentProduct.stock === 0}
            size="lg"
            className="w-full"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {currentProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>

          {/* Product Details */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
            </Card.Header>
            <Card.Content>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Product ID</dt>
                  <dd className="text-sm text-gray-900">{currentProduct.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Price</dt>
                  <dd className="text-sm text-gray-900">${currentProduct.price}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Stock</dt>
                  <dd className="text-sm text-gray-900">{currentProduct.stock}</dd>
                </div>
                {currentProduct.category && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="text-sm text-gray-900">{currentProduct.category.name}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(currentProduct.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
