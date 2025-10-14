import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  getUsers, 
  getUserAnalytics, 
  getCategoryHeatmap, 
  getRecommendationAccuracy, 
  getPopularProducts,
  getUserBehaviorTimeline 
} from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Clock, 
  Activity,
  User,
  RefreshCw,
  Award,
  Eye,
  ShoppingCart,
  Heart
} from 'lucide-react';

const AnalyticsPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [accuracyData, setAccuracyData] = useState(null);
  const [popularProducts, setPopularProducts] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchAnalytics();
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
    }
  };

  const fetchAnalytics = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      setError(null);

      const [analyticsRes, categoryRes, accuracyRes, popularRes, timelineRes] = await Promise.allSettled([
        getUserAnalytics(selectedUser.id),
        getCategoryHeatmap(selectedUser.id),
        getRecommendationAccuracy(selectedUser.id),
        getPopularProducts(10),
        getUserBehaviorTimeline(selectedUser.id)
      ]);

      // Set analytics data from API responses
      setAnalytics(analyticsRes.status === 'fulfilled' ? analyticsRes.value : null);
      setCategoryData(categoryRes.status === 'fulfilled' ? categoryRes.value : []);
      setAccuracyData(accuracyRes.status === 'fulfilled' ? accuracyRes.value : null);
      setPopularProducts(popularRes.status === 'fulfilled' ? popularRes.value : []);
      setTimelineData(timelineRes.status === 'fulfilled' ? timelineRes.value : []);

    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
      // Set empty data on error
      setAnalytics(null);
      setCategoryData([]);
      setAccuracyData(null);
      setPopularProducts([]);
      setTimelineData([]);
    } finally {
      setLoading(false);
    }
  };


  const CategoryHeatmap = ({ data }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Category Preferences</h3>
      </div>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={item.category} className="flex items-center space-x-3">
            <div className="w-20 text-sm text-gray-600 truncate">{item.category}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
              <div 
                className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000"
                style={{ width: `${item.percentage}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                {item.percentage}%
              </div>
            </div>
            <div className="w-12 text-sm text-gray-600 text-right">{item.interactions}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const AccuracyMetrics = ({ data }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Target className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Recommendation Accuracy</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {(data.overall_accuracy * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600">Overall Accuracy</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {(data.click_through_rate * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600">Click-Through Rate</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {(data.conversion_rate * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600">Conversion Rate</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {data.recommendations_accepted}/{data.recommendations_total}
          </div>
          <div className="text-sm text-gray-600">Accepted/Total</div>
        </div>
      </div>
    </div>
  );

  const PopularProductsChart = ({ data }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Popular Products</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={12}
          />
          <YAxis />
          <Tooltip />
          <Bar dataKey="interactions" fill="#8B5CF6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const BehaviorTimeline = ({ data }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Clock className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Weekly Activity</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="views" stroke="#8B5CF6" strokeWidth={2} />
          <Line type="monotone" dataKey="cart" stroke="#3B82F6" strokeWidth={2} />
          <Line type="monotone" dataKey="purchases" stroke="#10B981" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const InteractionSummary = ({ data }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm">Total Interactions</p>
            <p className="text-3xl font-bold">{data.total_interactions}</p>
          </div>
          <Activity className="w-8 h-8 text-purple-200" />
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Products Viewed</p>
            <p className="text-3xl font-bold">{data.total_products_viewed}</p>
          </div>
          <Eye className="w-8 h-8 text-blue-200" />
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Purchases</p>
            <p className="text-3xl font-bold">{data.total_purchases}</p>
          </div>
          <Heart className="w-8 h-8 text-green-200" />
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm">Avg Session (min)</p>
            <p className="text-3xl font-bold">{data.avg_session_duration}</p>
          </div>
          <Clock className="w-8 h-8 text-orange-200" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-primary-100 rounded-full px-4 py-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary-600 mr-2" />
              <span className="text-primary-700 font-medium text-sm">Analytics Dashboard</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-neutral-900 mb-6">
              User Analytics & Insights
            </h1>
            
            <p className="text-lg text-neutral-700 max-w-2xl mx-auto mb-8 leading-relaxed">
              Comprehensive analytics on user behavior, recommendation accuracy, and system performance
            </p>

            {/* User Selection and Controls */}
            <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Select User:</span>
                </div>
                <select
                  value={selectedUser?.id || ''}
                  onChange={(e) => {
                    const user = users.find(u => u.id.toString() === e.target.value);
                    setSelectedUser(user);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name || `User ${user.id}`}
                    </option>
                  ))}
                </select>
                <button
                  onClick={fetchAnalytics}
                  disabled={loading}
                  className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
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
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <div className="text-red-600 text-lg font-semibold mb-2">Analytics Unavailable</div>
              <p className="text-red-600 mb-6">
                Failed to load analytics data. Please ensure the backend is running and try again.
              </p>
              <button
                onClick={fetchAnalytics}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {!loading && !error && !analytics && (
          <div className="text-center py-20">
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-8 max-w-md mx-auto">
              <div className="text-neutral-600 text-lg font-semibold mb-2">No Analytics Data</div>
              <p className="text-neutral-600 mb-6">
                No analytics data available for this user. Start interacting with products to generate analytics.
              </p>
              <Link
                to="/"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
        )}
        
        {!loading && !error && analytics && (
          <div className="space-y-8">
            {/* Interaction Summary */}
            <InteractionSummary data={analytics} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CategoryHeatmap data={categoryData} />
              <AccuracyMetrics data={accuracyData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PopularProductsChart data={popularProducts} />
              <BehaviorTimeline data={timelineData} />
            </div>

            {/* Favorite Categories */}
            {analytics.favorite_categories && analytics.favorite_categories.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Favorite Categories</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analytics.favorite_categories.map((category, index) => (
                    <span 
                      key={category}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
