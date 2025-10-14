"""
Enhanced Recommendation API Routes

Uses the RecommendationService with business rules, logging, and performance metrics.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Optional

from app.database.connection import get_db
from app.database.models import User, Product, UserInteraction
from app.services.recommendation_service import RecommendationService
from app.services.llm_service import LLMService

router = APIRouter(
    prefix="/api/recommendations",
    tags=["recommendations-enhanced"]
)


@router.get("/user/{user_id}", response_model=dict)
async def get_user_recommendations_enhanced(
    user_id: int,
    limit: int = Query(10, ge=1, le=50, description="Number of recommendations"),
    apply_rules: bool = Query(True, description="Apply business rules (purchase filter, category boost, diversity)"),
    use_llm: bool = Query(False, description="Generate LLM explanations (requires OPENAI_API_KEY)"),
    db: Session = Depends(get_db)
):
    """
    Get personalized product recommendations using hybrid filtering with business rules.
    
    **Features:**
    - Hybrid recommendation (60% collaborative + 40% content-based)
    - Filters out already purchased products
    - Boosts recommendations from user's preferred categories
    - Ensures diversity (max 2 products per category in top results)
    - Returns detailed scoring breakdown
    
    **Parameters:**
    - **user_id**: User ID
    - **limit**: Number of recommendations (1-50)
    - **apply_rules**: Whether to apply business rules
    
    **Returns:**
    - User information
    - List of recommendations with detailed scores
    - Performance metrics
    """
    try:
        # Validate user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
        
        # Initialize recommendation service
        rec_service = RecommendationService(db)
        
        # Get recommendations
        recommendations = rec_service.get_recommendations(
            user_id=user_id,
            n_recommendations=limit,
            apply_rules=apply_rules
        )
        
        if not recommendations:
            return {
                "user_id": user_id,
                "username": user.username,
                "message": "No recommendations available. This might be a new user with no interaction history.",
                "recommendations": [],
                "total": 0,
                "applied_rules": apply_rules
            }
        
        # Convert to dict format
        recommendations_list = [rec.to_dict() for rec in recommendations]
        
        # Generate LLM explanations if requested
        llm_explanations = []
        if use_llm:
            llm_service = LLMService()
            
            # Get user data for explanations
            preferred_categories = rec_service.get_user_preferred_categories(user_id)
            purchased_count = len(rec_service.get_purchased_product_ids(user_id))
            
            # Get interaction summary
            interactions = db.query(UserInteraction).filter(
                UserInteraction.user_id == user_id
            ).limit(5).all()
            
            if interactions:
                interaction_products = db.query(Product).filter(
                    Product.id.in_([i.product_id for i in interactions])
                ).all()
                interaction_summary = ", ".join([p.name for p in interaction_products[:3]])
            else:
                interaction_summary = "various products"
            
            user_data = {
                "user_id": user_id,
                "username": user.username,
                "preferred_categories": list(preferred_categories.keys()) if preferred_categories else [],
                "interaction_summary": interaction_summary,
                "purchased_count": purchased_count
            }
            
            # Generate explanation for each recommendation
            for rec in recommendations:
                product_dict = {
                    "product_id": rec.product_id,
                    "name": rec.product_name,
                    "category": rec.product_category,
                    "price": rec.product_price,
                    "description": rec.product_description,
                    "tags": rec.product_tags
                }
                
                explanation = llm_service.generate_explanation(
                    user_data=user_data,
                    product=product_dict,
                    recommendation_factors=rec.reason_factors
                )
                llm_explanations.append(explanation)
            
            # Add explanations to recommendations
            for idx, rec_dict in enumerate(recommendations_list):
                rec_dict["llm_explanation"] = llm_explanations[idx]
        
        return {
            "user_id": user_id,
            "username": user.username,
            "algorithm": "hybrid",
            "applied_rules": apply_rules,
            "use_llm": use_llm,
            "total": len(recommendations_list),
            "recommendations": recommendations_list,
            "info": {
                "collaborative_weight": rec_service.collaborative_weight,
                "content_based_weight": rec_service.content_based_weight,
                "category_boost_factor": rec_service.category_boost_factor if apply_rules else None,
                "max_products_per_category": rec_service.max_products_per_category if apply_rules else None
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating recommendations: {str(e)}"
        )


@router.get("/product/{product_id}/similar", response_model=dict)
async def get_similar_products_enhanced(
    product_id: int,
    limit: int = Query(5, ge=1, le=20, description="Number of similar products"),
    db: Session = Depends(get_db)
):
    """
    Get products similar to a given product using content-based filtering.
    
    **Features:**
    - Content-based similarity using product features
    - Category, price, and tags analysis
    - TF-IDF vectorization for text features
    - Cosine similarity calculation
    
    **Parameters:**
    - **product_id**: Product ID
    - **limit**: Number of similar products (1-20)
    
    **Returns:**
    - Source product information
    - List of similar products with similarity scores
    """
    try:
        # Validate product exists
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product with ID {product_id} not found"
            )
        
        # Initialize recommendation service
        rec_service = RecommendationService(db)
        
        # Get similar products
        similar_products = rec_service.get_similar_products(
            product_id=product_id,
            n_recommendations=limit
        )
        
        if not similar_products:
            return {
                "product_id": product_id,
                "product_name": product.name,
                "category": product.category,
                "message": "No similar products found",
                "similar_products": [],
                "total": 0
            }
        
        # Convert to dict format
        similar_list = [rec.to_dict() for rec in similar_products]
        
        return {
            "product_id": product_id,
            "product_name": product.name,
            "category": product.category,
            "price": product.price,
            "total": len(similar_list),
            "similar_products": similar_list,
            "method": "content_based_similarity"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error finding similar products: {str(e)}"
        )


@router.get("/user/{user_id}/explain/{product_id}", response_model=dict)
async def explain_recommendation(
    user_id: int,
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    Explain why a product was recommended to a user.
    
    **Parameters:**
    - **user_id**: User ID
    - **product_id**: Product ID
    
    **Returns:**
    - Detailed explanation of recommendation factors
    - User preferences
    - Product category information
    """
    try:
        # Validate user and product exist
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
        
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found")
        
        # Initialize recommendation service
        rec_service = RecommendationService(db)
        
        # Get explanation
        explanation = rec_service.explain_recommendation(
            user_id=user_id,
            product_id=product_id
        )
        
        if not explanation:
            return {
                "user_id": user_id,
                "product_id": product_id,
                "message": "Unable to generate explanation",
                "explanation": None
            }
        
        return explanation
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error explaining recommendation: {str(e)}"
        )


@router.post("/train", response_model=dict)
async def train_recommendation_models(
    db: Session = Depends(get_db)
):
    """
    Manually trigger training of recommendation models.
    
    This should be called:
    - After initial data seeding
    - After significant data changes
    - Periodically (e.g., daily/weekly)
    
    **Returns:**
    - Training status
    - Training time
    - Model statistics
    """
    try:
        # Initialize recommendation service
        rec_service = RecommendationService(db)
        
        # Train models
        training_time = rec_service.train_models()
        
        # Get some statistics
        from app.database.models import UserInteraction
        total_interactions = db.query(UserInteraction).count()
        total_users = db.query(User).count()
        total_products = db.query(Product).count()
        
        return {
            "status": "success",
            "training_time_seconds": round(training_time, 3),
            "statistics": {
                "total_users": total_users,
                "total_products": total_products,
                "total_interactions": total_interactions
            },
            "message": "Models trained successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error training models: {str(e)}"
        )


@router.get("/metrics", response_model=dict)
async def get_recommendation_metrics(
    db: Session = Depends(get_db)
):
    """
    Get recommendation service performance metrics.
    
    **Returns:**
    - Total requests processed
    - Average response time
    - Cache hit rate
    """
    try:
        # Initialize recommendation service
        rec_service = RecommendationService(db)
        
        # Get metrics
        metrics = rec_service.get_metrics()
        
        return {
            "status": "success",
            "metrics": metrics
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving metrics: {str(e)}"
        )


@router.delete("/metrics", response_model=dict)
async def reset_recommendation_metrics(
    db: Session = Depends(get_db)
):
    """
    Reset recommendation service performance metrics.
    
    **Returns:**
    - Reset confirmation
    """
    try:
        # Initialize recommendation service
        rec_service = RecommendationService(db)
        
        # Reset metrics
        rec_service.reset_metrics()
        
        return {
            "status": "success",
            "message": "Metrics reset successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error resetting metrics: {str(e)}"
        )


@router.get("/llm/metrics", response_model=dict)
async def get_llm_metrics():
    """
    Get LLM service performance metrics.
    
    **Returns:**
    - Total requests
    - API call count
    - Cache statistics
    - Average API response time
    """
    try:
        # Initialize LLM service
        llm_service = LLMService()
        
        # Get metrics
        metrics = llm_service.get_metrics()
        
        return {
            "status": "success",
            "metrics": metrics
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving LLM metrics: {str(e)}"
        )


@router.delete("/llm/cache", response_model=dict)
async def clear_llm_cache():
    """
    Clear LLM explanation cache.
    
    **Returns:**
    - Clear confirmation
    """
    try:
        # Initialize LLM service
        llm_service = LLMService()
        
        # Clear cache
        llm_service.clear_cache()
        
        return {
            "status": "success",
            "message": "LLM cache cleared successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error clearing LLM cache: {str(e)}"
        )


@router.get("/user/{user_id}/preferences", response_model=dict)
async def get_user_preferences(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get user's preference summary and interaction statistics.
    
    **Parameters:**
    - **user_id**: User ID
    
    **Returns:**
    - Preferred categories
    - Purchased products
    - Interaction statistics
    """
    try:
        # Validate user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
        
        # Initialize recommendation service
        rec_service = RecommendationService(db)
        
        # Get preferred categories
        preferred_categories = rec_service.get_user_preferred_categories(user_id)
        
        # Get purchased products
        purchased_ids = rec_service.get_purchased_product_ids(user_id)
        
        # Get interaction count
        from app.database.models import UserInteraction
        total_interactions = db.query(UserInteraction).filter(
            UserInteraction.user_id == user_id
        ).count()
        
        return {
            "user_id": user_id,
            "username": user.username,
            "preferred_categories": preferred_categories,
            "purchased_product_ids": list(purchased_ids),
            "purchased_count": len(purchased_ids),
            "total_interactions": total_interactions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving user preferences: {str(e)}"
        )

