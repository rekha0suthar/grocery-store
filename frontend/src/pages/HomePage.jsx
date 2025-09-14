import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux.js';
import { fetchProducts } from '../store/slices/productSlice.js';
import { fetchCategories } from '../store/slices/categorySlice.js';
import { addToCart } from '../store/slices/cartSlice.js';
import Card from '../components/UI/Card.jsx';
import Button from '../components/UI/Button.jsx';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import { 
  ShoppingCart, 
  Star, 
  Heart, 
 
  Truck, 
  Shield, 
  Clock,
  ChevronRight,
  Package
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const HomePage = () => {
  const dispatch = useAppDispatch();
  const productsState = useAppSelector((state) => state.products) || { products: [], loading: false };
  const categoriesState = useAppSelector((state) => state.categories) || { categories: [], loading: false };
  
  const { products = [], loading: productsLoading = false } = productsState;
  const { categories = [], loading: categoriesLoading = false } = categoriesState;

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8 }));
    dispatch(fetchCategories({ limit: 6 }));
  }, [dispatch]);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  const featuredProducts = products.filter(product => product.isFeatured).slice(0, 4);
  // const _recentProducts = products.slice(0, 8);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Fresh Groceries
              <span className="block text-green-200">Delivered to Your Door</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
              Shop the freshest produce, organic foods, and household essentials with free delivery on orders over $50
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-green-600 bg-white rounded-lg hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors">
                  <ShoppingCart className="w-6 h-6 mr-2" />
                  Shop Now
                </button>
              </Link>
              <Link to="/register">
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-colors">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Delivery</h3>
              <p className="text-gray-600">Free delivery on orders over $50. Fast and reliable service.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fresh Guarantee</h3>
              <p className="text-gray-600">100% fresh products or your money back. Quality guaranteed.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer support for all your needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600">Find everything you need in our organized categories</p>
          </div>
          
          {categoriesLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="group"
                >
                  <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                      <Package className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                      {category.name}
                    </h3>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-lg text-gray-600">Handpicked fresh products just for you</p>
            </div>
            <Link to="/products">
              <Button variant="outline" className="flex items-center">
                View All
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          {productsLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-64 w-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                      <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                    </button>
                    {product.isFeatured && (
                      <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Featured
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-green-600">${product.price}</span>
                        {product.discountPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${product.discountPrice}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.5</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        product.stock > 10 
                          ? 'bg-green-100 text-green-800' 
                          : product.stock > 0 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                      
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        size="sm"
                        className="flex-1 ml-3"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-xl text-green-100 mb-8">
            Get the latest deals and fresh product updates delivered to your inbox
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-green-300"
            />
            <button className="px-6 py-3 bg-white text-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
