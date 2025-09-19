import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';

const ProductImageGallery = ({ 
  images = [], 
  alt = 'Product', 
  className = '',
  showNavigation = true,
  showThumbnails = false,
  autoPlay = false,
  autoPlayInterval = 3000
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  React.useEffect(() => {
    if (autoPlay && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlay, images.length, autoPlayInterval]);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <Package className="w-12 h-12 text-gray-400" />
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentImageIndex(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1);
  };

  const goToNext = () => {
    setCurrentImageIndex(currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className={`relative group w-full h-full ${className}`}>
      <div className="relative overflow-hidden w-full h-full">
        <img
          src={images[currentImageIndex]}
          alt={`${alt} ${currentImageIndex + 1}`}
          className="w-full h-full object-center transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = '/';
          }}
        />
        
        {images.length > 1 && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}

        {showNavigation && images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goToImage(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex
                    ? 'bg-white'
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {showThumbnails && images.length > 1 && (
        <div className="flex space-x-2 mt-2 overflow-x-auto scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToImage(index);
              }}
              className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all duration-200 ${
                index === currentImageIndex
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.target.src = '/placeholder-product.jpg';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
