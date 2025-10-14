import { useState, useEffect } from 'react';
import { getProducts, getUsers } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import EnhancedProductCard from '../components/EnhancedProductCard';
import FiltersBar from '../components/FiltersBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { Grid, List, SortAsc, SortDesc } from 'lucide-react';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price', 'rating'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: { min: 0, max: 1000 },
    tags: [],
    search: ''
  });

  const { showToast } = useToast();

  // Load users and products on component mount
  useEffect(() => {
    fetchUsers();
    fetchProducts();
  }, []);

  // Apply filters and sorting when products or filters change
  useEffect(() => {
    applyFiltersAndSort();
  }, [products, filters, sortBy, sortOrder]);

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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      // Ensure data is an array
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      showToast('Failed to load products', 'error');
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...products];

    // Apply search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.category?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product =>
        filters.categories.includes(product.category)
      );
    }

    // Apply tag filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(product =>
        product.tags && filters.tags.some(tag => product.tags.includes(tag))
      );
    }

    // Apply price range filter
    filtered = filtered.filter(product =>
      product.price >= filters.priceRange.min && product.price <= filters.priceRange.max
    );

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'rating':
          aValue = a.average_rating || 0;
          bValue = b.average_rating || 0;
          break;
        case 'name':
        default:
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-100">
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-neutral-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-heading font-semibold text-neutral-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-neutral-700 mb-6">
              We couldn't load the products. Please try again later.
            </p>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Try Again
            </button>
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
          <div className="text-center">
            <h1 className="text-4xl font-heading font-bold text-neutral-900 mb-4">
              Product Discovery
            </h1>
            <p className="text-lg text-neutral-700 max-w-2xl mx-auto">
              Browse our catalog of products and interact with items to improve your personalized recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <FiltersBar 
        products={products}
        onFiltersChange={handleFiltersChange}
      />

      {/* Controls Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Results Count */}
            <div className="text-sm text-neutral-700">
              Showing {filteredProducts.length} of {products.length} products
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-700">Sort by:</span>
                <div className="flex items-center gap-1">
                  {['name', 'price', 'rating'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleSortChange(option)}
                      className={`flex items-center gap-1 px-3 py-1 text-sm rounded-lg transition-colors duration-200 ${
                        sortBy === option
                          ? 'bg-primary-100 text-primary-600'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                      {sortBy === option && (
                        sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-neutral-700 hover:text-neutral-900'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-neutral-700 hover:text-neutral-900'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md mx-auto">
                <h3 className="text-lg font-heading font-semibold text-neutral-900 mb-2">
                  No products found
                </h3>
                <p className="text-neutral-700 mb-4">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <button
                  onClick={() => setFilters({
                    categories: [],
                    priceRange: { min: 0, max: 1000 },
                    tags: [],
                    search: ''
                  })}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {filteredProducts.map((product) => (
                <EnhancedProductCard
                  key={product.id}
                  product={product}
                  selectedUser={selectedUser}
                  className={viewMode === 'list' ? 'flex flex-row' : ''}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Toast Container */}
      <ToastContainer />
    </main>
  );
};

export default HomePage;