"""
Recommendation API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Dict
from collections import defaultdict
import random

from app.database.connection import get_db
from app.database.models import User, Product, UserInteraction, InteractionType
from app.recommender.collaborative_filtering import CollaborativeFiltering

router = APIRouter(
    prefix="/recommendations",
    tags=["recommendations"]
)


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


@router.get("/{user_id}", response_model=dict)
async def get_user_recommendations(
    user_id: int,
    limit: int = Query(10, ge=1, le=20, description="Number of recommendations"),
    algorithm: str = Query("hybrid", description="Algorithm: collaborative, content_based, or hybrid"),
    cf_method: str = Query("hybrid", description="CF method: user_based, item_based, or hybrid"),
    db: Session = Depends(get_db)
):
    """
    Get personalized product recommendations for a user with LLM explanations
    
    - **user_id**: User ID
    - **limit**: Number of recommendations to return (default: 10, max: 20)
    - **algorithm**: Recommendation algorithm (collaborative, content_based, or hybrid)
    - **cf_method**: For collaborative filtering - user_based, item_based, or hybrid (default: hybrid)
    
    The collaborative filtering uses:
    - **User-based CF**: Finds top 5 similar users using cosine similarity
    - **Item-based CF**: Finds similar products based on co-interaction patterns  
    - **Hybrid CF**: Combines both (60% user-based + 40% item-based)
    - **Cold-start handling**: Falls back to popular products for new users
    """
    try:
        # Validate user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
        
        recommendations = []
        
        if algorithm == "collaborative":
            recommendations = calculate_collaborative_recommendations(user_id, db, limit, method=cf_method)
        elif algorithm == "content_based":
            recommendations = calculate_content_based_recommendations(user_id, db, limit)
        else:  # hybrid
            collab_recs = calculate_collaborative_recommendations(user_id, db, limit, method=cf_method)
            content_recs = calculate_content_based_recommendations(user_id, db, limit)
            
            # Combine and deduplicate
            seen_products = set()
            for rec in collab_recs + content_recs:
                if rec["product"].id not in seen_products:
                    recommendations.append(rec)
                    seen_products.add(rec["product"].id)
            
            recommendations = recommendations[:limit]
        
        # If no recommendations, return popular products
        if not recommendations:
            popular_products = db.query(
                Product,
                func.count(UserInteraction.id).label('interaction_count')
            ).join(UserInteraction).group_by(Product.id).order_by(
                func.count(UserInteraction.id).desc()
            ).limit(limit).all()
            
            recommendations = [
                {
                    "product": product,
                    "score": float(count),
                    "reason": "popular",
                    "details": f"This product has {count} interactions from other users"
                }
                for product, count in popular_products
            ]
        
        # Format response with LLM explanations
        recommendations_list = [
            {
                "product_id": rec["product"].id,
                "name": rec["product"].name,
                "description": rec["product"].description,
                "category": rec["product"].category,
                "price": rec["product"].price,
                "image_url": rec["product"].image_url,
                "tags": rec["product"].tags,
                "recommendation_score": rec["score"],
                "explanation": generate_llm_explanation(
                    rec["product"],
                    rec["reason"],
                    rec["details"]
                )
            }
            for rec in recommendations
        ]
        
        return {
            "user_id": user_id,
            "username": user.username,
            "algorithm": algorithm,
            "cf_method": cf_method if algorithm in ["collaborative", "hybrid"] else None,
            "total": len(recommendations_list),
            "recommendations": recommendations_list
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")


@router.get("/product/{product_id}/similar", response_model=dict)
async def get_similar_products(
    product_id: int,
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """
    Get similar products based on a specific product
    
    - **product_id**: Product ID
    - **limit**: Number of similar products to return (default: 5, max: 20)
    """
    try:
        # Validate product exists
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found")
        
        # Find similar products (same category, exclude current product)
        similar_products = db.query(Product).filter(
            and_(
                Product.category == product.category,
                Product.id != product_id
            )
        ).limit(limit).all()
        
        similar_list = [
            {
                "product_id": p.id,
                "name": p.name,
                "description": p.description,
                "category": p.category,
                "price": p.price,
                "image_url": p.image_url,
                "tags": p.tags,
                "similarity_reason": f"Same category: {p.category}",
                "explanation": f"Similar to '{product.name}' - both are in {p.category} category"
            }
            for p in similar_products
        ]
        
        return {
            "product_id": product_id,
            "product_name": product.name,
            "category": product.category,
            "total": len(similar_list),
            "similar_products": similar_list
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding similar products: {str(e)}")

