import { Heart, ShoppingCart } from "lucide-react";
import React from 'react';
import Card from './Card.jsx';
import Button from './Button.jsx';
import ProductImageGallery from './ProductImageGallery.jsx';
import { useProductCard } from '../../hooks/useProductCard.js';

const ListProductCard = ({
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
      className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden p-0"
      onClick={handleCardClick}
    >
      <div className="flex">
        <div className="w-40 h-40 bg-gray-100 flex-shrink-0 overflow-hidden relative">
          <ProductImageGallery
            images={product.images || []}
            alt={product.name}
            className="w-full h-full"
            showNavigation={false}
            showThumbnails={false}
            autoPlay={false}
          />
        </div>

        <div className="p-4 flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1 mr-2">
              {product.name}
            </h3>
            <button
              className={`transition-colors flex-shrink-0 ${isInWishlist
                  ? 'text-red-500'
                  : 'text-gray-400 hover:text-red-500'
                }`}
              onClick={handleToggleWishlist}
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'text-red-500 fill-current' : ''}`} />
            </button>
          </div>

          <p className="text-gray-600 text-sm mb-2 line-clamp-1">
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

          <div className="flex items-center gap-4">
            <div className="flex">
              <div className="flex items-center space-x-2">
                {product.discountPrice ? (
                  <>
                    <span className="text-xl font-bold text-gray-900">
                      ${product.discountPrice.toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {showAddToCart && (
              <Button
                onClick={handleAddToCart}
                className="ml-auto"
                size="sm"
                aria-label="Add to cart"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ListProductCard;