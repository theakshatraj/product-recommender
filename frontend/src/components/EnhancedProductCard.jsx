import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Eye, 
  Heart, 
  Star, 
  Check,
  Tag as TagIcon
} from 'lucide-react';
import { recordInteraction } from '../services/api';
import { useToast } from '../hooks/useToast';

const EnhancedProductCard = ({ product, selectedUser, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [interactionStates, setInteractionStates] = useState({
    view: false,
    cart: false,
    purchase: false,
    like: false
  });
  
  const { showToast } = useToast();

  // Generate star rating display
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-accent-500 text-accent-500" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-accent-500/50 text-accent-500" />
        );
      } else {
        stars.push(
          <Star key={i} className="w-3 h-3 text-gray-300" />
        );
      }
    }
    return stars;
  };

  // Handle user interactions
  const handleInteraction = async (interactionType) => {
    if (!selectedUser) {
      showToast('Please select a user first', 'warning');
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      
      // Optimistic UI update
      setInteractionStates(prev => ({
        ...prev,
        [interactionType]: true
      }));

      // Record interaction
      await recordInteraction(
        selectedUser.id, 
        product.id, 
        interactionType,
        interactionType === 'purchase' ? 5 : null
      );

      // Show success feedback
      const messages = {
        view: 'Product viewed',
        cart: 'Added to cart',
        purchase: 'Purchase recorded',
        like: 'Product liked'
      };
      
      showToast(messages[interactionType], 'success');

      // Reset optimistic state after a delay
      setTimeout(() => {
        setInteractionStates(prev => ({
          ...prev,
          [interactionType]: false
        }));
      }, 2000);

    } catch (error) {
      console.error(`Failed to record ${interactionType}:`, error);
      
      // Revert optimistic UI update
      setInteractionStates(prev => ({
        ...prev,
        [interactionType]: false
      }));
      
      showToast(`Failed to record ${interactionType}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Get display tags (limit to 3)
  const displayTags = (product.tags || []).slice(0, 3);
  const remainingTags = (product.tags || []).length - 3;

  return (
    <div className={`group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:scale-[1.01] transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2 ${className}`}>
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img
          src={product.image_url || '/api/placeholder/300/300'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
        
        {/* Category Badge */}
        {product.category && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-neutral-900 rounded-full">
              <TagIcon className="w-3 h-3 mr-1" />
              {product.category}
            </span>
          </div>
        )}

        {/* Like Button */}
        <button
          onClick={() => handleInteraction('like')}
          disabled={isLoading}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
            interactionStates.like
              ? 'bg-red-500 text-white'
              : 'bg-white/90 backdrop-blur-sm text-neutral-700 hover:bg-red-50 hover:text-red-500'
          } focus:outline-none focus:ring-2 focus:ring-red-500`}
          aria-label="Like this product"
        >
          <Heart className={`w-4 h-4 ${interactionStates.like ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <Link
          to={`/products/${product.id}`}
          className="block"
          onClick={() => handleInteraction('view')}
        >
          <h3 className="font-heading font-semibold text-neutral-900 text-sm leading-tight line-clamp-2 hover:text-primary-600 transition-colors duration-150">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.average_rating && (
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {renderStars(product.average_rating)}
            </div>
            <span className="text-xs text-neutral-700">
              {product.average_rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Tags */}
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {displayTags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-neutral-100 text-xs text-neutral-700 rounded-md"
              >
                {tag}
              </span>
            ))}
            {remainingTags > 0 && (
              <span className="inline-flex items-center px-2 py-1 bg-neutral-100 text-xs text-neutral-500 rounded-md">
                +{remainingTags} more
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="font-heading font-semibold text-lg text-neutral-900">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {/* View Button */}
          <Link
            to={`/products/${product.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-600"
            onClick={() => handleInteraction('view')}
          >
            {interactionStates.view ? (
              <Check className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {interactionStates.view ? 'Viewed' : 'View'}
          </Link>

          {/* Add to Cart Button */}
          <button
            onClick={() => handleInteraction('cart')}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-600 ${
              interactionStates.cart
                ? 'bg-green-100 text-green-700'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {interactionStates.cart ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
            {interactionStates.cart ? 'Added!' : 'Add to Cart'}
          </button>

          {/* Purchase Button */}
          <button
            onClick={() => handleInteraction('purchase')}
            disabled={isLoading}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-600 ${
              interactionStates.purchase
                ? 'bg-green-100 text-green-700'
                : 'bg-accent-500 hover:bg-accent-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {interactionStates.purchase ? (
              <Check className="w-4 h-4" />
            ) : (
              'Buy'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductCard;