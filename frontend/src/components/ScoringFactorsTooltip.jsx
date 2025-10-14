import { useState, useRef, useEffect } from 'react';
import { HelpCircle, TrendingUp, Tag, Users, Star } from 'lucide-react';

const ScoringFactorsTooltip = ({ factors, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Parse factors if it's a string
  const parseFactors = (factorsData) => {
    if (!factorsData) return {};
    
    if (typeof factorsData === 'string') {
      try {
        return JSON.parse(factorsData);
      } catch {
        // If parsing fails, return a default structure
        return {
          category_match: 0.3,
          user_preferences: 0.4,
          popularity: 0.2,
          diversity: 0.1
        };
      }
    }
    
    return factorsData;
  };

  const parsedFactors = parseFactors(factors);

  // Get factor details
  const getFactorDetails = (key, value) => {
    const factorInfo = {
      category_match: {
        icon: Tag,
        label: 'Category Match',
        description: 'How well this matches your preferred categories',
        color: 'text-blue-600'
      },
      user_preferences: {
        icon: Star,
        label: 'Your Preferences',
        description: 'Based on your past interactions and ratings',
        color: 'text-purple-600'
      },
      popularity: {
        icon: TrendingUp,
        label: 'Popularity',
        description: 'How popular this item is with other users',
        color: 'text-green-600'
      },
      diversity: {
        icon: Users,
        label: 'Diversity Boost',
        description: 'Helps you discover new types of products',
        color: 'text-orange-600'
      }
    };

    return factorInfo[key] || {
      icon: HelpCircle,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: 'Contribution to overall recommendation score',
      color: 'text-neutral-600'
    };
  };

  const formatWeight = (weight) => {
    return `${(weight * 100).toFixed(0)}%`;
  };

  return (
    <div className={`relative inline-block ${className}`} ref={tooltipRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-6 h-6 text-neutral-500 hover:text-primary-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-1 rounded-full"
        aria-label="Show scoring factors"
        aria-describedby="scoring-factors-tooltip"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {/* Tooltip */}
      {isOpen && (
        <div
          id="scoring-factors-tooltip"
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4"
          role="tooltip"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-heading font-semibold text-sm text-neutral-900">
              Why This Recommendation?
            </h4>
            <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
              LLM Generated
            </span>
          </div>

          {/* Factors List */}
          <div className="space-y-3">
            {Object.entries(parsedFactors).map(([key, value]) => {
              const { icon: Icon, label, description, color } = getFactorDetails(key, value);
              
              return (
                <div key={key} className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-900">
                        {label}
                      </span>
                      <span className="text-sm font-semibold text-neutral-900">
                        {formatWeight(value)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {description}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mt-2 w-full bg-neutral-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${color.replace('text-', 'bg-')}`}
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-neutral-500 text-center">
              Scores are calculated using collaborative filtering and content-based algorithms
            </p>
          </div>

          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white" />
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-200" />
        </div>
      )}
    </div>
  );
};

export default ScoringFactorsTooltip;