import { Link } from 'react-router-dom';
import { Star, Eye, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product, showRating = true }) => {
  // Generate a random rating for demo purposes if not provided
  const rating = product.average_rating || (Math.random() * 2 + 3).toFixed(1);
  const reviewCount = product.review_count || Math.floor(Math.random() * 100) + 10;

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
            <button className="bg-white p-2 rounded-full shadow-lg hover:bg-purple-50 transition-colors">
              <Eye className="w-4 h-4 text-gray-700" />
            </button>
            <button className="bg-white p-2 rounded-full shadow-lg hover:bg-purple-50 transition-colors">
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

        {showRating && (
          <div className="flex items-center space-x-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-1">
              {rating} ({reviewCount})
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </div>
          <Link
            to={`/products/${product.id}`}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

