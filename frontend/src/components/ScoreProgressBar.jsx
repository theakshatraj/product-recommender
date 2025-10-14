import { useState } from 'react';

const ScoreProgressBar = ({ score, showLabels = true, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Normalize score to 0-100 range
  const normalizedScore = Math.min(Math.max((score || 0) * 100, 0), 100);
  
  // Determine score level and color
  const getScoreLevel = (score) => {
    if (score < 30) return { level: 'Low', color: 'bg-red-500' };
    if (score < 70) return { level: 'Medium', color: 'bg-accent-500' };
    return { level: 'High', color: 'bg-green-500' };
  };

  const { level, color } = getScoreLevel(normalizedScore);

  // Get background color for progress bar
  const getProgressColor = () => {
    if (normalizedScore < 30) return 'bg-red-100';
    if (normalizedScore < 70) return 'bg-accent-100';
    return 'bg-green-100';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Score Display */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-900">
          Match Score
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-900">
            {normalizedScore.toFixed(0)}%
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            normalizedScore < 30 
              ? 'bg-red-100 text-red-700' 
              : normalizedScore < 70 
                ? 'bg-accent-100 text-accent-700'
                : 'bg-green-100 text-green-700'
          }`}>
            {level}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background */}
        <div className={`w-full h-2 rounded-full ${getProgressColor()}`}>
          {/* Progress Fill */}
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
            style={{ width: `${normalizedScore}%` }}
          />
        </div>

        {/* Tick Marks */}
        {showLabels && (
          <div className="flex justify-between mt-1">
            <div className="flex flex-col items-center">
              <div className="w-px h-2 bg-neutral-300" />
              <span className="text-xs text-neutral-500 mt-1">0</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-px h-2 bg-neutral-300" />
              <span className="text-xs text-neutral-500 mt-1">25</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-px h-2 bg-neutral-300" />
              <span className="text-xs text-neutral-500 mt-1">50</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-px h-2 bg-neutral-300" />
              <span className="text-xs text-neutral-500 mt-1">75</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-px h-2 bg-neutral-300" />
              <span className="text-xs text-neutral-500 mt-1">100</span>
            </div>
          </div>
        )}

        {/* Hover Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded-md whitespace-nowrap z-10">
            Score: {normalizedScore.toFixed(1)}% ({level})
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreProgressBar;