import { useState, useEffect } from 'react';
import { getUsers, getUserRecommendations, getDetailedRecommendations } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import EnhancedRecommendationCard from '../components/EnhancedRecommendationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import UserSelector from '../components/UserSelector';
import { Sparkles, RefreshCw, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(10);
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);

  const { showToast } = useToast();

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Load recommendations when user changes
  useEffect(() => {
    if (selectedUser) {
      fetchRecommendations();
    }
  }, [selectedUser, limit, includeExplanations]);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      const usersArray = Array.isArray(data) ? data : [];
      setUsers(usersArray);
      
      // Load selected user from localStorage if exists
      const savedUserId = localStorage.getItem('selectedUserId');
      if (savedUserId && usersArray.length > 0) {
        const savedUser = usersArray.find(user => user.id.toString() === savedUserId);
        if (savedUser) {
          setSelectedUser(savedUser);
        } else if (usersArray.length > 0) {
          setSelectedUser(usersArray[0]);
        }
      } else if (usersArray.length > 0) {
        setSelectedUser(usersArray[0]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showToast('Failed to load users', 'error');
    }
  };

  const fetchRecommendations = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Try to get detailed recommendations first, fallback to basic ones
      let data;
      try {
        if (includeExplanations) {
          data = await getDetailedRecommendations(selectedUser.id, limit);
        } else {
          data = await getUserRecommendations(selectedUser.id, limit);
        }
      } catch (detailedError) {
        console.warn('Detailed recommendations failed, falling back to basic:', detailedError);
        data = await getUserRecommendations(selectedUser.id, limit);
      }
      
      // Ensure data is an array
      const recommendationsData = Array.isArray(data) ? data : [];
      setRecommendations(recommendationsData);
      setLastRefreshTime(new Date());
      
      if (recommendationsData.length > 0) {
        showToast(`Found ${recommendationsData.length} personalized recommendations!`, 'success');
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError('Failed to load recommendations. Please try again.');
      showToast('Failed to load recommendations', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendations();
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  if (!selectedUser && users.length > 0) {
    return (
      <main className="min-h-screen bg-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-heading font-semibold text-neutral-900 mb-4">
                Select a User
              </h2>
              <p className="text-neutral-700 mb-6">
                Choose a user to view personalized recommendations.
              </p>
              <UserSelector 
                selectedUser={selectedUser} 
                onUserSelect={handleUserSelect}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100">
      {/* Header Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-heading font-bold text-neutral-900 mb-4">
              Your Recommendations
            </h1>
            <p className="text-lg text-neutral-700 max-w-2xl mx-auto">
              Discover products carefully selected for you based on your preferences and behavior patterns.
            </p>
          </div>

          {/* User Selection and Controls */}
          <div className="bg-neutral-50 rounded-lg border border-gray-200 p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              {/* User Selector */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Select User
                </label>
                <UserSelector 
                  selectedUser={selectedUser} 
                  onUserSelect={handleUserSelect}
                />
              </div>

              {/* Limit Selection */}
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Number of Recommendations
                </label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>

              {/* LLM Explanations Toggle */}
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Include LLM Explanations
                </label>
                <button
                  onClick={() => setIncludeExplanations(!includeExplanations)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    includeExplanations
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                  }`}
                >
                  {includeExplanations ? (
                    <ToggleRight className="w-4 h-4" />
                  ) : (
                    <ToggleLeft className="w-4 h-4" />
                  )}
                  {includeExplanations ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Refresh Button */}
              <div className="flex items-end">
                <button
                  onClick={handleRefresh}
                  disabled={loading || refreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Last Refresh Time */}
            {lastRefreshTime && (
              <div className="mt-4 text-center">
                <span className="text-sm text-neutral-500">
                  Last updated: {lastRefreshTime.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner />
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-20">
              <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md mx-auto">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-heading font-semibold text-neutral-900 mb-2">
                  Error Loading Recommendations
                </h3>
                <p className="text-neutral-700 mb-6">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* No Recommendations State */}
          {!loading && !error && recommendations.length === 0 && selectedUser && (
            <div className="text-center py-20">
              <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md mx-auto">
                <Sparkles className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-heading font-semibold text-neutral-900 mb-2">
                  No Recommendations Yet
                </h3>
                <p className="text-neutral-700 mb-6">
                  We need more information about your preferences to provide personalized recommendations.
                </p>
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-neutral-600 font-medium">Try these actions to improve recommendations:</p>
                  <ul className="text-sm text-neutral-600 space-y-1 text-left">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                      Browse different product categories
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                      View product details
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                      Add products to your cart
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                      Make some purchases
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  Browse Products
                </button>
              </div>
            </div>
          )}

          {/* Recommendations Display */}
          {!loading && !error && recommendations.length > 0 && (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4" />
                  {recommendations.length} Personalized Recommendations Found
                </div>
                <p className="text-neutral-700 max-w-2xl mx-auto">
                  These products are ranked by relevance to your preferences and behavior patterns
                </p>
              </div>

              {/* Recommendations List */}
              <div className="space-y-6">
                {recommendations.map((rec, index) => (
                  <EnhancedRecommendationCard
                    key={rec.product?.id || index}
                    recommendation={rec}
                    selectedUser={selectedUser}
                    rank={index + 1}
                  />
                ))}
              </div>

              {/* Load More Button */}
              <div className="text-center pt-8">
                <button
                  onClick={() => setLimit(prev => prev + 10)}
                  className="px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-600 hover:text-white transition-colors duration-200 font-medium"
                >
                  Load More Recommendations
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Toast Container */}
      <ToastContainer />
    </main>
  );
};

export default RecommendationsPage;