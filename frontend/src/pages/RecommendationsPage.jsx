import { useState, useEffect } from 'react';
import RecommendationCard from '../components/RecommendationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getUserRecommendations } from '../services/api';
import { Sparkles, RefreshCw, Filter, User, TrendingUp } from 'lucide-react';

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(1); // Mock user ID
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchRecommendations();
  }, [userId, limit]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const data = await getUserRecommendations(userId, limit);
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendations();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-blue-100 rounded-full px-4 py-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-purple-700 font-medium">AI Recommendations</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Personal Recommendations
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              Discover products carefully selected for you based on your preferences and behavior patterns
            </p>

            {/* User Info and Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
                <User className="w-4 h-4 text-gray-600 mr-2" />
                <span className="text-sm text-gray-600">User ID:</span>
                <input
                  type="number"
                  value={userId}
                  onChange={(e) => setUserId(parseInt(e.target.value) || 1)}
                  className="ml-2 w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                />
              </div>
              
              <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
                <TrendingUp className="w-4 h-4 text-gray-600 mr-2" />
                <span className="text-sm text-gray-600">Limit:</span>
                <select
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>

              <button
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className="flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
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
        
        {!loading && recommendations.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recommendations Yet</h3>
              <p className="text-gray-600 mb-6">
                We need more information about your preferences to provide personalized recommendations.
              </p>
              <div className="space-y-3">
                <p className="text-sm text-gray-500">Try these actions:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Browse different product categories</li>
                  <li>• Rate some products you like</li>
                  <li>• View product details</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {!loading && recommendations.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {recommendations.length} Recommendations Found
                </h2>
                <span className="ml-3 bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                  Personalized for you
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendations.map((rec, index) => (
                <RecommendationCard 
                  key={rec.product?.id || index} 
                  recommendation={rec} 
                  rank={index + 1}
                />
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center pt-8">
              <button
                onClick={() => setLimit(prev => prev + 10)}
                className="bg-white border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-600 hover:text-white transition-all duration-200"
              >
                Load More Recommendations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;

