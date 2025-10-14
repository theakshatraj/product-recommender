"""
Recommendation API Routes

Updated to use RecommendationService and LLMService with async processing.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Dict
import asyncio
from concurrent.futures import ThreadPoolExecutor

from app.database.connection import get_db
from app.database.models import User, Product, UserInteraction, InteractionType
from app.services.recommendation_service import RecommendationService
from app.services.llm_service import LLMService

router = APIRouter(
    prefix="/recommendations",
    tags=["recommendations"]
)

# Thread pool for async LLM processing
executor = ThreadPoolExecutor(max_workers=10)


def calculate_collaborative_recommendations(user_id: int, db: Session, limit: int = 5, method: str = 'hybrid') -> List[Dict]:
    """
    Calculate collaborative filtering recommendations using the advanced CF engine.
    
    Supports user-based, item-based, and hybrid collaborative filtering with
    cosine similarity and automatic cold-start handling.
    
    Args:
        user_id: Target user ID
        db: Database session
        limit: Number of recommendations to return
        method: 'user_based', 'item_based', or 'hybrid' (default)
    
    Returns:
        List of recommendation dictionaries
    """
    try:
        # Initialize and train the collaborative filtering engine
        cf_engine = CollaborativeFiltering(db)
        cf_engine.fit()
        
        # Get recommendations using the specified method
        cf_recommendations = cf_engine.get_recommendations(
            user_id=user_id,
            n_recommendations=limit,
            method=method
        )
        
        if not cf_recommendations:
            return []
        
        # Fetch product details for recommendations
        product_ids = [product_id for product_id, score in cf_recommendations]
        products = db.query(Product).filter(Product.id.in_(product_ids)).all()
        
        # Create product ID to product mapping
        product_map = {p.id: p for p in products}
        
        # Build recommendation list with scores
        recommendations = []
        for product_id, score in cf_recommendations:
            if product_id in product_map:
                product = product_map[product_id]
                
                # Determine recommendation reason
                if method == 'user_based':
                    reason = "collaborative_filtering_user"
                    details = "Recommended by users with similar preferences"
                elif method == 'item_based':
                    reason = "collaborative_filtering_item"
                    details = "Similar to products you've shown interest in"
                else:  # hybrid
                    reason = "collaborative_filtering_hybrid"
                    details = "Based on both similar users and similar products"
                
                recommendations.append({
                    "product": product,
                    "score": float(score),
                    "reason": reason,
                    "details": details
                })
        
        return recommendations
        
    except Exception as e:
        print(f"Error in collaborative filtering: {e}")
        return []


def calculate_content_based_recommendations(user_id: int, db: Session, limit: int = 5) -> List[Dict]:
    """
    Calculate content-based recommendations
    Recommend products from categories user has shown interest in
    """
    # Get user's category preferences
    category_preferences = db.query(
        Product.category,
        func.sum(UserInteraction.interaction_score).label('total_score')
    ).join(
        UserInteraction, Product.id == UserInteraction.product_id
    ).filter(
        UserInteraction.user_id == user_id
    ).group_by(Product.category).order_by(
        func.sum(UserInteraction.interaction_score).desc()
    ).all()
    
    if not category_preferences:
        return []
    
    # Get products user has already interacted with
    user_product_ids = db.query(UserInteraction.product_id).filter(
        UserInteraction.user_id == user_id
    ).distinct().all()
    user_product_ids = {p_id for (p_id,) in user_product_ids}
    
    recommendations = []
    
    # Get recommendations from preferred categories
    for category, score in category_preferences[:3]:  # Top 3 categories
        products = db.query(Product).filter(
            and_(
                Product.category == category,
                ~Product.id.in_(user_product_ids)
            )
        ).order_by(func.random()).limit(limit).all()
        
        for product in products:
            recommendations.append({
                "product": product,
                "score": float(score),
                "reason": "content_based",
                "details": f"Based on your interest in {category}"
            })
    
    # Sort by score and limit
    recommendations.sort(key=lambda x: x["score"], reverse=True)
    return recommendations[:limit]


def generate_llm_explanation(product: Product, reason: str, details: str) -> str:
    """
    Generate explanation for recommendation
    In a real implementation, this would call OpenAI API
    For now, we'll create template-based explanations
    """
    explanations = {
        "collaborative_filtering": f"We recommend '{product.name}' because customers with similar interests have shown strong interest in this product. {details}",
        "collaborative_filtering_user": f"We recommend '{product.name}' because users with similar preferences to yours have loved this product. {details}",
        "collaborative_filtering_item": f"Based on products you've shown interest in, we think you'll love '{product.name}'. {details}",
        "collaborative_filtering_hybrid": f"We recommend '{product.name}' using our advanced matching algorithm that considers both similar users and similar products. {details}",
        "content_based": f"Based on your browsing history in {product.category}, we think you'll love '{product.name}'. {product.description[:100]}...",
        "popular": f"'{product.name}' is trending in {product.category}! {details}"
    }
    
    return explanations.get(reason, f"We think you'll like '{product.name}' - {product.description[:100]}...")


async def generate_llm_explanation_async(
    llm_service: LLMService,
    user_data: Dict,
    product_dict: Dict,
    factors: Dict
) -> str:
    """
    Asynchronously generate LLM explanation using thread pool.
    
    Args:
        llm_service: LLM service instance
        user_data: User information
        product_dict: Product details
        factors: Recommendation factors
        
    Returns:
        Generated explanation string
    """
    loop = asyncio.get_event_loop()
    explanation = await loop.run_in_executor(
        executor,
        llm_service.generate_explanation,
        user_data,
        product_dict,
        factors
    )
    return explanation


@router.get("/{user_id}", response_model=dict)
async def get_user_recommendations(
    user_id: int,
    limit: int = Query(10, ge=1, le=20, description="Number of recommendations"),
    use_llm: bool = Query(False, description="Generate AI explanations (requires OPENAI_API_KEY)"),
    apply_rules: bool = Query(True, description="Apply business rules (purchase filter, category boost, diversity)"),
    db: Session = Depends(get_db)
):
    """
    Get personalized product recommendations for a user using the Recommendation Service.
    
    **Parameters:**
    - **user_id**: User ID
    - **limit**: Number of recommendations to return (default: 10, max: 20)
    - **use_llm**: Generate AI-powered explanations (default: false)
    - **apply_rules**: Apply business rules for better recommendations (default: true)
    
    **Features:**
    - Hybrid recommendation (60% collaborative + 40% content-based)
    - Business rules: purchase filter, category boost, diversity
    - Optional AI explanations with OpenAI GPT
    - Async processing for fast response times
    - Detailed scoring breakdown
    
    **Response Format:**
    ```json
    {
      "user_id": 1,
      "recommendations": [
        {
          "product": {...},
          "score": 0.85,
          "explanation": "AI-generated text",
          "factors": {...}
        }
      ]
    }
    ```
    """
    try:
        # Validate user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
        
        # Initialize recommendation service
        rec_service = RecommendationService(db)
        
        # Get recommendations using the service
        recommendations = rec_service.get_recommendations(
            user_id=user_id,
            n_recommendations=limit,
            apply_rules=apply_rules
        )
        
        if not recommendations:
            return {
                "user_id": user_id,
                "username": user.username,
                "total": 0,
                "recommendations": [],
                "message": "No recommendations available. This might be a new user."
            }
        
        # Prepare user data for LLM explanations
        user_data = None
        llm_service = None
        
        if use_llm:
            llm_service = LLMService()
            
            # Get user context
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
        
        # Build recommendations list with async LLM processing
        recommendations_list = []
        llm_tasks = []
        
        for rec in recommendations:
            # Product details
            product_info = {
                "product_id": rec.product_id,
                "name": rec.product_name,
                "description": rec.product_description,
                "category": rec.product_category,
                "price": rec.product_price,
                "image_url": rec.product_image_url,
                "tags": rec.product_tags
            }
            
            recommendation_dict = {
                "product": product_info,
                "score": rec.recommendation_score,
                "factors": rec.reason_factors,
                "explanation": None  # Will be filled in if use_llm is True
            }
            
            recommendations_list.append(recommendation_dict)
            
            # Queue LLM explanation generation
            if use_llm and llm_service and user_data:
                product_dict = {
                    "product_id": rec.product_id,
                    "name": rec.product_name,
                    "category": rec.product_category,
                    "price": rec.product_price,
                    "description": rec.product_description,
                    "tags": rec.product_tags
                }
                
                task = generate_llm_explanation_async(
                    llm_service,
                    user_data,
                    product_dict,
                    rec.reason_factors
                )
                llm_tasks.append(task)
        
        # Wait for all LLM explanations to complete (async)
        if llm_tasks:
            explanations = await asyncio.gather(*llm_tasks)
            for idx, explanation in enumerate(explanations):
                recommendations_list[idx]["explanation"] = explanation
        
        return {
            "user_id": user_id,
            "username": user.username,
            "total": len(recommendations_list),
            "use_llm": use_llm,
            "apply_rules": apply_rules,
            "recommendations": recommendations_list
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating recommendations: {str(e)}"
        )


@router.get("/product/{product_id}/similar", response_model=dict)
async def get_similar_products(
    product_id: int,
    limit: int = Query(5, ge=1, le=20),
    use_llm: bool = Query(False, description="Generate AI explanations"),
    db: Session = Depends(get_db)
):
    """
    Get similar products based on a specific product using content-based filtering.
    
    **Parameters:**
    - **product_id**: Product ID
    - **limit**: Number of similar products to return (default: 5, max: 20)
    - **use_llm**: Generate AI-powered explanations (default: false)
    
    **Features:**
    - Content-based similarity using product features
    - Category, price, and tags analysis
    - Optional AI explanations
    - Fast async processing
    """
    try:
        # Validate product exists
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found")
        
        # Initialize recommendation service
        rec_service = RecommendationService(db)
        
        # Get similar products using content-based filtering
        similar_recs = rec_service.get_similar_products(
            product_id=product_id,
            n_recommendations=limit
        )
        
        if not similar_recs:
            return {
                "product_id": product_id,
                "product_name": product.name,
                "category": product.category,
                "total": 0,
                "similar_products": [],
                "message": "No similar products found"
            }
        
        # Initialize LLM service if needed
        llm_service = None
        llm_tasks = []
        
        if use_llm:
            llm_service = LLMService()
        
        # Build similar products list
        similar_list = []
        
        for rec in similar_recs:
            product_info = {
                "product_id": rec.product_id,
                "name": rec.product_name,
                "description": rec.product_description,
                "category": rec.product_category,
                "price": rec.product_price,
                "image_url": rec.product_image_url,
                "tags": rec.product_tags,
                "similarity_score": rec.recommendation_score,
                "similarity_reason": f"Content-based similarity: {rec.recommendation_score:.2f}",
                "explanation": None
            }
            
            similar_list.append(product_info)
            
            # Queue LLM explanation
            if use_llm and llm_service:
                # Create minimal user data for explanation
                user_data = {
                    "user_id": 0,
                    "username": "browsing_user",
                    "preferred_categories": [product.category],
                    "interaction_summary": product.name,
                    "purchased_count": 0
                }
                
                product_dict = {
                    "product_id": rec.product_id,
                    "name": rec.product_name,
                    "category": rec.product_category,
                    "price": rec.product_price,
                    "description": rec.product_description,
                    "tags": rec.product_tags
                }
                
                task = generate_llm_explanation_async(
                    llm_service,
                    user_data,
                    product_dict,
                    rec.reason_factors
                )
                llm_tasks.append(task)
        
        # Wait for LLM explanations
        if llm_tasks:
            explanations = await asyncio.gather(*llm_tasks)
            for idx, explanation in enumerate(explanations):
                similar_list[idx]["explanation"] = explanation
        
        return {
            "product_id": product_id,
            "product_name": product.name,
            "category": product.category,
            "total": len(similar_list),
            "use_llm": use_llm,
            "similar_products": similar_list
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error finding similar products: {str(e)}"
        )

