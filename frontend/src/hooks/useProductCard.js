import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './redux.js';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice.js';
import { toast } from 'react-hot-toast';

export const useProductCard = (product, onAddToCart) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: wishlistItems = [] } = useAppSelector((state) => state.wishlist);
  
  const productId = product.id || product._id;

  const isInWishlist = wishlistItems && wishlistItems.some(item => (item.id || item._id) === productId);

  const handleCardClick = () => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
        
    if (isInWishlist) {
      dispatch(removeFromWishlist(productId));
      toast.success(`${product.name} removed from wishlist!`);
    } else {
      dispatch(addToWishlist(product));
      toast.success(`${product.name} added to wishlist!`);
    }
  };

  return {
    productId,
    isInWishlist,
    handleCardClick,
    handleAddToCart,
    handleToggleWishlist
  };
}; 