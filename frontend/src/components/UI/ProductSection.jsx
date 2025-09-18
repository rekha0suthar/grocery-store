import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import GridProductCard from './GridProductCard.jsx';


const ProductSection = ({
  title,
  products = [],
  viewAllLink,
  viewAllText = "View all",
  onAddToCart,
  showAddToCart = true,
  className = "mb-8",
  gridClassName = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3",
  showSection = true,
  emptyStateMessage = null
}) => {
  if (!showSection || (products.length === 0 && !emptyStateMessage)) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {viewAllLink && products.length > 0 && (
          <Link
            to={viewAllLink}
            className="text-green-600 hover:text-green-700 font-medium flex items-center cursor-pointer z-10 relative"
            style={{ pointerEvents: 'auto' }}
          >
            {viewAllText}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        )}
      </div>

      {products.length > 0 ? (
        <div className={gridClassName}>
          {products.map((product) => (
            <GridProductCard 
              key={product.id || product._id || Math.random()} 
              product={product} 
              showAddToCart={showAddToCart}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : emptyStateMessage ? (
        <div className="text-center py-8">
          <p className="text-gray-600">{emptyStateMessage}</p>
        </div>
      ) : null}
    </div>
  );
};

export default ProductSection;
