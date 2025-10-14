import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CategoryHeatmap = ({ data = [], title = "Category Preferences" }) => {
  // Mock data for demonstration if no data provided
  const mockData = [
    { name: 'Electronics', value: 85, interactions: 142, color: '#8B5CF6' },
    { name: 'Clothing', value: 72, interactions: 98, color: '#06B6D4' },
    { name: 'Home & Garden', value: 68, interactions: 76, color: '#10B981' },
    { name: 'Books', value: 45, interactions: 52, color: '#F59E0B' },
    { name: 'Sports', value: 38, interactions: 41, color: '#EF4444' },
    { name: 'Beauty', value: 29, interactions: 33, color: '#EC4899' },
    { name: 'Automotive', value: 15, interactions: 18, color: '#6B7280' }
  ];

  const chartData = data.length > 0 ? data : mockData;

  const getIntensityColor = (value) => {
    if (value >= 80) return 'from-purple-600 to-purple-800';
    if (value >= 60) return 'from-blue-600 to-blue-800';
    if (value >= 40) return 'from-green-600 to-green-800';
    if (value >= 20) return 'from-yellow-600 to-yellow-800';
    return 'from-gray-400 to-gray-600';
  };

  const getIntensityLabel = (value) => {
    if (value >= 80) return 'Very High';
    if (value >= 60) return 'High';
    if (value >= 40) return 'Medium';
    if (value >= 20) return 'Low';
    return 'Very Low';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">User interaction patterns across product categories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Interaction Count</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
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
                formatter={(value, name) => [value, 'Interactions']}
              />
              <Bar 
                dataKey="interactions" 
                fill="#8B5CF6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Preference Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`${value}%`, 'Preference']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Intensity Legend</h4>
        <div className="flex flex-wrap gap-2">
          {chartData.map((category, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getIntensityColor(category.value)}`}></div>
              <span className="text-sm text-gray-600">
                {category.name}: {getIntensityLabel(category.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {chartData.reduce((sum, item) => sum + item.interactions, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Interactions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {chartData.length}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length)}%
            </div>
            <div className="text-sm text-gray-600">Avg Preference</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryHeatmap;
