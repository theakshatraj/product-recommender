"""
Collaborative Filtering Recommendation Algorithm

Implements user-based, item-based, and hybrid collaborative filtering
with cold-start handling.
"""

import numpy as np
import pandas as pd
from typing import List, Tuple, Optional
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
from ..database.models import UserInteraction, Product, User


class CollaborativeFiltering:
    """
    Collaborative filtering recommendation engine with hybrid approach.
    
    Combines user-based and item-based collaborative filtering for better recommendations.
    Includes fallback mechanism for cold-start users.
    """
    
    def __init__(self, db: Session):
        """
        Initialize the collaborative filtering engine.
        
        Args:
            db: Database session for fetching interaction data
        """
        self.db = db
        self.user_item_matrix = None
        self.user_similarity_matrix = None
        self.item_similarity_matrix = None
        self.user_id_to_idx = {}
        self.idx_to_user_id = {}
        self.product_id_to_idx = {}
        self.idx_to_product_id = {}
        
        # Hybrid weights
        self.user_based_weight = 0.6
        self.item_based_weight = 0.4
        
    def build_user_item_matrix(self) -> pd.DataFrame:
        """
        Build user-item interaction matrix from database.
        
        Returns:
            DataFrame with users as rows, products as columns, and interaction scores as values
        """
        # Fetch all interactions from database
        interactions = self.db.query(UserInteraction).all()
        
        if not interactions:
            return pd.DataFrame()
        
        # Create list of interaction data
        interaction_data = []
        for interaction in interactions:
            interaction_data.append({
                'user_id': interaction.user_id,
                'product_id': interaction.product_id,
                'score': interaction.interaction_score
            })
        
        # Convert to DataFrame
        df = pd.DataFrame(interaction_data)
        
        # Aggregate scores for same user-product pairs (sum up multiple interactions)
        df = df.groupby(['user_id', 'product_id'])['score'].sum().reset_index()
        
        # Create pivot table (user-item matrix)
        user_item_matrix = df.pivot(index='user_id', columns='product_id', values='score').fillna(0)
        
        return user_item_matrix
    
    def fit(self):
        """
        Train the collaborative filtering model by building matrices and calculating similarities.
        """
        # Build user-item matrix
        self.user_item_matrix = self.build_user_item_matrix()
        
        if self.user_item_matrix.empty:
            return
        
        # Create mappings between IDs and matrix indices
        self.user_id_to_idx = {user_id: idx for idx, user_id in enumerate(self.user_item_matrix.index)}
        self.idx_to_user_id = {idx: user_id for user_id, idx in self.user_id_to_idx.items()}
        self.product_id_to_idx = {prod_id: idx for idx, prod_id in enumerate(self.user_item_matrix.columns)}
        self.idx_to_product_id = {idx: prod_id for prod_id, idx in self.product_id_to_idx.items()}
        
        # Calculate similarity matrices
        self.calculate_user_similarity()
        self.calculate_item_similarity()
    
    def calculate_user_similarity(self):
        """
        Calculate user-user similarity matrix using cosine similarity.
        """
        if self.user_item_matrix is not None and not self.user_item_matrix.empty:
            # Calculate cosine similarity between users
            self.user_similarity_matrix = cosine_similarity(self.user_item_matrix)
    
    def calculate_item_similarity(self):
        """
        Calculate item-item similarity matrix using cosine similarity based on co-interaction patterns.
        """
        if self.user_item_matrix is not None and not self.user_item_matrix.empty:
            # Calculate cosine similarity between items (transpose the matrix)
            self.item_similarity_matrix = cosine_similarity(self.user_item_matrix.T)
    
    def get_user_based_recommendations(self, user_id: int, n_recommendations: int = 10) -> List[Tuple[int, float]]:
        """
        Get recommendations using user-based collaborative filtering.
        
        Args:
            user_id: Target user ID
            n_recommendations: Number of recommendations to return
            
        Returns:
            List of tuples (product_id, score)
        """
        if self.user_item_matrix is None or self.user_item_matrix.empty:
            return []
        
        # Check if user exists in the matrix
        if user_id not in self.user_id_to_idx:
            return []
        
        user_idx = self.user_id_to_idx[user_id]
        
        # Get similarity scores for this user with all other users
        user_similarities = self.user_similarity_matrix[user_idx]
        
        # Get top 5 similar users (excluding the user itself)
        similar_user_indices = np.argsort(user_similarities)[::-1][1:6]  # Top 5 excluding self
        
        # Get products the current user has interacted with
        user_interacted_products = set(
            self.user_item_matrix.columns[self.user_item_matrix.iloc[user_idx] > 0]
        )
        
        # Calculate weighted scores for products from similar users
        product_scores = {}
        for similar_user_idx in similar_user_indices:
            similarity_score = user_similarities[similar_user_idx]
            
            # Skip if similarity is too low or negative
            if similarity_score <= 0:
                continue
            
            similar_user_id = self.idx_to_user_id[similar_user_idx]
            similar_user_products = self.user_item_matrix.iloc[similar_user_idx]
            
            # Add scores for products the similar user interacted with
            for product_idx, interaction_score in enumerate(similar_user_products):
                if interaction_score > 0:
                    product_id = self.idx_to_product_id[product_idx]
                    
                    # Skip if current user already interacted with this product
                    if product_id in user_interacted_products:
                        continue
                    
                    # Weight the interaction score by user similarity
                    weighted_score = similarity_score * interaction_score
                    
                    if product_id in product_scores:
                        product_scores[product_id] += weighted_score
                    else:
                        product_scores[product_id] = weighted_score
        
        # Sort by score and return top N
        sorted_products = sorted(product_scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_products[:n_recommendations]
    
    def get_item_based_recommendations(self, user_id: int, n_recommendations: int = 10) -> List[Tuple[int, float]]:
        """
        Get recommendations using item-based collaborative filtering.
        
        Args:
            user_id: Target user ID
            n_recommendations: Number of recommendations to return
            
        Returns:
            List of tuples (product_id, score)
        """
        if self.user_item_matrix is None or self.user_item_matrix.empty:
            return []
        
        # Check if user exists in the matrix
        if user_id not in self.user_id_to_idx:
            return []
        
        user_idx = self.user_id_to_idx[user_id]
        
        # Get products the user has interacted with and their scores
        user_interactions = self.user_item_matrix.iloc[user_idx]
        interacted_product_indices = np.where(user_interactions > 0)[0]
        
        if len(interacted_product_indices) == 0:
            return []
        
        # Calculate scores for all products based on similarity to interacted products
        product_scores = {}
        
        for interacted_idx in interacted_product_indices:
            interacted_product_id = self.idx_to_product_id[interacted_idx]
            user_interaction_score = user_interactions.iloc[interacted_idx]
            
            # Get similarity scores for this product with all other products
            item_similarities = self.item_similarity_matrix[interacted_idx]
            
            # Calculate weighted scores for similar products
            for product_idx, similarity_score in enumerate(item_similarities):
                # Skip the same product or low similarity
                if product_idx == interacted_idx or similarity_score <= 0:
                    continue
                
                product_id = self.idx_to_product_id[product_idx]
                
                # Skip if user already interacted with this product
                if user_interactions.iloc[product_idx] > 0:
                    continue
                
                # Weight similarity by user's interaction score with the source product
                weighted_score = similarity_score * user_interaction_score
                
                if product_id in product_scores:
                    product_scores[product_id] += weighted_score
                else:
                    product_scores[product_id] = weighted_score
        
        # Sort by score and return top N
        sorted_products = sorted(product_scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_products[:n_recommendations]
    
    def get_hybrid_recommendations(self, user_id: int, n_recommendations: int = 10) -> List[Tuple[int, float]]:
        """
        Get recommendations using hybrid approach (60% user-based, 40% item-based).
        
        Args:
            user_id: Target user ID
            n_recommendations: Number of recommendations to return
            
        Returns:
            List of tuples (product_id, score)
        """
        # Get recommendations from both methods
        user_based_recs = self.get_user_based_recommendations(user_id, n_recommendations * 2)
        item_based_recs = self.get_item_based_recommendations(user_id, n_recommendations * 2)
        
        # Combine scores with weights
        combined_scores = {}
        
        # Add user-based recommendations with weight
        for product_id, score in user_based_recs:
            combined_scores[product_id] = score * self.user_based_weight
        
        # Add item-based recommendations with weight
        for product_id, score in item_based_recs:
            if product_id in combined_scores:
                combined_scores[product_id] += score * self.item_based_weight
            else:
                combined_scores[product_id] = score * self.item_based_weight
        
        # Sort by combined score and return top N
        sorted_products = sorted(combined_scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_products[:n_recommendations]
    
    def get_popular_products(self, n_recommendations: int = 10, exclude_product_ids: Optional[List[int]] = None) -> List[Tuple[int, float]]:
        """
        Get popular products as fallback for cold-start users.
        
        Popularity is calculated based on total interaction scores.
        
        Args:
            n_recommendations: Number of recommendations to return
            exclude_product_ids: List of product IDs to exclude (already interacted with)
            
        Returns:
            List of tuples (product_id, popularity_score)
        """
        if self.user_item_matrix is None or self.user_item_matrix.empty:
            # If no interaction data, get products from database
            products = self.db.query(Product).limit(n_recommendations).all()
            return [(p.id, 1.0) for p in products]
        
        # Calculate popularity score for each product (sum of all interactions)
        product_popularity = self.user_item_matrix.sum(axis=0)
        
        # Convert to list of tuples
        popular_products = [(int(product_id), float(score)) 
                          for product_id, score in product_popularity.items()]
        
        # Exclude products user has already interacted with
        if exclude_product_ids:
            exclude_set = set(exclude_product_ids)
            popular_products = [(pid, score) for pid, score in popular_products 
                              if pid not in exclude_set]
        
        # Sort by popularity and return top N
        sorted_products = sorted(popular_products, key=lambda x: x[1], reverse=True)
        return sorted_products[:n_recommendations]
    
    def get_recommendations(self, user_id: int, n_recommendations: int = 10, 
                          method: str = 'hybrid') -> List[Tuple[int, float]]:
        """
        Get product recommendations for a user with automatic cold-start handling.
        
        Args:
            user_id: User ID
            n_recommendations: Number of recommendations to return (default: 10)
            method: Recommendation method ('user_based', 'item_based', or 'hybrid')
            
        Returns:
            List of tuples (product_id, score)
        """
        # Ensure the model is trained
        if self.user_item_matrix is None:
            self.fit()
        
        # Check if user exists and has interactions
        is_cold_start = (self.user_item_matrix is None or 
                        self.user_item_matrix.empty or 
                        user_id not in self.user_id_to_idx)
        
        if is_cold_start:
            # Cold-start user: return popular products
            return self.get_popular_products(n_recommendations)
        
        # Get recommendations based on method
        if method == 'user_based':
            recommendations = self.get_user_based_recommendations(user_id, n_recommendations)
        elif method == 'item_based':
            recommendations = self.get_item_based_recommendations(user_id, n_recommendations)
        else:  # hybrid (default)
            recommendations = self.get_hybrid_recommendations(user_id, n_recommendations)
        
        # If no recommendations found, fall back to popular products
        if not recommendations:
            # Get products user has already interacted with to exclude them
            user_idx = self.user_id_to_idx.get(user_id)
            exclude_ids = []
            if user_idx is not None:
                user_interactions = self.user_item_matrix.iloc[user_idx]
                exclude_ids = [int(pid) for pid in user_interactions[user_interactions > 0].index]
            
            recommendations = self.get_popular_products(n_recommendations, exclude_ids)
        
        return recommendations
