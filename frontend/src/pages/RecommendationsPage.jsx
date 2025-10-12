import { useState, useEffect } from 'react';
import Header from '../components/Header';
import RecommendationCard from '../components/RecommendationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getUserRecommendations } from '../services/api';
import './RecommendationsPage.css';

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(1); // Mock user ID

  useEffect(() => {
    fetchRecommendations();
  }, [userId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const data = await getUserRecommendations(userId);
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommendations-page">
      <Header />
      <div className="container">
        <h1>Recommendations For You</h1>
        <p className="subtitle">
          Based on your browsing history and preferences
        </p>
        
        {loading && <LoadingSpinner />}
        
        {!loading && recommendations.length === 0 && (
          <div className="no-recommendations">
            <p>No recommendations available yet. Browse more products!</p>
          </div>
        )}
        
        {!loading && recommendations.length > 0 && (
          <div className="recommendations-list">
            {recommendations.map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;

