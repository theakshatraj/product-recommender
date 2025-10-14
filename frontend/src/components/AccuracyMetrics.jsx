import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { TrendingUp, Target, CheckCircle, AlertCircle } from 'lucide-react';

const AccuracyMetrics = ({ data = [], title = "Recommendation Accuracy" }) => {
  // Mock data for demonstration
  const mockAccuracyData = [
    { day: 'Mon', accuracy: 85, clicks: 23, purchases: 8 },
    { day: 'Tue', accuracy: 88, clicks: 31, purchases: 12 },
    { day: 'Wed', accuracy: 82, clicks: 28, purchases: 9 },
    { day: 'Thu', accuracy: 91, clicks: 35, purchases: 15 },
    { day: 'Fri', accuracy: 87, clicks: 29, purchases: 11 },
    { day: 'Sat', accuracy: 89, clicks: 32, purchases: 13 },
    { day: 'Sun', accuracy: 93, clicks: 27, purchases: 14 }
  ];

  const mockRadialData = [
    { name: 'Clicked', value: 78, fill: '#8B5CF6' },
    { name: 'Purchased', value: 65, fill: '#06B6D4' },
    { name: 'Liked', value: 82, fill: '#10B981' },
    { name: 'Shared', value: 45, fill: '#F59E0B' }
  ];

  const chartData = data.length > 0 ? data : mockAccuracyData;
  const radialData = mockRadialData;

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return '#10B981';
    if (accuracy >= 80) return '#06B6D4';
    if (accuracy >= 70) return '#F59E0B';
    return '#EF4444';
  };

  const getAccuracyLabel = (accuracy) => {
    if (accuracy >= 90) return 'Excellent';
    if (accuracy >= 80) return 'Good';
    if (accuracy >= 70) return 'Fair';
    return 'Poor';
  };

  const averageAccuracy = Math.round(chartData.reduce((sum, item) => sum + item.accuracy, 0) / chartData.length);
  const totalClicks = chartData.reduce((sum, item) => sum + item.clicks, 0);
  const totalPurchases = chartData.reduce((sum, item) => sum + item.purchases, 0);
  const conversionRate = totalClicks > 0 ? Math.round((totalPurchases / totalClicks) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">How well our recommendations match user preferences</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">{averageAccuracy}%</div>
              <div className="text-sm text-purple-700">Avg Accuracy</div>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalClicks}</div>
              <div className="text-sm text-blue-700">Total Clicks</div>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{totalPurchases}</div>
              <div className="text-sm text-green-700">Purchases</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">{conversionRate}%</div>
              <div className="text-sm text-orange-700">Conversion Rate</div>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accuracy Trend */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Accuracy Trend (7 Days)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`${value}%`, 'Accuracy']}
              />
              <Area 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#8B5CF6" 
                fill="url(#colorGradient)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Interaction Distribution */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Interaction Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={radialData}>
              <RadialBar 
                minAngle={15} 
                label={{ position: "insideStart", fill: "#fff" }} 
                background 
                clockWise 
                dataKey="value" 
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`${value}%`, 'Rate']}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Performance Indicators</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div>
              <div className="text-sm font-medium text-gray-900">High Accuracy Days</div>
              <div className="text-xs text-gray-600">
                {chartData.filter(item => item.accuracy >= 85).length} of {chartData.length} days
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <div>
              <div className="text-sm font-medium text-gray-900">Best Day</div>
              <div className="text-xs text-gray-600">
                {chartData.reduce((best, current) => current.accuracy > best.accuracy ? current : best).day} 
                ({Math.max(...chartData.map(item => item.accuracy))}%)
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <div>
              <div className="text-sm font-medium text-gray-900">Trend</div>
              <div className="text-xs text-gray-600">
                {averageAccuracy >= 85 ? 'Improving' : 'Stable'} Performance
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccuracyMetrics;
