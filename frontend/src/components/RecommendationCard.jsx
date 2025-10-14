import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Eye, Star } from 'lucide-react';

const RecommendationCard = ({ recommendation, rank = null }) => {
  const { product, score, explanation } = recommendation;
  
  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const getScoreText = (score) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    return 'Fair Match';
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
      {/* Header with rank badge */}
      <div className="relative p-4 pb-2">
        {rank && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            #{rank}
          </div>
        )}
        
        <div className="flex items-start space-x-3">
          <div className="relative">
            <img 
              src={product.image_url || 'https://via.placeholder.com/80x80/6366f1/ffffff?text=Product'} 
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="absolute -top-1 -right-1 bg-purple-600 text-white p-1 rounded-full">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {product.category && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {product.category}
                </span>
              )}
            </div>
            
            {/* Match Score */}
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {getScoreText(score)} ({(score * 100).toFixed(0)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      {explanation && (
        <div className="px-4 pb-3">
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-purple-800 mb-1">Why we recommend this:</p>
                <p className="text-sm text-purple-700 leading-relaxed">
                  {explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 pb-4">
        <div className="flex space-x-2">
          <Link
            to={`/products/${product.id}`}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-2 px-3 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
          >
            View Product
          </Link>
          <button className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;

