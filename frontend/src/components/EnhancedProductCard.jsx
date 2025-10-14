import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, ShoppingCart, Heart, Zap, Loader2 } from 'lucide-react';

const EnhancedProductCard = ({ 
  product, 
  showRating = true, 
  onView, 
  onAddToCart, 
  onPurchase, 
  onLike,
  isInteracting = false,
  interactionType = null
}) => {
  const [isLiked, setIsLiked] = useState(false);
  
  // Generate a random rating for demo purposes if not provided
  const rating = product.average_rating || (Math.random() * 2 + 3).toFixed(1);
  const reviewCount = product.review_count || Math.floor(Math.random() * 100) + 10;

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike) {
      onLike(product.id, !isLiked ? 'like' : 'unlike');
    }
  };

  const handleView = () => {
    if (onView) {
      onView(product.id);
    }
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id);
    }
  };

  const handlePurchase = () => {
    if (onPurchase) {
      onPurchase(product.id);
    }
  };

  const isButtonLoading = (type) => isInteracting && interactionType === type;

  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img 
          src={product.image_url || 'https://via.placeholder.com/300x200/6366f1/ffffff?text=Product'} 
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex space-x-2">
          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
            {product.category}
          </span>
          <button
            onClick={handleLike}
            className={`p-2 rounded-full transition-all duration-200 ${
              isLiked 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
            <button 
              onClick={handleView}
              disabled={isButtonLoading('view')}
              className="bg-white p-2 rounded-full shadow-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
            >
              {isButtonLoading('view') ? (
                <Loader2 className="w-4 h-4 text-gray-700 animate-spin" />
              ) : (
                <Eye className="w-4 h-4 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {showRating && (
          <div className="flex items-center space-x-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-1">
              {rating} ({reviewCount})
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="flex space-x-2">
            <button
              onClick={handleView}
              disabled={isButtonLoading('view')}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isButtonLoading('view') ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              View Details
            </button>
            
            <Link
              to={`/products/${product.id}`}
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 text-center"
            >
              Full Page
            </Link>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleAddToCart}
              disabled={isButtonLoading('cart')}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isButtonLoading('cart') ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ShoppingCart className="w-4 h-4 mr-2" />
              )}
              Add to Cart
            </button>
            
            <button
              onClick={handlePurchase}
              disabled={isButtonLoading('purchase')}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isButtonLoading('purchase') ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductCard;
