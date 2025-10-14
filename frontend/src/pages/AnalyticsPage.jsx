import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Target, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import CategoryHeatmap from '../components/CategoryHeatmap';
import AccuracyMetrics from '../components/AccuracyMetrics';
import PopularProductsChart from '../components/PopularProductsChart';
import BehaviorTimeline from '../components/BehaviorTimeline';
import ToastContainer from '../components/ToastContainer';
import { useToast } from '../hooks/useToast';
import { 
  getUserAnalytics, 
  getCategoryHeatmap, 
  getRecommendationAccuracy, 
  getPopularProducts, 
  getUserBehaviorTimeline,
  getSystemMetrics,
  getUsers 
} from '../services/api';

const AnalyticsPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    categoryData: [],
    accuracyData: [],
    popularProducts: [],
    behaviorData: [],
    systemMetrics: {}
  });
  const [activeTab, setActiveTab] = useState('overview');

  const { toasts, removeToast, showSuccess, showError } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchAnalyticsData();
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
      if (data.length > 0) {
        setSelectedUser(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showError('Failed to load users');
    }
  };

  const fetchAnalyticsData = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch all analytics data in parallel
      const [
        categoryData,
        accuracyData,
        popularProducts,
        behaviorData,
        systemMetrics
      ] = await Promise.allSettled([
        getCategoryHeatmap(selectedUser.id),
        getRecommendationAccuracy(selectedUser.id),
        getPopularProducts(20),
        getUserBehaviorTimeline(selectedUser.id),
        getSystemMetrics()
      ]);

      setAnalyticsData({
        categoryData: categoryData.status === 'fulfilled' ? (Array.isArray(categoryData.value) ? categoryData.value : []) : [],
        accuracyData: accuracyData.status === 'fulfilled' ? (Array.isArray(accuracyData.value) ? accuracyData.value : []) : [],
        popularProducts: popularProducts.status === 'fulfilled' ? (Array.isArray(popularProducts.value) ? popularProducts.value : []) : [],
        behaviorData: behaviorData.status === 'fulfilled' ? (Array.isArray(behaviorData.value) ? behaviorData.value : []) : [],
        systemMetrics: systemMetrics.status === 'fulfilled' ? systemMetrics.value : {}
      });

      showSuccess('Analytics data loaded successfully!');
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      setError('Failed to load analytics data');
      showError('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'categories', label: 'Categories', icon: TrendingUp },
    { id: 'accuracy', label: 'Accuracy', icon: Target },
    { id: 'popular', label: 'Popular', icon: TrendingUp },
    { id: 'behavior', label: 'Behavior', icon: Users }
  ];

  if (loading && !analyticsData.categoryData.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
              <div className="absolute inset-0 w-12 h-12 border-4 border-purple-200 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Analytics</h3>
          <p className="text-gray-600">
            Gathering insights and performance metrics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-blue-100 rounded-full px-4 py-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-purple-700 font-medium">Analytics Dashboard</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Data Analytics & Insights
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              Comprehensive analytics and performance metrics for the recommendation system
            </p>

            {/* User Selection and Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {/* User Selection */}
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-purple-700 font-medium">User:</span>
                  <select
                    value={selectedUser?.id || ''}
                    onChange={(e) => {
                      const user = users.find(u => u.id === parseInt(e.target.value));
                      setSelectedUser(user);
                    }}
                    className="px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-700"
                  >
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name || `User ${user.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={loading || refreshing}
                  className="group flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                  {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      {!error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-lg p-2 border border-gray-100 mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {!error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CategoryHeatmap data={analyticsData.categoryData} />
              <AccuracyMetrics data={analyticsData.accuracyData} />
            </div>
          )}

          {activeTab === 'categories' && (
            <CategoryHeatmap 
              data={analyticsData.categoryData} 
              title="Category Interaction Analysis" 
            />
          )}

          {activeTab === 'accuracy' && (
            <AccuracyMetrics 
              data={analyticsData.accuracyData} 
              title="Recommendation Accuracy Analysis" 
            />
          )}

          {activeTab === 'popular' && (
            <PopularProductsChart 
              data={analyticsData.popularProducts} 
              title="Popular Products Analysis" 
            />
          )}

          {activeTab === 'behavior' && (
            <BehaviorTimeline 
              data={analyticsData.behaviorData} 
              title="User Behavior Timeline Analysis" 
            />
          )}

          {/* System Overview */}
          {activeTab === 'overview' && (
            <div className="mt-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">System Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {analyticsData.systemMetrics.totalUsers || users.length}
                    </div>
                    <div className="text-gray-600">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {analyticsData.systemMetrics.totalProducts || '1,000+'}
                    </div>
                    <div className="text-gray-600">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {analyticsData.systemMetrics.totalInteractions || '10,000+'}
                    </div>
                    <div className="text-gray-600">Interactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {analyticsData.systemMetrics.avgAccuracy || '87'}%
                    </div>
                    <div className="text-gray-600">Avg Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default AnalyticsPage;
