import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Target, Brain, Search, ArrowRight, Star, User, ShoppingCart, Eye, Heart, CheckCircle, AlertCircle } from 'lucide-react';
import { getUsers, getProducts, recordInteraction } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [interactionFeedback, setInteractionFeedback] = useState({});
  const [showHero, setShowHero] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchProducts();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      if (Array.isArray(data) && data.length > 0) {
        setUsers(data);
        setSelectedUser(data[0]);
      } else {
        // Use mock users for demonstration
        const mockUsers = generateMockUsers();
        setUsers(mockUsers);
        setSelectedUser(mockUsers[0]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Set mock users on error
      const mockUsers = generateMockUsers();
      setUsers(mockUsers);
      setSelectedUser(mockUsers[0]);
    }
  };

  const generateMockUsers = () => [
    { id: 1, name: "Alice Johnson" },
    { id: 2, name: "Bob Smith" },
    { id: 3, name: "Carol Davis" },
    { id: 4, name: "David Wilson" },
    { id: 5, name: "Eva Brown" }
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      // Ensure data is an array, fallback to mock data if not
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
      } else {
        // Use mock data for demonstration
        setProducts(generateMockProducts());
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      // Set mock data on error to prevent map errors
      setProducts(generateMockProducts());
    } finally {
      setLoading(false);
    }
  };

  const generateMockProducts = () => [
    {
      id: 1,
      name: "Wireless Bluetooth Headphones",
      category: "Electronics",
      price: 89.99,
      description: "High-quality wireless headphones with noise cancellation",
      image_url: "https://via.placeholder.com/300x200/6366f1/ffffff?text=Headphones"
    },
    {
      id: 2,
      name: "Programming Fundamentals Book",
      category: "Books",
      price: 29.99,
      description: "Comprehensive guide to programming fundamentals",
      image_url: "https://via.placeholder.com/300x200/10b981/ffffff?text=Book"
    },
    {
      id: 3,
      name: "Smart Fitness Watch",
      category: "Electronics",
      price: 199.99,
      description: "Advanced fitness tracking with heart rate monitoring",
      image_url: "https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Watch"
    },
    {
      id: 4,
      name: "Running Shoes",
      category: "Sports",
      price: 79.99,
      description: "Comfortable running shoes with excellent cushioning",
      image_url: "https://via.placeholder.com/300x200/f59e0b/ffffff?text=Shoes"
    },
    {
      id: 5,
      name: "Coffee Maker",
      category: "Home",
      price: 149.99,
      description: "Automatic coffee maker with programmable features",
      image_url: "https://via.placeholder.com/300x200/ef4444/ffffff?text=Coffee"
    },
    {
      id: 6,
      name: "Wireless Mouse",
      category: "Electronics",
      price: 39.99,
      description: "Ergonomic wireless mouse with precision tracking",
      image_url: "https://via.placeholder.com/300x200/06b6d4/ffffff?text=Mouse"
    }
  ];

  const handleInteraction = async (productId, interactionType, rating = null) => {
    if (!selectedUser) return;

    const key = `${selectedUser.id}-${productId}-${interactionType}`;
    
    try {
      // Show loading feedback
      setInteractionFeedback(prev => ({
        ...prev,
        [key]: { status: 'loading', message: 'Recording interaction...' }
      }));

      await recordInteraction(selectedUser.id, productId, interactionType, rating);
      
      // Show success feedback
      setInteractionFeedback(prev => ({
        ...prev,
        [key]: { 
          status: 'success', 
          message: interactionType === 'view' ? 'View recorded!' :
                  interactionType === 'cart' ? 'Added to cart!' :
                  interactionType === 'purchase' ? 'Purchase recorded!' :
                  'Interaction recorded!'
        }
      }));

      // Clear feedback after 3 seconds
      setTimeout(() => {
        setInteractionFeedback(prev => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
      }, 3000);

    } catch (error) {
      console.error('Failed to record interaction:', error);
      
      // Show error feedback
      setInteractionFeedback(prev => ({
        ...prev,
        [key]: { 
          status: 'error', 
          message: 'Failed to record interaction' 
        }
      }));

      // Clear feedback after 5 seconds
      setTimeout(() => {
        setInteractionFeedback(prev => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
      }, 5000);
    }
  };

  const getFeedbackIcon = (status) => {
    switch (status) {
      case 'loading':
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const ProductCard = ({ product }) => {
    const viewKey = `${selectedUser?.id}-${product.id}-view`;
    const cartKey = `${selectedUser?.id}-${product.id}-cart`;
    const purchaseKey = `${selectedUser?.id}-${product.id}-purchase`;

  return (
      <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
        {/* Product Image */}
        <div className="relative overflow-hidden">
          <img 
            src={product.image_url || 'https://via.placeholder.com/300x200/6366f1/ffffff?text=Product'} 
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
              {product.category}
            </span>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
              <button 
                onClick={() => handleInteraction(product.id, 'view')}
                className="bg-white p-2 rounded-full shadow-lg hover:bg-purple-50 transition-colors"
                title="View Product"
              >
                <Eye className="w-4 h-4 text-gray-700" />
              </button>
              <button 
                onClick={() => handleInteraction(product.id, 'cart')}
                className="bg-white p-2 rounded-full shadow-lg hover:bg-purple-50 transition-colors"
                title="Add to Cart"
              >
                <ShoppingCart className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => handleInteraction(product.id, 'view')}
              disabled={!selectedUser}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {interactionFeedback[viewKey]?.status === 'loading' ? (
                <div className="flex items-center justify-center space-x-2">
                  {getFeedbackIcon('loading')}
                  <span>Viewing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </div>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleInteraction(product.id, 'cart')}
                disabled={!selectedUser}
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 hover:text-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {interactionFeedback[cartKey]?.status === 'loading' ? (
                  <div className="flex items-center justify-center">
                    {getFeedbackIcon('loading')}
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-1">
                    <ShoppingCart className="w-4 h-4" />
                    <span>Cart</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => handleInteraction(product.id, 'purchase')}
                disabled={!selectedUser}
                className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {interactionFeedback[purchaseKey]?.status === 'loading' ? (
                  <div className="flex items-center justify-center">
                    {getFeedbackIcon('loading')}
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>Buy</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {Object.keys(interactionFeedback).some(key => key.includes(product.id.toString())) && (
            <div className="mt-3 space-y-1">
              {Object.entries(interactionFeedback)
                .filter(([key]) => key.includes(product.id.toString()))
                .map(([key, feedback]) => (
                  <div 
                    key={key}
                    className={`flex items-center space-x-2 text-xs px-2 py-1 rounded ${
                      feedback.status === 'success' ? 'bg-green-50 text-green-700' :
                      feedback.status === 'error' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {getFeedbackIcon(feedback.status)}
                    <span>{feedback.message}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* User Selection Header */}
      <div className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium text-neutral-700">Select User:</span>
              </div>
              <select
                value={selectedUser?.id || ''}
                onChange={(e) => {
                  const user = users.find(u => u.id.toString() === e.target.value);
                  setSelectedUser(user);
                }}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name || `User ${user.id}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowHero(!showHero)}
                className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors border border-primary-200 hover:border-primary-300 rounded-lg text-sm"
              >
                {showHero ? 'Hide Hero' : 'Show Hero'}
              </button>
              <Link
                to="/recommendations"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
              >
              Get Recommendations
            </Link>
          </div>
        </div>
      </div>
      </div>

      {/* Hero Section */}
      {showHero && (
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center bg-primary-100 rounded-full px-6 py-3 mb-8">
                <Sparkles className="w-5 h-5 text-primary-600 mr-2" />
                <span className="text-primary-700 font-medium text-sm">AI-Powered Product Discovery</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-heading font-bold text-neutral-900 mb-4">
                Discover Products
              </h1>
              <h2 className="text-5xl md:text-6xl font-heading font-bold text-primary-600 mb-8">
                Made for You
              </h2>
              
              <p className="text-lg text-neutral-700 max-w-2xl mx-auto mb-10 leading-relaxed">
                Experience the future of shopping with our intelligent recommendation engine. 
                Interact with products to improve your personalized suggestions.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                  <div className="text-3xl font-bold text-primary-600 mb-2">{products.length}</div>
                  <div className="text-sm text-neutral-700 font-medium">Products Available</div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                  <div className="text-3xl font-bold text-accent-500 mb-2">{users.length}</div>
                  <div className="text-sm text-neutral-700 font-medium">Active Users</div>
          </div>
                <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                  <div className="text-3xl font-bold text-primary-600 mb-2">95%</div>
                  <div className="text-sm text-neutral-700 font-medium">Accuracy Rate</div>
          </div>
          </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-neutral-900 mb-4">
              Browse Our Products
            </h2>
            <p className="text-lg text-neutral-700 max-w-2xl mx-auto leading-relaxed">
              {selectedUser ? `Welcome, ${selectedUser.name || `User ${selectedUser.id}`}! Interact with products to improve your recommendations.` : 'Select a user to start interacting with products.'}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onInteraction={handleInteraction}
                  selectedUser={selectedUser}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

