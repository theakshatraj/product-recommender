import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  TrendingUp, 
  Eye, 
  Star, 
  Heart, 
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Bot
} from 'lucide-react';
import ScoreProgressBar from './ScoreProgressBar';
import ScoringFactorsTooltip from './ScoringFactorsTooltip';
import { recordInteraction } from '../services/api';
import { useToast } from '../hooks/useToast';

const EnhancedRecommendationCard = ({ 
  recommendation, 
  selectedUser, 
  rank,
  className = '' 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(false);
  const [interactionStates, setInteractionStates] = useState({
    view: false,
    cart: false,
    purchase: false,
    like: false
  });

  const { showToast } = useToast();

  // Extract product and recommendation data
  const product = recommendation.product || recommendation;
  const score = recommendation.score || recommendation.match_score || 0;
  const explanation = recommendation.explanation || recommendation.llm_explanation || '';
  const factors = recommendation.factors || recommendation.scoring_factors;

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

  // Truncate explanation for display
  const truncateExplanation = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2 ${className}`}>
      {/* Header with Rank and Score */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Rank Badge */}
            <div className="flex items-center justify-center w-8 h-8 bg-primary-600 text-white rounded-full text-sm font-bold">
              #{rank}
            </div>
            
            {/* Recommendation Label */}
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-600">
                Recommended for You
              </span>
            </div>
          </div>

          {/* Score and Factors */}
          <div className="flex items-center gap-2">
            <ScoringFactorsTooltip factors={factors} />
            <span className="text-sm font-semibold text-neutral-900">
              {Math.round((score || 0) * 100)}% Match
            </span>
          </div>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 space-y-4">
        {/* Product Info */}
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.image_url || '/api/placeholder/80/80'}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <Link
              to={`/products/${product.id}`}
              className="block"
              onClick={() => handleInteraction('view')}
            >
              <h3 className="font-heading font-semibold text-neutral-900 text-lg leading-tight hover:text-primary-600 transition-colors duration-150">
                {product.name}
              </h3>
            </Link>

            {/* Rating */}
            {product.average_rating && (
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center">
                  {renderStars(product.average_rating)}
                </div>
                <span className="text-sm text-neutral-700">
                  {product.average_rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mt-2">
              <span className="font-heading font-bold text-xl text-neutral-900">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>

          {/* Like Button */}
          <button
            onClick={() => handleInteraction('like')}
            disabled={isLoading}
            className={`flex-shrink-0 p-2 rounded-full transition-all duration-200 ${
              interactionStates.like
                ? 'bg-red-500 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-red-50 hover:text-red-500'
            } focus:outline-none focus:ring-2 focus:ring-red-500`}
            aria-label="Like this product"
          >
            <Heart className={`w-5 h-5 ${interactionStates.like ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Score Progress Bar */}
        <ScoreProgressBar score={score} />

        {/* LLM Explanation */}
        {explanation && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-neutral-900">
                  Why this product?
                </span>
                <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                  AI Generated
                </span>
              </div>
              
              {explanation.length > 150 && (
                <button
                  onClick={() => setIsExplanationExpanded(!isExplanationExpanded)}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 transition-colors duration-150"
                >
                  {isExplanationExpanded ? (
                    <>
                      <span>Show less</span>
                      <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <span>Show more</span>
                      <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              )}
            </div>
            
            <div className="bg-neutral-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-neutral-700 leading-relaxed">
                {isExplanationExpanded ? explanation : truncateExplanation(explanation)}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          {/* View Button */}
          <Link
            to={`/products/${product.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-600"
            onClick={() => handleInteraction('view')}
          >
            <Eye className="w-4 h-4" />
            View Details
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
            <ShoppingCart className="w-4 h-4" />
            {interactionStates.cart ? 'Added!' : 'Add to Cart'}
          </button>

          {/* Purchase Button */}
          <button
            onClick={() => handleInteraction('purchase')}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-600 ${
              interactionStates.purchase
                ? 'bg-green-100 text-green-700'
                : 'bg-accent-500 hover:bg-accent-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedRecommendationCard;