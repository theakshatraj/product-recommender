import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        <img 
          src={product.image_url || 'https://via.placeholder.com/300'} 
          alt={product.name} 
        />
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <Link to={`/products/${product.id}`} className="btn btn-primary">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;

