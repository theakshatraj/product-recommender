import { useState, useEffect } from 'react';
import { X, Filter, DollarSign } from 'lucide-react';

const FiltersBar = ({ 
  products = [], 
  onFiltersChange, 
  className = '' 
}) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);

  // Extract unique categories from products
  useEffect(() => {
    const categories = [...new Set(products.map(product => product.category))].filter(Boolean);
    setAvailableCategories(categories);
    
    // Set max price based on available products
    if (products.length > 0) {
      const maxPrice = Math.max(...products.map(p => p.price));
      setPriceRange(prev => ({ ...prev, max: Math.ceil(maxPrice) }));
    }
  }, [products]);

  // Notify parent of filter changes
  useEffect(() => {
    const filters = {
      categories: selectedCategories,
      priceRange,
      searchTerm: searchTerm.trim()
    };
    onFiltersChange(filters);
  }, [selectedCategories, priceRange, searchTerm, onFiltersChange]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handlePriceChange = (type, value) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: Math.max(0, Math.min(prev.max, parseInt(value) || 0))
    }));
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: Math.max(...products.map(p => p.price), 1000) });
    setSearchTerm('');
  };

  const hasActiveFilters = selectedCategories.length > 0 || 
                          priceRange.min > 0 || 
                          priceRange.max < Math.max(...products.map(p => p.price), 1000) ||
                          searchTerm.trim().length > 0;

  return (
    <div className={`bg-white border-b border-neutral-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-neutral-700" />
            <h2 className="text-lg font-heading font-semibold text-neutral-900">Filters</h2>
            {hasActiveFilters && (
              <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                {selectedCategories.length + (priceRange.min > 0 ? 1 : 0) + (priceRange.max < Math.max(...products.map(p => p.price), 1000) ? 1 : 0) + (searchTerm.trim().length > 0 ? 1 : 0)}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="md:hidden p-1 text-neutral-700 hover:text-neutral-900 transition-colors"
              aria-label={isCollapsed ? 'Expand filters' : 'Collapse filters'}
            >
              <Filter className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters Content */}
        <div className={`transition-all duration-200 ${isCollapsed ? 'hidden md:block' : 'block'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-4">
            {/* Search */}
            <div className="lg:col-span-1">
              <label htmlFor="search" className="block text-sm font-medium text-neutral-900 mb-2">
                Search products
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>

            {/* Categories */}
            <div className="lg:col-span-1">
              <fieldset>
                <legend className="block text-sm font-medium text-neutral-900 mb-2">
                  Categories
                </legend>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map(category => (
                    <label
                      key={category}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="sr-only"
                      />
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedCategories.includes(category)
                            ? 'bg-primary-600 text-white'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {category}
                        {selectedCategories.includes(category) && (
                          <X className="w-3 h-3 ml-1" />
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Price Range */}
            <div className="lg:col-span-1">
              <fieldset>
                <legend className="block text-sm font-medium text-neutral-900 mb-2">
                  Price Range
                </legend>
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <label htmlFor="min-price" className="sr-only">Minimum price</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        id="min-price"
                        type="number"
                        min="0"
                        max={priceRange.max}
                        value={priceRange.min}
                        onChange={(e) => handlePriceChange('min', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        placeholder="Min"
                      />
                    </div>
                  </div>
                  
                  <div className="text-neutral-500">to</div>
                  
                  <div className="flex-1">
                    <label htmlFor="max-price" className="sr-only">Maximum price</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        id="max-price"
                        type="number"
                        min={priceRange.min}
                        max={Math.max(...products.map(p => p.price), 1000)}
                        value={priceRange.max}
                        onChange={(e) => handlePriceChange('max', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Price Range Slider */}
                <div className="mt-3">
                  <input
                    type="range"
                    min="0"
                    max={Math.max(...products.map(p => p.price), 1000)}
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #f1f5f9 0%, #f1f5f9 ${(priceRange.min / Math.max(...products.map(p => p.price), 1000)) * 100}%, #2563eb ${(priceRange.min / Math.max(...products.map(p => p.price), 1000)) * 100}%, #2563eb ${(priceRange.max / Math.max(...products.map(p => p.price), 1000)) * 100}%, #f1f5f9 ${(priceRange.max / Math.max(...products.map(p => p.price), 1000)) * 100}%, #f1f5f9 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-neutral-600 mt-1">
                    <span>${priceRange.min}</span>
                    <span>${priceRange.max}</span>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default FiltersBar;