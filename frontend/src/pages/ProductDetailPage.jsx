import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProduct, getSimilarProducts } from '../services/api';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const productData = await getProduct(id);
      const similar = await getSimilarProducts(id);
      setProduct(productData);
      setSimilarProducts(similar);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-detail-page">
      <Header />
      <div className="container">
        <div className="product-detail">
          <div className="product-image-large">
            <img 
              src={product.image_url || 'https://via.placeholder.com/500'} 
              alt={product.name} 
            />
          </div>
          <div className="product-info-detail">
            <h1>{product.name}</h1>
            <p className="category">{product.category}</p>
            <p className="price">${product.price.toFixed(2)}</p>
            <p className="description">{product.description}</p>
            {product.tags && (
              <div className="tags">
                {product.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            )}
            <button className="btn btn-primary btn-large">Add to Cart</button>
          </div>
        </div>

        {similarProducts.length > 0 && (
          <div className="similar-products-section">
            <h2>Similar Products</h2>
            <div className="products-grid">
              {similarProducts.map(item => (
                <ProductCard key={item.product_id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;

