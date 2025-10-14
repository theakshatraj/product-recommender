import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { TrendingUp, Star, Eye, ShoppingCart } from 'lucide-react';

const PopularProductsChart = ({ data = [], title = "Popular Products" }) => {
  // Mock data for demonstration
  const mockData = [
    { name: 'iPhone 15 Pro', views: 1250, purchases: 89, rating: 4.8, category: 'Electronics', price: 999 },
    { name: 'Nike Air Max', views: 980, purchases: 156, rating: 4.6, category: 'Sports', price: 120 },
    { name: 'MacBook Pro M3', views: 1100, purchases: 67, rating: 4.9, category: 'Electronics', price: 1999 },
    { name: 'Adidas Hoodie', views: 750, purchases: 134, rating: 4.4, category: 'Clothing', price: 80 },
    { name: 'Samsung Galaxy S24', views: 920, purchases: 78, rating: 4.7, category: 'Electronics', price: 899 },
    { name: 'Coffee Maker', views: 650, purchases: 98, rating: 4.5, category: 'Home', price: 150 },
    { name: 'Yoga Mat', views: 580, purchases: 112, rating: 4.3, category: 'Sports', price: 45 },
    { name: 'Bluetooth Headphones', views: 820, purchases: 145, rating: 4.6, category: 'Electronics', price: 199 }
  ];

  const chartData = data.length > 0 ? data : mockData;

  // Prepare data for different chart types
  const barData = chartData.slice(0, 8).map(item => ({
    name: item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name,
    views: item.views,
    purchases: item.purchases,
    conversion: Math.round((item.purchases / item.views) * 100)
  }));

  const scatterData = chartData.map(item => ({
    x: item.views,
    y: item.purchases,
    z: item.price,
    name: item.name,
    rating: item.rating
  }));

  const getCategoryColor = (category) => {
    const colors = {
      'Electronics': '#8B5CF6',
      'Sports': '#06B6D4',
      'Clothing': '#10B981',
      'Home': '#F59E0B',
      'Books': '#EF4444',
      'Beauty': '#EC4899'
    };
    return colors[category] || '#6B7280';
  };

  const topProduct = chartData.reduce((best, current) => 
    current.purchases > best.purchases ? current : best
  );

  const totalViews = chartData.reduce((sum, item) => sum + item.views, 0);
  const totalPurchases = chartData.reduce((sum, item) => sum + item.purchases, 0);
  const avgRating = (chartData.reduce((sum, item) => sum + item.rating, 0) / chartData.length).toFixed(1);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">Most viewed and purchased products across the platform</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">{totalViews.toLocaleString()}</div>
              <div className="text-sm text-purple-700">Total Views</div>
            </div>
            <Eye className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalPurchases}</div>
              <div className="text-sm text-blue-700">Total Purchases</div>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{avgRating}</div>
              <div className="text-sm text-green-700">Avg Rating</div>
            </div>
            <Star className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">{Math.round((totalPurchases / totalViews) * 100)}%</div>
              <div className="text-sm text-orange-700">Conversion Rate</div>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Views vs Purchases */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Views vs Purchases</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
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
              <Bar dataKey="views" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Views" />
              <Bar dataKey="purchases" fill="#06B6D4" radius={[4, 4, 0, 0]} name="Purchases" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scatter Plot - Views vs Purchases by Price */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Price vs Performance</h4>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={scatterData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Views" 
                tick={{ fontSize: 12 }}
                label={{ value: 'Views', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Purchases" 
                tick={{ fontSize: 12 }}
                label={{ value: 'Purchases', angle: -90, position: 'insideLeft' }}
              />
              <ZAxis type="number" dataKey="z" range={[50, 400]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name, props) => [
                  name === 'z' ? `$${value}` : value,
                  name === 'x' ? 'Views' : name === 'y' ? 'Purchases' : 'Price'
                ]}
                labelFormatter={(value, props) => props.payload?.name}
              />
              <Scatter 
                dataKey="y" 
                fill="#8B5CF6" 
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Product Highlight */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Product</h4>
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <h5 className="text-lg font-bold text-gray-900">{topProduct.name}</h5>
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                  {topProduct.category}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Views</div>
                  <div className="font-semibold text-gray-900">{topProduct.views.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-600">Purchases</div>
                  <div className="font-semibold text-gray-900">{topProduct.purchases}</div>
                </div>
                <div>
                  <div className="text-gray-600">Rating</div>
                  <div className="font-semibold text-gray-900">{topProduct.rating} ⭐</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">#{1}</div>
              <div className="text-sm text-gray-600">Best Seller</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularProductsChart;
