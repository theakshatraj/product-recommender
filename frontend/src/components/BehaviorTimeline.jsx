import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
import { Clock, TrendingUp, Eye, ShoppingCart, Heart, Star } from 'lucide-react';

const BehaviorTimeline = ({ data = [], title = "User Behavior Timeline" }) => {
  // Mock data for demonstration
  const mockData = [
    { 
      hour: '00:00', day: 'Mon', views: 12, cart: 3, purchases: 1, likes: 5, 
      activity: 'Low', session: 8, bounce: 15 
    },
    { 
      hour: '04:00', day: 'Mon', views: 8, cart: 2, purchases: 0, likes: 2, 
      activity: 'Very Low', session: 5, bounce: 25 
    },
    { 
      hour: '08:00', day: 'Mon', views: 45, cart: 12, purchases: 4, likes: 18, 
      activity: 'High', session: 25, bounce: 8 
    },
    { 
      hour: '12:00', day: 'Mon', views: 78, cart: 28, purchases: 12, likes: 35, 
      activity: 'Peak', session: 42, bounce: 5 
    },
    { 
      hour: '16:00', day: 'Mon', views: 65, cart: 22, purchases: 8, likes: 28, 
      activity: 'High', session: 35, bounce: 7 
    },
    { 
      hour: '20:00', day: 'Mon', views: 52, cart: 18, purchases: 6, likes: 22, 
      activity: 'Medium', session: 28, bounce: 10 
    },
    { 
      hour: '00:00', day: 'Tue', views: 15, cart: 4, purchases: 2, likes: 7, 
      activity: 'Low', session: 10, bounce: 12 
    },
    { 
      hour: '04:00', day: 'Tue', views: 6, cart: 1, purchases: 0, likes: 1, 
      activity: 'Very Low', session: 3, bounce: 30 
    },
    { 
      hour: '08:00', day: 'Tue', views: 52, cart: 15, purchases: 7, likes: 21, 
      activity: 'High', session: 28, bounce: 6 
    },
    { 
      hour: '12:00', day: 'Tue', views: 89, cart: 32, purchases: 15, likes: 42, 
      activity: 'Peak', session: 48, bounce: 4 
    },
    { 
      hour: '16:00', day: 'Tue', views: 71, cart: 25, purchases: 11, likes: 31, 
      activity: 'High', session: 38, bounce: 6 
    },
    { 
      hour: '20:00', day: 'Tue', views: 58, cart: 20, purchases: 9, likes: 26, 
      activity: 'Medium', session: 32, bounce: 8 
    }
  ];

  const chartData = data.length > 0 ? data : mockData;

  const getActivityColor = (activity) => {
    switch (activity) {
      case 'Peak': return '#10B981';
      case 'High': return '#06B6D4';
      case 'Medium': return '#F59E0B';
      case 'Low': return '#EF4444';
      case 'Very Low': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getActivityIcon = (activity) => {
    switch (activity) {
      case 'Peak': return <TrendingUp className="w-4 h-4" />;
      case 'High': return <Eye className="w-4 h-4" />;
      case 'Medium': return <ShoppingCart className="w-4 h-4" />;
      case 'Low': return <Heart className="w-4 h-4" />;
      case 'Very Low': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Calculate peak hours
  const peakHour = chartData.reduce((best, current) => 
    current.views > best.views ? current : best
  );

  const totalViews = chartData.reduce((sum, item) => sum + item.views, 0);
  const totalCart = chartData.reduce((sum, item) => sum + item.cart, 0);
  const totalPurchases = chartData.reduce((sum, item) => sum + item.purchases, 0);
  const avgSession = Math.round(chartData.reduce((sum, item) => sum + item.session, 0) / chartData.length);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">User activity patterns throughout the day and week</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">{totalViews}</div>
              <div className="text-sm text-purple-700">Total Views</div>
            </div>
            <Eye className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalCart}</div>
              <div className="text-sm text-blue-700">Cart Additions</div>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{totalPurchases}</div>
              <div className="text-sm text-green-700">Purchases</div>
            </div>
            <Star className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">{avgSession}min</div>
              <div className="text-sm text-orange-700">Avg Session</div>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Timeline */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Activity Over Time</h4>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="views" 
                fill="url(#viewsGradient)" 
                stroke="#8B5CF6"
                strokeWidth={2}
              />
              <Bar dataKey="purchases" fill="#10B981" radius={[2, 2, 0, 0]} />
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Heatmap */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Activity Intensity</h4>
          <div className="space-y-3">
            {chartData.slice(0, 8).map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-16 text-sm font-medium text-gray-700">{item.hour}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{item.day}</span>
                    <span className={`text-xs px-2 py-1 rounded-full text-white font-medium`}
                          style={{ backgroundColor: getActivityColor(item.activity) }}>
                      {item.activity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(item.views / 100) * 100}%`,
                        backgroundColor: getActivityColor(item.activity)
                      }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{item.views}</div>
                  <div className="text-xs text-gray-600">views</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Peak Time Analysis */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Peak Activity Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Peak Hour</div>
                <div className="text-lg font-bold text-green-600">{peakHour.hour}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Peak Views</div>
                <div className="text-lg font-bold text-blue-600">{peakHour.views}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Avg Session</div>
                <div className="text-lg font-bold text-purple-600">{avgSession}min</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorTimeline;
