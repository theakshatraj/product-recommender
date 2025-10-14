import { useState, useEffect } from 'react';
import { Filter, X, DollarSign, Tag } from 'lucide-react';

const FiltersBar = ({ 
  products = [], 
  onFiltersChange, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: { min: 0, max: 1000 },
    tags: [],
    search: ''
  });

  // Extract unique categories and tags from products
  const categories = [...new Set(products.map(product => product.category).filter(Boolean))];
  const allTags = products.flatMap(product => product.tags || []).filter(Boolean);
  const uniqueTags = [...new Set(allTags)];

  // Update parent component when filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleCategoryToggle = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleTagToggle = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handlePriceChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: parseFloat(value) || 0
      }
    }));
  };

  const handleSearchChange = (value) => {
    setFilters(prev => ({
      ...prev,
      search: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      priceRange: { min: 0, max: 1000 },
      tags: [],
      search: ''
    });
  };

  const hasActiveFilters = filters.categories.length > 0 || 
                          filters.tags.length > 0 || 
                          filters.priceRange.min > 0 || 
                          filters.priceRange.max < 1000 || 
                          filters.search.trim() !== '';

  const activeFiltersCount = filters.categories.length + filters.tags.length + 
                            (filters.priceRange.min > 0 ? 1 : 0) + 
                            (filters.priceRange.max < 1000 ? 1 : 0) +
                            (filters.search.trim() !== '' ? 1 : 0);

  return (
    <div className={`bg-white border-b border-gray-200 sticky top-0 z-40 ${className}`}>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden p-4 border-b border-gray-100">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-900 transition-colors duration-150"
          aria-expanded={isOpen}
          aria-controls="filters-panel"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      <div 
        id="filters-panel"
        className={`${isOpen ? 'block' : 'hidden'} lg:block`}
      >
        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <label htmlFor="search" className="block text-sm font-medium text-neutral-900">
              Search Products
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by name, description..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
            />
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-900">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-600"
                      aria-describedby={`category-${category}`}
                    />
                    <span 
                      id={`category-${category}`}
                      className="text-sm text-neutral-700"
                    >
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {uniqueTags.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-900">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {uniqueTags.slice(0, 10).map((tag) => (
                  <label
                    key={tag}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.tags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-600"
                      aria-describedby={`tag-${tag}`}
                    />
                    <span 
                      id={`tag-${tag}`}
                      className="text-sm text-neutral-700"
                    >
                      {tag}
                    </span>
                  </label>
                ))}
                {uniqueTags.length > 10 && (
                  <span className="text-xs text-neutral-500">
                    +{uniqueTags.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-900">
              Price Range
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label htmlFor="min-price" className="sr-only">Minimum price</label>
                <input
                  id="min-price"
                  type="number"
                  placeholder="Min"
                  min="0"
                  value={filters.priceRange.min || ''}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                />
              </div>
              <DollarSign className="w-4 h-4 text-neutral-500" />
              <div className="flex-1">
                <label htmlFor="max-price" className="sr-only">Maximum price</label>
                <input
                  id="max-price"
                  type="number"
                  placeholder="Max"
                  min="0"
                  value={filters.priceRange.max || ''}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors duration-150"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
