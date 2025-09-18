import React from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';

const InfiniteScrollLoader = ({ loading, hasMore, error, onRetry }) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-red-600 mb-4">Failed to load more items</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

 

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" />
        <span className="ml-2 text-gray-600">Loading more items...</span>
      </div>
    );
  }

  return null;
};

export default InfiniteScrollLoader; 