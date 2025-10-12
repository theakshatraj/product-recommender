"""
Content-Based Recommendation Algorithm

Implements content-based filtering using product features (category, price, tags)
with TF-IDF vectors and cosine similarity.
"""

import numpy as np
import pandas as pd
from typing import List, Tuple, Optional, Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
from ..database.models import Product, UserInteraction
import pickle


class ContentBasedRecommender:
    """
    Content-based recommendation engine using product features.
    
    Features extracted:
    - Category (one-hot encoded)
    - Price (normalized to 0-1 range)
    - Tags (TF-IDF vectors)
    """
    
    def __init__(self, db: Session):
        """
        Initialize the content-based recommender.
        
        Args:
            db: Database session for fetching product data
        """
        self.db = db
        self.product_ids = []
        self.feature_matrix = None
        self.similarity_matrix = None
        self.product_id_to_idx = {}
        self.idx_to_product_id = {}
        
        # Feature extractors
        self.tfidf_vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        self.category_encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
        self.price_scaler = MinMaxScaler()
        
        # Weights for different feature types
        self.category_weight = 0.4
        self.price_weight = 0.2
        self.tags_weight = 0.4
    
    def build_feature_matrix(self) -> np.ndarray:
        """
        Build feature matrix for all products.
        
        Returns:
            Feature matrix where each row represents a product
        """
        # Fetch all products from database
        products = self.db.query(Product).all()
        
        if not products:
            return np.array([])
        
        self.product_ids = [p.id for p in products]
        
        # Create mappings between product IDs and matrix indices
        self.product_id_to_idx = {pid: idx for idx, pid in enumerate(self.product_ids)}
        self.idx_to_product_id = {idx: pid for idx, pid in enumerate(self.product_ids)}
        
        # Extract features
        categories = [[p.category] for p in products]
        prices = [[p.price] for p in products]
        tags = [self._process_tags(p.tags) for p in products]
        
        # 1. Category features (one-hot encoding)
        category_features = self.category_encoder.fit_transform(categories)
        
        # 2. Price features (normalized)
        price_features = self.price_scaler.fit_transform(prices)
        
        # 3. Tags features (TF-IDF)
        tags_features = self.tfidf_vectorizer.fit_transform(tags).toarray()
        
        # Combine all features with weights
        weighted_category = category_features * self.category_weight
        weighted_price = price_features * self.price_weight
        weighted_tags = tags_features * self.tags_weight
        
        # Concatenate all features
        feature_matrix = np.hstack([
            weighted_category,
            weighted_price,
            weighted_tags
        ])
        
        return feature_matrix
    
    def _process_tags(self, tags: Optional[List[str]]) -> str:
        """
        Process product tags into a single string for TF-IDF.
        
        Args:
            tags: List of tags or None
            
        Returns:
            Space-separated string of tags
        """
        if tags is None or not tags:
            return ""
        
        # Join tags into a single string
        if isinstance(tags, list):
            return " ".join(tags)
        elif isinstance(tags, str):
            return tags
        
        return ""
    
    def fit(self):
        """
        Train the content-based model by building feature matrix and similarity matrix.
        """
        # Build feature matrix
        self.feature_matrix = self.build_feature_matrix()
        
        if self.feature_matrix.size == 0:
            return
        
        # Calculate similarity matrix
        self.calculate_similarity_matrix()
    
    def calculate_similarity_matrix(self):
        """
        Calculate product-product similarity matrix using cosine similarity.
        """
        if self.feature_matrix is not None and self.feature_matrix.size > 0:
            # Calculate cosine similarity between all products
            self.similarity_matrix = cosine_similarity(self.feature_matrix)
    
    def get_similar_products(self, product_id: int, n_recommendations: int = 5) -> List[Tuple[int, float]]:
        """
        Get products similar to a given product based on content features.
        
        Args:
            product_id: Target product ID
            n_recommendations: Number of similar products to return
            
        Returns:
            List of tuples (product_id, similarity_score)
        """
        if self.similarity_matrix is None or self.similarity_matrix.size == 0:
            return []
        
        # Check if product exists in our matrix
        if product_id not in self.product_id_to_idx:
            return []
        
        product_idx = self.product_id_to_idx[product_id]
        
        # Get similarity scores for this product with all other products
        similarity_scores = self.similarity_matrix[product_idx]
        
        # Get indices of top similar products (excluding the product itself)
        # argsort returns indices in ascending order, so we reverse it
        similar_indices = np.argsort(similarity_scores)[::-1][1:n_recommendations+1]
        
        # Build list of (product_id, score) tuples
        recommendations = []
        for idx in similar_indices:
            similar_product_id = self.idx_to_product_id[idx]
            similarity_score = similarity_scores[idx]
            recommendations.append((similar_product_id, float(similarity_score)))
        
        return recommendations
    
    def get_recommendations_for_user(self, user_id: int, n_recommendations: int = 10) -> List[Tuple[int, float]]:
        """
        Get product recommendations for a user based on their interaction history.
        
        Finds products similar to those the user has interacted with positively.
        
        Args:
            user_id: Target user ID
            n_recommendations: Number of recommendations to return
            
        Returns:
            List of tuples (product_id, score)
        """
        if self.similarity_matrix is None or self.similarity_matrix.size == 0:
            return []
        
        # Get user's past interactions
        user_interactions = self.db.query(UserInteraction).filter(
            UserInteraction.user_id == user_id
        ).all()
        
        if not user_interactions:
            # New user - return popular or random products
            return self._get_popular_products(n_recommendations)
        
        # Calculate aggregate scores for all products based on user's interaction history
        product_scores = {}
        interacted_product_ids = set()
        
        for interaction in user_interactions:
            product_id = interaction.product_id
            interaction_score = interaction.interaction_score
            
            # Track products user already interacted with
            interacted_product_ids.add(product_id)
            
            # Get similar products for this interacted product
            similar_products = self.get_similar_products(product_id, n_recommendations * 3)
            
            # Weight similar products by the user's interaction score with the source product
            for similar_product_id, similarity_score in similar_products:
                # Skip products user already interacted with
                if similar_product_id in interacted_product_ids:
                    continue
                
                # Calculate weighted score
                weighted_score = similarity_score * interaction_score
                
                if similar_product_id in product_scores:
                    product_scores[similar_product_id] += weighted_score
                else:
                    product_scores[similar_product_id] = weighted_score
        
        # If no recommendations found, return popular products
        if not product_scores:
            return self._get_popular_products(n_recommendations, exclude_ids=list(interacted_product_ids))
        
        # Sort by score and return top N
        sorted_products = sorted(product_scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_products[:n_recommendations]
    
    def _get_popular_products(self, n_recommendations: int = 10, 
                             exclude_ids: Optional[List[int]] = None) -> List[Tuple[int, float]]:
        """
        Get popular products as fallback.
        
        Args:
            n_recommendations: Number of products to return
            exclude_ids: Product IDs to exclude
            
        Returns:
            List of tuples (product_id, score)
        """
        # Get products ordered by interaction count
        from sqlalchemy import func
        
        query = self.db.query(
            Product.id,
            func.count(UserInteraction.id).label('interaction_count')
        ).outerjoin(UserInteraction).group_by(Product.id)
        
        if exclude_ids:
            query = query.filter(~Product.id.in_(exclude_ids))
        
        popular_products = query.order_by(func.count(UserInteraction.id).desc()).limit(n_recommendations).all()
        
        # Normalize scores
        if not popular_products:
            return []
        
        max_count = max(count for _, count in popular_products)
        if max_count == 0:
            max_count = 1
        
        return [(pid, float(count / max_count)) for pid, count in popular_products]
    
    def get_recommendations(self, user_id: int, n_recommendations: int = 10) -> List[Tuple[int, float]]:
        """
        Get product recommendations for a user with automatic fallback handling.
        
        Args:
            user_id: User ID
            n_recommendations: Number of recommendations to return
            
        Returns:
            List of tuples (product_id, score)
        """
        # Ensure the model is trained
        if self.feature_matrix is None:
            self.fit()
        
        # Get recommendations
        recommendations = self.get_recommendations_for_user(user_id, n_recommendations)
        
        return recommendations
    
    def get_product_features_summary(self, product_id: int) -> Optional[Dict]:
        """
        Get a summary of a product's features (for debugging/explanation).
        
        Args:
            product_id: Product ID
            
        Returns:
            Dictionary containing feature information
        """
        if product_id not in self.product_id_to_idx:
            return None
        
        # Get product from database
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return None
        
        product_idx = self.product_id_to_idx[product_id]
        feature_vector = self.feature_matrix[product_idx] if self.feature_matrix is not None else None
        
        return {
            'product_id': product.id,
            'name': product.name,
            'category': product.category,
            'price': product.price,
            'tags': product.tags,
            'feature_vector_shape': feature_vector.shape if feature_vector is not None else None
        }
    
    def save_model(self, filepath: str):
        """
        Save the trained model to disk.
        
        Args:
            filepath: Path to save the model
        """
        model_data = {
            'feature_matrix': self.feature_matrix,
            'similarity_matrix': self.similarity_matrix,
            'product_ids': self.product_ids,
            'product_id_to_idx': self.product_id_to_idx,
            'idx_to_product_id': self.idx_to_product_id,
            'tfidf_vectorizer': self.tfidf_vectorizer,
            'category_encoder': self.category_encoder,
            'price_scaler': self.price_scaler
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
    
    def load_model(self, filepath: str):
        """
        Load a trained model from disk.
        
        Args:
            filepath: Path to load the model from
        """
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        self.feature_matrix = model_data['feature_matrix']
        self.similarity_matrix = model_data['similarity_matrix']
        self.product_ids = model_data['product_ids']
        self.product_id_to_idx = model_data['product_id_to_idx']
        self.idx_to_product_id = model_data['idx_to_product_id']
        self.tfidf_vectorizer = model_data['tfidf_vectorizer']
        self.category_encoder = model_data['category_encoder']
        self.price_scaler = model_data['price_scaler']
