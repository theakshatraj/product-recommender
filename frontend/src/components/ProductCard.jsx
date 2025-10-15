import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, Heart, Check } from 'lucide-react';

const ProductCard = ({ product, onInteraction, selectedUser }) => {
  const [interactionFeedback, setInteractionFeedback] = useState({});
  
  // Generate a random rating for demo purposes if not provided
  const rating = product.average_rating || (Math.random() * 2 + 3).toFixed(1);
  const reviewCount = product.review_count || Math.floor(Math.random() * 100) + 10;

  // Generate tags (limit to 3 with "+N more")
  const tags = product.tags || [];
  const displayTags = tags.slice(0, 3);
  const remainingTags = tags.length - 3;

  const handleInteraction = async (interactionType) => {
    if (!selectedUser || !onInteraction) return;

    const key = `${selectedUser.id}-${product.id}-${interactionType}`;
    
    // Show optimistic feedback
    setInteractionFeedback(prev => ({
      ...prev,
      [key]: { status: 'loading', message: 'Recording...' }
    }));

    try {
      await onInteraction(product.id, interactionType);
      
      // Show success feedback
      setInteractionFeedback(prev => ({
        ...prev,
        [key]: { 
          status: 'success', 
          message: interactionType === 'view' ? 'Viewed!' :
                  interactionType === 'cart' ? 'Added to cart!' :
                  interactionType === 'purchase' ? 'Purchased!' :
                  'Recorded!'
        }
      }));

      // Clear feedback after 2 seconds
      setTimeout(() => {
        setInteractionFeedback(prev => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
      }, 2000);

    } catch (error) {
      console.error('Failed to record interaction:', error);
      
      // Show error feedback
      setInteractionFeedback(prev => ({
        ...prev,
        [key]: { 
          status: 'error', 
          message: 'Failed' 
        }
      }));

      // Clear error feedback after 3 seconds
      setTimeout(() => {
        setInteractionFeedback(prev => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
      }, 3000);
    }
  };

  const getFeedbackIcon = (status) => {
    switch (status) {
      case 'loading':
        return <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <Check className="w-4 h-4 text-white" />;
      case 'error':
        return <div className="w-4 h-4 bg-red-500 rounded-full" />;
      default:
        return null;
    }
  };

  return (
    <div className="group bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img 
          src={product.image_url || 'https://via.placeholder.com/300x200/2563eb/ffffff?text=Product'} 
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute top-3 right-3">
          <span className="bg-accent-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            {product.category}
          </span>
        </div>
        
        {/* Hover overlay with quick actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
            <button 
              onClick={() => handleInteraction('view')}
              disabled={!selectedUser}
              className="bg-white p-2 rounded-full shadow-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="View product"
            >
              <Eye className="w-4 h-4 text-neutral-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-heading font-semibold text-neutral-900 text-lg leading-tight line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Description */}
        {product.description && (
          <p className="text-neutral-700 text-sm leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating)
                    ? 'text-accent-500 fill-current'
                    : 'text-neutral-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-neutral-700">
            {rating} ({reviewCount} reviews)
          </span>
        </div>

        {/* Tags */}
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {displayTags.map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-neutral-100 text-neutral-700 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {remainingTags > 0 && (
              <span className="inline-block bg-neutral-100 text-neutral-700 text-xs px-2 py-1 rounded-full">
                +{remainingTags} more
              </span>
            )}
          </div>
        )}

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-2xl font-bold text-neutral-900">
            ${product.price.toFixed(2)}
          </div>
          
          {/* Interaction Feedback */}
          {Object.keys(interactionFeedback).some(key => key.includes(product.id.toString())) && (
            <div className="flex items-center space-x-1">
              {Object.entries(interactionFeedback)
                .filter(([key]) => key.includes(product.id.toString()))
                .map(([key, feedback]) => (
                  <div 
                    key={key}
                    className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      feedback.status === 'success' ? 'bg-green-100 text-green-800' :
                      feedback.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-primary-100 text-primary-800'
                    }`}
                  >
                    {getFeedbackIcon(feedback.status)}
                    <span>{feedback.message}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Link
            to={`/products/${product.id}`}
            className="flex items-center justify-center space-x-1 bg-primary-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </Link>
          
          <button
            onClick={() => handleInteraction('purchase')}
            disabled={!selectedUser}
            className="flex items-center justify-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Heart className="w-4 h-4" />
            <span>Buy</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

