"""
Analytics API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from typing import List, Dict, Optional
from datetime import datetime, timedelta

from app.database.connection import get_db
from app.database.models import User, Product, UserInteraction, InteractionType

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)


@router.get("/user/{user_id}", response_model=dict)
async def get_user_analytics(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get comprehensive analytics for a specific user
    
    - **user_id**: User ID
    """
    try:
        # Validate user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
        
        # Get interaction statistics
        total_interactions = db.query(UserInteraction).filter(
            UserInteraction.user_id == user_id
        ).count()
        
        # Get interaction breakdown by type
        interaction_breakdown = db.query(
            UserInteraction.interaction_type,
            func.count(UserInteraction.id).label('count')
        ).filter(
            UserInteraction.user_id == user_id
        ).group_by(UserInteraction.interaction_type).all()
        
        # Get category preferences
        category_stats = db.query(
            Product.category,
            func.count(UserInteraction.id).label('interaction_count'),
            func.sum(UserInteraction.interaction_score).label('total_score')
        ).join(
            Product, UserInteraction.product_id == Product.id
        ).filter(
            UserInteraction.user_id == user_id
        ).group_by(Product.category).order_by(
            func.sum(UserInteraction.interaction_score).desc()
        ).all()
        
        # Get recent activity (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_interactions = db.query(UserInteraction).filter(
            and_(
                UserInteraction.user_id == user_id,
                UserInteraction.timestamp >= thirty_days_ago
            )
        ).count()
        
        return {
            "user_id": user_id,
            "username": user.username,
            "total_interactions": total_interactions,
            "recent_interactions_30_days": recent_interactions,
            "interaction_breakdown": [
                {
                    "type": interaction_type.value,
                    "count": count
                }
                for interaction_type, count in interaction_breakdown
            ],
            "category_preferences": [
                {
                    "category": category,
                    "interaction_count": count,
                    "total_score": float(total_score)
                }
                for category, count, total_score in category_stats
            ],
            "most_active_category": category_stats[0][0] if category_stats else None,
            "analytics_generated_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving user analytics: {str(e)}"
        )


@router.get("/user/{user_id}/categories", response_model=dict)
async def get_category_heatmap(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get category interaction heatmap for a user
    
    - **user_id**: User ID
    """
    try:
        # Validate user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
        
        # Get category interaction data
        category_data = db.query(
            Product.category,
            func.count(UserInteraction.id).label('interaction_count'),
            func.sum(UserInteraction.interaction_score).label('total_score'),
            func.avg(UserInteraction.interaction_score).label('avg_score')
        ).join(
            Product, UserInteraction.product_id == Product.id
        ).filter(
            UserInteraction.user_id == user_id
        ).group_by(Product.category).order_by(
            func.sum(UserInteraction.interaction_score).desc()
        ).all()
        
        # Calculate heatmap values (normalized 0-1)
        max_score = max([float(total_score) for _, _, total_score, _ in category_data]) if category_data else 1
        
        heatmap_data = [
            {
                "category": category,
                "interaction_count": count,
                "total_score": float(total_score),
                "avg_score": float(avg_score),
                "heatmap_value": float(total_score) / max_score if max_score > 0 else 0
            }
            for category, count, total_score, avg_score in category_data
        ]
        
        return {
            "user_id": user_id,
            "username": user.username,
            "category_heatmap": heatmap_data,
            "max_score": max_score,
            "total_categories": len(heatmap_data)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving category heatmap: {str(e)}"
        )


@router.get("/user/{user_id}/accuracy", response_model=dict)
async def get_recommendation_accuracy(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get recommendation accuracy metrics for a user
    
    - **user_id**: User ID
    """
    try:
        # Validate user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
        
        # Get user's purchase interactions
        purchases = db.query(UserInteraction).filter(
            and_(
                UserInteraction.user_id == user_id,
                UserInteraction.interaction_type == InteractionType.PURCHASE
            )
        ).all()
        
        # Get view interactions
        views = db.query(UserInteraction).filter(
            and_(
                UserInteraction.user_id == user_id,
                UserInteraction.interaction_type == InteractionType.VIEW
            )
        ).all()
        
        # Calculate basic metrics
        total_purchases = len(purchases)
        total_views = len(views)
        conversion_rate = (total_purchases / total_views * 100) if total_views > 0 else 0
        
        # Get category conversion rates
        category_conversions = {}
        for purchase in purchases:
            product = db.query(Product).filter(Product.id == purchase.product_id).first()
            if product:
                category = product.category
                if category not in category_conversions:
                    category_conversions[category] = {"purchases": 0, "views": 0}
                category_conversions[category]["purchases"] += 1
        
        for view in views:
            product = db.query(Product).filter(Product.id == view.product_id).first()
            if product:
                category = product.category
                if category not in category_conversions:
                    category_conversions[category] = {"purchases": 0, "views": 0}
                category_conversions[category]["views"] += 1
        
        # Calculate category conversion rates
        category_accuracy = [
            {
                "category": category,
                "purchases": data["purchases"],
                "views": data["views"],
                "conversion_rate": (data["purchases"] / data["views"] * 100) if data["views"] > 0 else 0
            }
            for category, data in category_conversions.items()
        ]
        
        return {
            "user_id": user_id,
            "username": user.username,
            "overall_metrics": {
                "total_purchases": total_purchases,
                "total_views": total_views,
                "conversion_rate": round(conversion_rate, 2)
            },
            "category_accuracy": category_accuracy,
            "best_performing_category": max(category_accuracy, key=lambda x: x["conversion_rate"])["category"] if category_accuracy else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving recommendation accuracy: {str(e)}"
        )


@router.get("/popular", response_model=dict)
async def get_popular_products(
    limit: int = Query(10, ge=1, le=50, description="Number of popular products"),
    db: Session = Depends(get_db)
):
    """
    Get most popular products based on interaction data
    
    - **limit**: Number of products to return
    """
    try:
        # Get popular products based on interaction count and scores
        popular_products = db.query(
            Product,
            func.count(UserInteraction.id).label('interaction_count'),
            func.sum(UserInteraction.interaction_score).label('total_score'),
            func.avg(UserInteraction.interaction_score).label('avg_score')
        ).join(
            UserInteraction, Product.id == UserInteraction.product_id
        ).group_by(Product.id).order_by(
            func.sum(UserInteraction.interaction_score).desc()
        ).limit(limit).all()
        
        products_list = []
        for product, count, total_score, avg_score in popular_products:
            products_list.append({
                "product_id": product.id,
                "name": product.name,
                "category": product.category,
                "price": product.price,
                "image_url": product.image_url,
                "description": product.description,
                "interaction_count": count,
                "total_score": float(total_score),
                "avg_score": float(avg_score),
                "popularity_rank": len(products_list) + 1
            })
        
        return {
            "total": len(products_list),
            "limit": limit,
            "popular_products": products_list
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving popular products: {str(e)}"
        )


@router.get("/user/{user_id}/timeline", response_model=dict)
async def get_user_behavior_timeline(
    user_id: int,
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Get user behavior timeline for analytics
    
    - **user_id**: User ID
    - **days**: Number of days to analyze
    """
    try:
        # Validate user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
        
        # Get interactions within the specified timeframe
        start_date = datetime.utcnow() - timedelta(days=days)
        interactions = db.query(UserInteraction).filter(
            and_(
                UserInteraction.user_id == user_id,
                UserInteraction.timestamp >= start_date
            )
        ).order_by(UserInteraction.timestamp.desc()).all()
        
        # Group interactions by day
        daily_activity = {}
        for interaction in interactions:
            day = interaction.timestamp.date().isoformat()
            if day not in daily_activity:
                daily_activity[day] = {
                    "date": day,
                    "total_interactions": 0,
                    "interaction_types": {},
                    "categories": set(),
                    "products": set()
                }
            
            daily_activity[day]["total_interactions"] += 1
            interaction_type = interaction.interaction_type.value
            daily_activity[day]["interaction_types"][interaction_type] = daily_activity[day]["interaction_types"].get(interaction_type, 0) + 1
            
            # Get product info
            product = db.query(Product).filter(Product.id == interaction.product_id).first()
            if product:
                daily_activity[day]["categories"].add(product.category)
                daily_activity[day]["products"].add(product.id)
        
        # Convert sets to lists for JSON serialization
        timeline_data = []
        for day_data in daily_activity.values():
            timeline_data.append({
                "date": day_data["date"],
                "total_interactions": day_data["total_interactions"],
                "interaction_types": day_data["interaction_types"],
                "categories_accessed": list(day_data["categories"]),
                "unique_products": len(day_data["products"])
            })
        
        # Sort by date
        timeline_data.sort(key=lambda x: x["date"])
        
        return {
            "user_id": user_id,
            "username": user.username,
            "analysis_period_days": days,
            "total_interactions": len(interactions),
            "active_days": len(timeline_data),
            "timeline": timeline_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving user timeline: {str(e)}"
        )
