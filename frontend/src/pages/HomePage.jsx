import { Link } from 'react-router-dom';
import Header from '../components/Header';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <Header />
      <div className="hero-section">
        <div className="container">
          <h1>Welcome to Product Recommender</h1>
          <p className="hero-subtitle">
            Discover products tailored to your preferences with AI-powered recommendations
          </p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary btn-large">
              Browse Products
            </Link>
            <Link to="/recommendations" className="btn btn-secondary btn-large">
              Get Recommendations
            </Link>
          </div>
        </div>
      </div>
      
      <div className="features-section container">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>🎯 Personalized Recommendations</h3>
            <p>Get product suggestions based on your browsing and purchase history</p>
          </div>
          <div className="feature-card">
            <h3>🤖 AI-Powered Insights</h3>
            <p>Understand why products are recommended with LLM-generated explanations</p>
          </div>
          <div className="feature-card">
            <h3>🔍 Smart Search</h3>
            <p>Find similar products based on features and characteristics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

