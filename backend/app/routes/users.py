"""
User API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database.connection import get_db
from app.database.models import User as DBUser, UserInteraction, Product

router = APIRouter(
    prefix="/users",
    tags=["users"]
)


@router.get("/", response_model=List[dict])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Get all users with pagination
    
    - **skip**: Number of items to skip (default: 0)
    - **limit**: Maximum number of items to return (default: 100, max: 1000)
    """
    try:
        users = db.query(DBUser).offset(skip).limit(limit).all()
        
        users_list = [
            {
                "id": user.id,
                "name": user.username,
                "username": user.username,
                "email": user.email,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
            for user in users
        ]
        
        return users_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving users: {str(e)}")


@router.get("/{user_id}", response_model=dict)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Get user details by ID
    
    - **user_id**: User ID
    """
    try:
        user = db.query(DBUser).filter(DBUser.id == user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
        
        # Get interaction statistics
        interaction_count = db.query(func.count(UserInteraction.id)).filter(
            UserInteraction.user_id == user_id
        ).scalar()
        
        # Get unique products interacted with
        unique_products = db.query(func.count(func.distinct(UserInteraction.product_id))).filter(
            UserInteraction.user_id == user_id
        ).scalar()
        
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "stats": {
                "total_interactions": interaction_count,
                "unique_products_interacted": unique_products
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving user: {str(e)}")


@router.get("/{user_id}/interactions", response_model=dict)
async def get_user_interactions(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get user's interaction history with products
    
    - **user_id**: User ID
    - **skip**: Number of items to skip (default: 0)
    - **limit**: Maximum number of items to return (default: 20, max: 100)
    """
    try:
        # Check if user exists
        user = db.query(DBUser).filter(DBUser.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
        
        # Get interactions with product details
        query = db.query(UserInteraction, Product).join(
            Product, UserInteraction.product_id == Product.id
        ).filter(UserInteraction.user_id == user_id).order_by(
            UserInteraction.timestamp.desc()
        )
        
        total = db.query(func.count(UserInteraction.id)).filter(
            UserInteraction.user_id == user_id
        ).scalar()
        
        interactions = query.offset(skip).limit(limit).all()
        
        interactions_list = [
            {
                "id": interaction.id,
                "interaction_type": interaction.interaction_type.value,
                "interaction_score": interaction.interaction_score,
                "timestamp": interaction.timestamp.isoformat() if interaction.timestamp else None,
                "product": {
                    "id": product.id,
                    "name": product.name,
                    "category": product.category,
                    "price": product.price,
                    "image_url": product.image_url
                }
            }
            for interaction, product in interactions
        ]
        
        return {
            "user_id": user_id,
            "username": user.username,
            "total": total,
            "skip": skip,
            "limit": limit,
            "interactions": interactions_list
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving user interactions: {str(e)}")


@router.get("/{user_id}/preferences", response_model=dict)
async def get_user_preferences(user_id: int, db: Session = Depends(get_db)):
    """
    Get user's category preferences based on interaction history
    
    - **user_id**: User ID
    """
    try:
        # Check if user exists
        user = db.query(DBUser).filter(DBUser.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
        
        # Get category preferences with scores
        category_scores = db.query(
            Product.category,
            func.count(UserInteraction.id).label('interaction_count'),
            func.sum(UserInteraction.interaction_score).label('total_score')
        ).join(
            UserInteraction, Product.id == UserInteraction.product_id
        ).filter(
            UserInteraction.user_id == user_id
        ).group_by(Product.category).order_by(
            func.sum(UserInteraction.interaction_score).desc()
        ).all()
        
        preferences = [
            {
                "category": category,
                "interaction_count": count,
                "total_score": float(score),
                "avg_score": float(score) / count
            }
            for category, count, score in category_scores
        ]
        
        return {
            "user_id": user_id,
            "username": user.username,
            "preferences": preferences
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving user preferences: {str(e)}")

