import { Link } from 'react-router-dom';
import './RecommendationCard.css';

const RecommendationCard = ({ recommendation }) => {
  const { product, score, explanation } = recommendation;
  
  return (
    <div className="recommendation-card">
      <div className="recommendation-header">
        <div className="product-image">
          <img 
            src={product.image_url || 'https://via.placeholder.com/150'} 
            alt={product.name} 
          />
        </div>
        <div className="product-basic-info">
          <h3>{product.name}</h3>
          <p className="product-price">${product.price.toFixed(2)}</p>
          <div className="match-score">
            Match: {(score * 100).toFixed(0)}%
          </div>
        </div>
      </div>
      {explanation && (
        <div className="recommendation-explanation">
          <p className="explanation-label">Why recommended:</p>
          <p className="explanation-text">{explanation}</p>
        </div>
      )}
      <Link to={`/products/${product.id}`} className="btn btn-primary">
        View Product
      </Link>
    </div>
  );
};

export default RecommendationCard;

