"""
Recommendation Service Layer

Combines collaborative and content-based filtering with business rules,
logging, and performance metrics.
"""

import time
import logging
from typing import List, Dict, Tuple, Optional, Set
from collections import defaultdict, Counter
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database.models import Product, UserInteraction, InteractionType
from ..recommender.collaborative_filtering import CollaborativeFiltering
from ..recommender.content_based import ContentBasedRecommender

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RecommendationResult:
    """
    Structured recommendation result with product details and scoring information.
    """
    
    def __init__(
        self,
        product_id: int,
        product_name: str,
        product_category: str,
        product_price: float,
        product_image_url: Optional[str],
        product_description: str,
        product_tags: Optional[List[str]],
        recommendation_score: float,
        reason_factors: Dict[str, float]
    ):
        self.product_id = product_id
        self.product_name = product_name
        self.product_category = product_category
        self.product_price = product_price
        self.product_image_url = product_image_url
        self.product_description = product_description
        self.product_tags = product_tags
        self.recommendation_score = recommendation_score
        self.reason_factors = reason_factors
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "product_id": self.product_id,
            "product_details": {
                "name": self.product_name,
                "category": self.product_category,
                "price": self.product_price,
                "image_url": self.product_image_url,
                "description": self.product_description,
                "tags": self.product_tags
            },
            "recommendation_score": round(self.recommendation_score, 4),
            "reason_factors": {k: round(v, 4) for k, v in self.reason_factors.items()}
        }


class RecommendationService:
    """
    Hybrid recommendation service combining collaborative and content-based filtering
    with business rules and performance tracking.
    """
    
    def __init__(self, db: Session):
        """
        Initialize recommendation service.
        
        Args:
            db: Database session
        """
        self.db = db
        self.collaborative_filter = CollaborativeFiltering(db)
        self.content_based_filter = ContentBasedRecommender(db)
        
        # Weights for hybrid recommendation
        self.collaborative_weight = 0.6
        self.content_based_weight = 0.4
        
        # Business rule parameters
        self.category_boost_factor = 1.3  # 30% boost for preferred categories
        self.max_products_per_category = 2  # Diversity constraint
        self.diversity_penalty = 0.8  # Penalty for exceeding category limit
        
        # Performance tracking
        self.metrics = {
            "total_requests": 0,
            "avg_response_time": 0.0,
            "cache_hits": 0
        }
        
        logger.info("RecommendationService initialized")
    
    def train_models(self):
        """
        Train both collaborative and content-based models.
        This should be called periodically or when significant data changes occur.
        """
        start_time = time.time()
        
        logger.info("Training collaborative filtering model...")
        self.collaborative_filter.fit()
        
        logger.info("Training content-based filtering model...")
        self.content_based_filter.fit()
        
        training_time = time.time() - start_time
        logger.info(f"Model training completed in {training_time:.2f} seconds")
        
        return training_time
    
    def get_purchased_product_ids(self, user_id: int) -> Set[int]:
        """
        Get set of product IDs that user has already purchased.
        
        Args:
            user_id: User ID
            
        Returns:
            Set of purchased product IDs
        """
        purchased_interactions = self.db.query(UserInteraction).filter(
            UserInteraction.user_id == user_id,
            UserInteraction.interaction_type == InteractionType.PURCHASE
        ).all()
        
        return {interaction.product_id for interaction in purchased_interactions}
    
    def get_user_preferred_categories(self, user_id: int, top_n: int = 3) -> Dict[str, int]:
        """
        Identify user's preferred categories based on interaction history.
        
        Args:
            user_id: User ID
            top_n: Number of top categories to return
            
        Returns:
            Dictionary mapping category names to interaction counts
        """
        # Get user's interactions with category information
        interactions = self.db.query(
            Product.category,
            func.sum(UserInteraction.interaction_score).label('total_score')
        ).join(
            UserInteraction, UserInteraction.product_id == Product.id
        ).filter(
            UserInteraction.user_id == user_id
        ).group_by(
            Product.category
        ).order_by(
            func.sum(UserInteraction.interaction_score).desc()
        ).limit(top_n).all()
        
        return {category: float(score) for category, score in interactions}
    
    def get_hybrid_recommendations(
        self,
        user_id: int,
        n_recommendations: int = 20
    ) -> List[Tuple[int, float, Dict[str, float]]]:
        """
        Get hybrid recommendations combining collaborative and content-based filtering.
        
        Args:
            user_id: User ID
            n_recommendations: Number of recommendations to generate (before filtering)
            
        Returns:
            List of tuples (product_id, combined_score, score_components)
        """
        logger.info(f"Generating hybrid recommendations for user {user_id}")
        
        # Get recommendations from both methods
        collab_recs = self.collaborative_filter.get_recommendations(
            user_id, n_recommendations, method='hybrid'
        )
        content_recs = self.content_based_filter.get_recommendations(
            user_id, n_recommendations
        )
        
        # Convert to dictionaries for easier combination
        collab_scores = {pid: score for pid, score in collab_recs}
        content_scores = {pid: score for pid, score in content_recs}
        
        # Get all unique product IDs
        all_product_ids = set(collab_scores.keys()) | set(content_scores.keys())
        
        # Normalize scores to [0, 1] range
        max_collab = max(collab_scores.values()) if collab_scores else 1.0
        max_content = max(content_scores.values()) if content_scores else 1.0
        
        # Combine scores with weights
        hybrid_scores = []
        for product_id in all_product_ids:
            collab_score = collab_scores.get(product_id, 0) / max_collab
            content_score = content_scores.get(product_id, 0) / max_content
            
            combined_score = (
                collab_score * self.collaborative_weight +
                content_score * self.content_based_weight
            )
            
            score_components = {
                'collaborative_score': collab_score * self.collaborative_weight,
                'content_based_score': content_score * self.content_based_weight,
                'combined_base_score': combined_score
            }
            
            hybrid_scores.append((product_id, combined_score, score_components))
        
        # Sort by combined score
        hybrid_scores.sort(key=lambda x: x[1], reverse=True)
        
        logger.info(f"Generated {len(hybrid_scores)} hybrid recommendations")
        return hybrid_scores
    
    def apply_business_rules(
        self,
        user_id: int,
        recommendations: List[Tuple[int, float, Dict[str, float]]],
        n_final: int = 10
    ) -> List[Tuple[int, float, Dict[str, float]]]:
        """
        Apply business rules to recommendations:
        - Filter out purchased items
        - Boost preferred categories
        - Apply diversity constraints
        
        Args:
            user_id: User ID
            recommendations: List of (product_id, score, components)
            n_final: Final number of recommendations to return
            
        Returns:
            Filtered and adjusted recommendations
        """
        logger.info(f"Applying business rules for user {user_id}")
        
        # Rule 1: Filter out already purchased items
        purchased_ids = self.get_purchased_product_ids(user_id)
        logger.info(f"Filtering {len(purchased_ids)} purchased products")
        
        filtered_recs = [
            (pid, score, components) 
            for pid, score, components in recommendations 
            if pid not in purchased_ids
        ]
        
        # Rule 2: Boost recommendations from user's preferred categories
        preferred_categories = self.get_user_preferred_categories(user_id)
        logger.info(f"User's preferred categories: {list(preferred_categories.keys())}")
        
        # Get product categories for all recommended products
        product_ids = [pid for pid, _, _ in filtered_recs]
        products = self.db.query(Product).filter(Product.id.in_(product_ids)).all()
        product_category_map = {p.id: p.category for p in products}
        
        # Apply category boost
        boosted_recs = []
        for product_id, score, components in filtered_recs:
            category = product_category_map.get(product_id)
            
            if category in preferred_categories:
                category_boost = self.category_boost_factor
                boosted_score = score * category_boost
                components['category_boost'] = category_boost
                logger.debug(f"Product {product_id} boosted by {category_boost}x (category: {category})")
            else:
                boosted_score = score
                components['category_boost'] = 1.0
            
            boosted_recs.append((product_id, boosted_score, components))
        
        # Sort by boosted score
        boosted_recs.sort(key=lambda x: x[1], reverse=True)
        
        # Rule 3: Apply diversity - max N products per category in top results
        logger.info(f"Applying diversity constraint (max {self.max_products_per_category} per category)")
        
        diverse_recs = []
        category_counts = defaultdict(int)
        
        for product_id, score, components in boosted_recs:
            category = product_category_map.get(product_id)
            
            if category_counts[category] < self.max_products_per_category:
                # Within diversity limit
                diverse_recs.append((product_id, score, components))
                category_counts[category] += 1
                components['diversity_penalty'] = 1.0
            else:
                # Exceeded category limit - apply penalty but still include
                penalized_score = score * self.diversity_penalty
                diverse_recs.append((product_id, penalized_score, components))
                components['diversity_penalty'] = self.diversity_penalty
            
            # Stop when we have enough recommendations
            if len(diverse_recs) >= n_final * 2:
                break
        
        # Final sort by adjusted score
        diverse_recs.sort(key=lambda x: x[1], reverse=True)
        
        logger.info(f"Final recommendations after business rules: {len(diverse_recs[:n_final])}")
        return diverse_recs[:n_final]
    
    def get_recommendations(
        self,
        user_id: int,
        n_recommendations: int = 10,
        apply_rules: bool = True
    ) -> List[RecommendationResult]:
        """
        Get personalized recommendations for a user with full business logic.
        
        Args:
            user_id: User ID
            n_recommendations: Number of recommendations to return
            apply_rules: Whether to apply business rules
            
        Returns:
            List of RecommendationResult objects
        """
        start_time = time.time()
        self.metrics["total_requests"] += 1
        
        logger.info(f"Getting recommendations for user {user_id} (n={n_recommendations})")
        
        try:
            # Ensure models are trained
            if self.collaborative_filter.user_item_matrix is None:
                logger.info("Models not trained, training now...")
                self.train_models()
            
            # Get hybrid recommendations (request more to account for filtering)
            hybrid_recs = self.get_hybrid_recommendations(user_id, n_recommendations * 3)
            
            if not hybrid_recs:
                logger.warning(f"No recommendations found for user {user_id}")
                return []
            
            # Apply business rules if requested
            if apply_rules:
                final_recs = self.apply_business_rules(user_id, hybrid_recs, n_recommendations)
            else:
                final_recs = hybrid_recs[:n_recommendations]
            
            # Fetch product details and create result objects
            product_ids = [pid for pid, _, _ in final_recs]
            products = self.db.query(Product).filter(Product.id.in_(product_ids)).all()
            product_map = {p.id: p for p in products}
            
            results = []
            for product_id, final_score, score_components in final_recs:
                product = product_map.get(product_id)
                
                if not product:
                    logger.warning(f"Product {product_id} not found in database")
                    continue
                
                # Update final score in components
                score_components['final_score'] = final_score
                
                result = RecommendationResult(
                    product_id=product.id,
                    product_name=product.name,
                    product_category=product.category,
                    product_price=product.price,
                    product_image_url=product.image_url,
                    product_description=product.description,
                    product_tags=product.tags,
                    recommendation_score=final_score,
                    reason_factors=score_components
                )
                
                results.append(result)
            
            # Performance tracking
            response_time = time.time() - start_time
            self._update_metrics(response_time)
            
            logger.info(
                f"Recommendation request completed in {response_time:.3f}s "
                f"(returned {len(results)} recommendations)"
            )
            
            return results
        
        except Exception as e:
            logger.error(f"Error generating recommendations for user {user_id}: {str(e)}", exc_info=True)
            raise
    
    def get_similar_products(
        self,
        product_id: int,
        n_recommendations: int = 5
    ) -> List[RecommendationResult]:
        """
        Get products similar to a given product (content-based only).
        
        Args:
            product_id: Product ID
            n_recommendations: Number of recommendations to return
            
        Returns:
            List of RecommendationResult objects
        """
        start_time = time.time()
        
        logger.info(f"Getting similar products to product {product_id}")
        
        try:
            # Ensure content-based model is trained
            if self.content_based_filter.feature_matrix is None:
                logger.info("Content-based model not trained, training now...")
                self.content_based_filter.fit()
            
            # Get similar products
            similar_products = self.content_based_filter.get_similar_products(
                product_id, n_recommendations
            )
            
            if not similar_products:
                logger.warning(f"No similar products found for product {product_id}")
                return []
            
            # Fetch product details
            product_ids = [pid for pid, _ in similar_products]
            products = self.db.query(Product).filter(Product.id.in_(product_ids)).all()
            product_map = {p.id: p for p in products}
            
            results = []
            for similar_id, similarity_score in similar_products:
                product = product_map.get(similar_id)
                
                if not product:
                    continue
                
                reason_factors = {
                    'content_similarity': similarity_score,
                    'final_score': similarity_score
                }
                
                result = RecommendationResult(
                    product_id=product.id,
                    product_name=product.name,
                    product_category=product.category,
                    product_price=product.price,
                    product_image_url=product.image_url,
                    product_description=product.description,
                    product_tags=product.tags,
                    recommendation_score=similarity_score,
                    reason_factors=reason_factors
                )
                
                results.append(result)
            
            response_time = time.time() - start_time
            logger.info(f"Similar products request completed in {response_time:.3f}s")
            
            return results
        
        except Exception as e:
            logger.error(f"Error getting similar products for {product_id}: {str(e)}", exc_info=True)
            raise
    
    def _update_metrics(self, response_time: float):
        """
        Update performance metrics.
        
        Args:
            response_time: Response time in seconds
        """
        total = self.metrics["total_requests"]
        current_avg = self.metrics["avg_response_time"]
        
        # Calculate running average
        self.metrics["avg_response_time"] = (
            (current_avg * (total - 1) + response_time) / total
        )
    
    def get_metrics(self) -> Dict:
        """
        Get performance metrics.
        
        Returns:
            Dictionary containing performance metrics
        """
        return {
            "total_requests": self.metrics["total_requests"],
            "avg_response_time_seconds": round(self.metrics["avg_response_time"], 3),
            "cache_hits": self.metrics["cache_hits"]
        }
    
    def reset_metrics(self):
        """Reset performance metrics."""
        self.metrics = {
            "total_requests": 0,
            "avg_response_time": 0.0,
            "cache_hits": 0
        }
        logger.info("Performance metrics reset")
    
    def explain_recommendation(
        self,
        user_id: int,
        product_id: int
    ) -> Optional[Dict]:
        """
        Explain why a product was recommended to a user.
        
        Args:
            user_id: User ID
            product_id: Product ID
            
        Returns:
            Dictionary containing explanation details
        """
        logger.info(f"Explaining recommendation: user={user_id}, product={product_id}")
        
        try:
            # Get product details
            product = self.db.query(Product).filter(Product.id == product_id).first()
            if not product:
                return None
            
            # Get user's preferred categories
            preferred_categories = self.get_user_preferred_categories(user_id)
            
            # Check if product is in preferred category
            in_preferred_category = product.category in preferred_categories
            
            # Get user's interaction history
            user_interactions = self.db.query(UserInteraction).filter(
                UserInteraction.user_id == user_id
            ).all()
            
            interaction_count = len(user_interactions)
            
            explanation = {
                "product_id": product_id,
                "product_name": product.name,
                "product_category": product.category,
                "user_id": user_id,
                "user_interaction_count": interaction_count,
                "in_preferred_category": in_preferred_category,
                "preferred_categories": list(preferred_categories.keys()),
                "recommendation_factors": [
                    f"Based on {interaction_count} user interactions",
                    f"Category: {product.category}",
                ]
            }
            
            if in_preferred_category:
                explanation["recommendation_factors"].append(
                    f"Matches your preference for {product.category}"
                )
            
            return explanation
        
        except Exception as e:
            logger.error(f"Error explaining recommendation: {str(e)}", exc_info=True)
            return None

