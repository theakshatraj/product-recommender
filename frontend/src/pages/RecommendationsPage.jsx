import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDetailedRecommendations, getUserRecommendations } from '../services/api';
import { useUser } from '../contexts/UserContext';
import { 
  Sparkles, 
  RefreshCw, 
  User, 
  TrendingUp, 
  Eye, 
  ShoppingCart, 
  Heart, 
  Info, 
  Star,
  Target,
  Zap,
  Award,
  ArrowRight
} from 'lucide-react';

const RecommendationsPage = () => {
  const { selectedUser } = useUser();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [limit, setLimit] = useState(10);
  const [useDetailed, setUseDetailed] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedUser) {
      fetchRecommendations();
    }
  }, [selectedUser, limit, useDetailed]);


  const fetchRecommendations = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (useDetailed) {
        try {
          data = await getDetailedRecommendations(selectedUser.id, limit);
        } catch (detailedError) {
          console.warn('Detailed recommendations failed, falling back to basic:', detailedError);
          data = await getUserRecommendations(selectedUser.id, limit);
        }
      } else {
        data = await getUserRecommendations(selectedUser.id, limit);
      }
      
      // Handle both array and object responses
      if (Array.isArray(data)) {
        setRecommendations(data);
      } else if (data && data.recommendations) {
        setRecommendations(data.recommendations);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      // For new users or API errors, show browse products message instead of error
      if (err.message.includes('422') || err.message.includes('404') || err.message.includes('No recommendations')) {
        setError('browse_products');
      } else {
        setError('Failed to load recommendations. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendations();
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'from-green-500 to-emerald-500';
    if (score >= 0.6) return 'from-yellow-500 to-orange-500';
    if (score >= 0.4) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-pink-500';
  };

  const getScoreText = (score) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    if (score >= 0.4) return 'Fair Match';
    return 'Low Match';
  };

  const getScoreIcon = (score) => {
    if (score >= 0.8) return <Award className="w-5 h-5" />;
    if (score >= 0.6) return <Target className="w-5 h-5" />;
    if (score >= 0.4) return <Zap className="w-5 h-5" />;
    return <Info className="w-5 h-5" />;
  };

  const RecommendationCard = ({ recommendation, rank }) => {
    // Handle the API data structure
    const product = recommendation.product_details;
    const score = recommendation.recommendation_score;
    const factors = recommendation.reason_factors;
    const [showFactors, setShowFactors] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    if (!product) return null;

    // Generate explanation based on factors
    const generateExplanation = () => {
      if (!factors) return "No explanation available";
      
      const collaborativeScore = factors.collaborative_score || 0;
      const contentScore = factors.content_based_score || 0;
      const categoryBoost = factors.category_boost || 1;
      
      let explanation = `This product scored ${(score * 100).toFixed(1)}% based on: `;
      
      if (collaborativeScore > 0.3) {
        explanation += "Similar users have shown interest in this product. ";
      }
      if (contentScore > 0.1) {
        explanation += "It matches your content preferences. ";
      }
      if (categoryBoost > 1.1) {
        explanation += "You've shown interest in this category before. ";
      }
      
      explanation += `The final score combines collaborative filtering (${(collaborativeScore * 100).toFixed(1)}%) and content-based filtering (${(contentScore * 100).toFixed(1)}%) with category boost (${categoryBoost}x).`;
      
      return explanation;
    };

    return (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
        {/* Header with rank and score */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                #{rank}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-600">{product.category}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getScoreColor(score)} text-white`}>
                {getScoreIcon(score)}
                <span className="ml-1">{getScoreText(score)}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(score * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Score Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Recommendation Score</span>
              <span>{(score * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full bg-gradient-to-r ${getScoreColor(score)} transition-all duration-1000 ease-out`}
                style={{ width: `${score * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Product Image and Basic Info */}
          <div className="flex items-center space-x-4 mb-4">
            <img 
              src={product.image_url || 'https://via.placeholder.com/80x80/6366f1/ffffff?text=Product'} 
              alt={product.name}
              className="w-20 h-20 object-cover rounded-xl"
            />
            <div className="flex-1">
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {product.description}
              </p>
              <div className="text-2xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* AI Explanation */}
        <div className="px-6 pb-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-purple-800 mb-2">Why we recommend this:</h4>
                <p className="text-purple-700 leading-relaxed text-sm">
                  {generateExplanation()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scoring Factors Tooltip */}
        {factors && (
          <div className="px-6 pb-4">
            <div className="relative">
              <button
                onClick={() => setShowFactors(!showFactors)}
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
              >
                <Info className="w-4 h-4" />
                <span>Why this score?</span>
                <ArrowRight className={`w-3 h-3 transition-transform ${showFactors ? 'rotate-90' : ''}`} />
              </button>
              
              {showFactors && (
                <div className="mt-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h5 className="font-medium text-gray-900 mb-2">Scoring Factors:</h5>
                  <div className="space-y-2">
                    {Object.entries(factors).map(([factor, value]) => (
                      <div key={factor} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 capitalize">
                          {factor.replace('_', ' ')}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${value * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-600 w-8 text-right">
                            {(value * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-3 gap-3">
            <Link
              to={`/products/${product.id}`}
              className="flex items-center justify-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
            </Link>
            <button className="flex items-center justify-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
              <ShoppingCart className="w-4 h-4" />
              <span>Cart</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
              <Heart className="w-4 h-4" />
              <span>Buy</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-primary-100 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-5 h-5 text-primary-600 mr-2" />
              <span className="text-primary-700 font-medium text-sm">AI-Powered Recommendations</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-neutral-900 mb-6">
              Your Personal Recommendations
            </h1>
            
            <p className="text-lg text-neutral-700 max-w-2xl mx-auto mb-8 leading-relaxed">
              Discover products carefully selected for you based on your browsing history, interactions, and preferences
            </p>

            {/* Controls */}
            <div className="bg-gray-50 rounded-xl p-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">

                {/* Limit Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Recommendations
                  </label>
                  <select
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </div>

                {/* Detailed Explanations Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Include LLM Explanations
                  </label>
                  <button
                    onClick={() => setUseDetailed(!useDetailed)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      useDetailed
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {useDetailed ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {/* Refresh Button */}
                <div className="flex items-end">
                  <button
                    onClick={handleRefresh}
                    disabled={loading || refreshing}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Exploring Products!</h3>
              <p className="text-gray-600 mb-6">
                We'll learn about your preferences as you browse, view, and interact with products. 
                The more you explore, the better our recommendations will become!
              </p>
              <div className="space-y-3">
                <p className="text-sm text-gray-500">Here's what you can do:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Browse different product categories</li>
                  <li>• View product details to learn more</li>
                  <li>• Add products to your cart</li>
                  <li>• Make purchases to help us understand your preferences</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Link
                  to="/products"
                  className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Browse Products
                </Link>
                <button
                  onClick={handleRefresh}
                  className="inline-block bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Check for New Recommendations
                </button>
              </div>
            </div>
          </div>
        )}
        
        {!loading && !error && recommendations.length === 0 && selectedUser && (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Exploring Products!</h3>
              <p className="text-gray-600 mb-6">
                We'll learn about your preferences as you browse, view, and interact with products. 
                The more you explore, the better our recommendations will become!
              </p>
              <div className="space-y-3">
                <p className="text-sm text-gray-500">Here's what you can do:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Browse different product categories</li>
                  <li>• View product details to learn more</li>
                  <li>• Add products to your cart</li>
                  <li>• Make purchases to help us understand your preferences</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Link
                  to="/products"
                  className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Browse Products
                </Link>
                <button
                  onClick={handleRefresh}
                  className="inline-block bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Check for New Recommendations
                </button>
              </div>
            </div>
          </div>
        )}
        
        {!loading && !error && recommendations.length > 0 && (
          <div className="space-y-8">
            {/* Results Header */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                <span>{recommendations.length} Personalized Recommendations Found</span>
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                These products are ranked by relevance to your preferences and behavior patterns
              </p>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {recommendations.map((rec, index) => (
                <RecommendationCard 
                  key={rec.product?.id || index} 
                  recommendation={rec} 
                  rank={index + 1}
                />
              ))}
            </div>

            {/* Load More Button - Only show if under limit */}
            {limit < 20 && (
              <div className="text-center pt-8">
                <button
                  onClick={() => setLimit(prev => Math.min(prev + 5, 20))}
                  className="bg-white border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-purple-600 hover:text-white transition-all duration-200"
                >
                  Load More Recommendations
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;

