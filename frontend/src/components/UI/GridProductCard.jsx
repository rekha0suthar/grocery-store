import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import Card from './Card.jsx';
import Button from './Button.jsx';
import ProductImageGallery from './ProductImageGallery.jsx';
import { useProductCard } from '../../hooks/useProductCard.js';

const GridProductCard = ({
  product,
  onAddToCart = null,
  showAddToCart = true
}) => {
  const {
    productId,
    isInWishlist,
    handleCardClick,
    handleAddToCart,
    handleToggleWishlist
  } = useProductCard(product, onAddToCart);

  if (!productId) {
    return null;
  }

  return (
    <Card
      className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden h-full flex flex-col"
      onClick={handleCardClick}
    >
      <div className="relative w-full h-64 bg-gray-100 overflow-hidden flex-shrink-0">
        <ProductImageGallery
          images={product.images || []}
          alt={product.name}
          className="w-full h-full"
          showNavigation={true}
          showThumbnails={false}
          autoPlay={false}
        />
        
        <button
          className={`absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors z-30 ${isInWishlist
              ? 'text-red-500'
              : 'text-gray-400 hover:text-red-500'
            }`}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleWishlist(e);
          }}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-5 h-5 ${isInWishlist ? 'text-red-500 fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
            {product.name}
          </h3>
        </div>

        <p className="text-gray-600 text-sm mb-2 line-clamp-1 flex-shrink-0">
          {product.description}
        </p>

        {(product.weight || product.unit) && (
          <div className="text-xs text-gray-500 mb-3">
            {product.weight && product.unit ? (
              <span>{product.weight} {product.unit}</span>
            ) : product.weight ? (
              <span>{product.weight}</span>
            ) : (
              <span>{product.unit}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="flex">
            <div className="flex items-center space-x-2">
              {product.discountPrice ? (
                <>
                  <span className="text-2xl font-bold text-gray-900">
                    ${product.discountPrice.toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {showAddToCart && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(e);
              }}
              className="flex-shrink-0"
              size="sm"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default GridProductCard;
