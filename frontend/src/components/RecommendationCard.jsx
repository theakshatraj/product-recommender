import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Eye, Star, Heart, ShoppingCart, Award, Target, Zap, Info, ArrowRight, Bot } from 'lucide-react';

const ScoreBar = ({ score, label = "Recommendation Score" }) => {
  const getScoreLevel = (score) => {
    if (score >= 0.8) return { level: 'High', color: 'bg-green-500', textColor: 'text-green-700' };
    if (score >= 0.6) return { level: 'Medium', color: 'bg-accent-500', textColor: 'text-accent-700' };
    return { level: 'Low', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  const { level, color, textColor } = getScoreLevel(score);
  const percentage = Math.round(score * 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-neutral-900">{label}</span>
        <div className="flex items-center space-x-2">
          <span className={`font-semibold ${textColor}`}>{level}</span>
          <span className="text-neutral-700 font-mono">{percentage}%</span>
        </div>
      </div>
      
      <div className="relative">
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${color} transition-all duration-700 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Score markers */}
        <div className="flex justify-between mt-1">
          <span className="text-xs text-neutral-500">0</span>
          <span className="text-xs text-neutral-500">25</span>
          <span className="text-xs text-neutral-500">50</span>
          <span className="text-xs text-neutral-500">75</span>
          <span className="text-xs text-neutral-500">100</span>
        </div>
      </div>
    </div>
  );
};

const FactorBreakdown = ({ factors }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!factors || Object.keys(factors).length === 0) return null;

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded"
        aria-expanded={isExpanded}
        aria-controls="factor-breakdown"
      >
        <Info className="w-4 h-4" />
        <span>Why this score?</span>
        <ArrowRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>
      
      {isExpanded && (
        <div 
          id="factor-breakdown"
          className="bg-neutral-50 rounded-lg p-4 border border-neutral-200"
        >
          <h5 className="font-medium text-neutral-900 mb-3">Scoring Factors</h5>
          <div className="space-y-3">
            {Object.entries(factors).map(([factor, value]) => (
              <div key={factor} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-700 capitalize">
                    {factor.replace(/_/g, ' ')}
                  </span>
                  <span className="text-neutral-600 font-mono">
                    {Math.round(value * 100)}%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-1.5">
                  <div 
                    className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RecommendationCard = ({ recommendation, rank }) => {
  const { product, score, explanation, factors } = recommendation;
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(false);

  if (!product) return null;

  const getScoreIcon = (score) => {
    if (score >= 0.8) return <Award className="w-5 h-5 text-green-600" />;
    if (score >= 0.6) return <Target className="w-5 h-5 text-accent-600" />;
    return <Zap className="w-5 h-5 text-red-600" />;
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-accent-100 text-accent-800';
    return 'bg-red-100 text-red-800';
  };

  // Truncate explanation to 3 lines
  const truncatedExplanation = explanation && explanation.length > 150 
    ? explanation.substring(0, 150) + '...'
    : explanation;

  return (
    <article className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2">
      {/* Header with rank and score */}
      <div className="p-6 border-b border-neutral-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-lg flex items-center justify-center text-lg font-bold">
              #{rank}
            </div>
            <div>
              <h3 className="text-xl font-heading font-semibold text-neutral-900 leading-tight">
                {product.name}
              </h3>
              <p className="text-neutral-700 text-sm">{product.category}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getScoreBadgeColor(score)}`}>
              {getScoreIcon(score)}
              <span>{Math.round(score * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Score Bar */}
        <ScoreBar score={score} />
      </div>

      {/* Product Details */}
      <div className="p-6 border-b border-neutral-100">
        <div className="flex items-start space-x-4">
          <img 
            src={product.image_url || 'https://via.placeholder.com/80x80/2563eb/ffffff?text=Product'} 
            alt={product.name}
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-neutral-700 text-sm leading-relaxed line-clamp-2 mb-3">
              {product.description}
            </p>
            <div className="text-2xl font-bold text-neutral-900">
              ${product.price.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* LLM Explanation - Prominent Section */}
      {explanation && (
        <div className="p-6 border-b border-neutral-100">
          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-heading font-semibold text-neutral-900">Why we recommend this</h4>
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                    LLM generated
                  </span>
                </div>
                <p className="text-neutral-700 leading-relaxed text-sm">
                  {isExplanationExpanded ? explanation : truncatedExplanation}
                </p>
                {explanation.length > 150 && (
                  <button
                    onClick={() => setIsExplanationExpanded(!isExplanationExpanded)}
                    className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded"
                  >
                    {isExplanationExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scoring Factors */}
      <div className="p-6 border-b border-neutral-100">
        <FactorBreakdown factors={factors} />
      </div>

      {/* Action Buttons */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-3">
          <Link
            to={`/products/${product.id}`}
            className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </Link>
          
          <button className="flex items-center justify-center space-x-2 bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-colors">
            <ShoppingCart className="w-4 h-4" />
            <span>Cart</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-colors">
            <Heart className="w-4 h-4" />
            <span>Buy</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default RecommendationCard;