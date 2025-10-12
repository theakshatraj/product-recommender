"""
User Interaction API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database.connection import get_db
from app.database.models import UserInteraction, User, Product, InteractionType

router = APIRouter(
    prefix="/interactions",
    tags=["interactions"]
)


@router.post("/", response_model=dict, status_code=201)
async def create_interaction(
    user_id: int,
    product_id: int,
    interaction_type: str,
    db: Session = Depends(get_db)
):
    """
    Log a new user interaction with a product
    
    - **user_id**: User ID
    - **product_id**: Product ID
    - **interaction_type**: Type of interaction (view, click, cart_add, purchase)
    """
    try:
        # Validate user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
        
        # Validate product exists
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found")
        
        # Validate interaction type
        try:
            interaction_type_enum = InteractionType[interaction_type.upper()]
        except KeyError:
            valid_types = [t.value for t in InteractionType]
            raise HTTPException(
                status_code=400,
                detail=f"Invalid interaction type. Must be one of: {', '.join(valid_types)}"
            )
        
        # Create interaction
        interaction = UserInteraction(
            user_id=user_id,
            product_id=product_id,
            interaction_type=interaction_type_enum,
            interaction_score=interaction_type_enum.score,
            timestamp=datetime.utcnow()
        )
        
        db.add(interaction)
        db.commit()
        db.refresh(interaction)
        
        return {
            "id": interaction.id,
            "user_id": interaction.user_id,
            "product_id": interaction.product_id,
            "interaction_type": interaction.interaction_type.value,
            "interaction_score": interaction.interaction_score,
            "timestamp": interaction.timestamp.isoformat(),
            "message": "Interaction logged successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating interaction: {str(e)}")


@router.get("/user/{user_id}", response_model=dict)
async def get_user_interactions(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    interaction_type: Optional[str] = Query(None, description="Filter by interaction type"),
    db: Session = Depends(get_db)
):
    """
    Get all interactions for a specific user
    
    - **user_id**: User ID
    - **skip**: Number of items to skip (default: 0)
    - **limit**: Maximum number of items to return (default: 20, max: 100)
    - **interaction_type**: Filter by interaction type (optional)
    """
    try:
        # Validate user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
        
        query = db.query(UserInteraction, Product).join(
            Product, UserInteraction.product_id == Product.id
        ).filter(UserInteraction.user_id == user_id)
        
        # Apply interaction type filter if provided
        if interaction_type:
            try:
                interaction_type_enum = InteractionType[interaction_type.upper()]
                query = query.filter(UserInteraction.interaction_type == interaction_type_enum)
            except KeyError:
                valid_types = [t.value for t in InteractionType]
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid interaction type. Must be one of: {', '.join(valid_types)}"
                )
        
        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        interactions = query.order_by(
            UserInteraction.timestamp.desc()
        ).offset(skip).limit(limit).all()
        
        interactions_list = [
            {
                "id": interaction.id,
                "interaction_type": interaction.interaction_type.value,
                "interaction_score": interaction.interaction_score,
                "timestamp": interaction.timestamp.isoformat(),
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
            "total": total,
            "skip": skip,
            "limit": limit,
            "interactions": interactions_list
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving interactions: {str(e)}")


@router.get("/product/{product_id}", response_model=dict)
async def get_product_interactions(
    product_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get all interactions for a specific product
    
    - **product_id**: Product ID
    - **skip**: Number of items to skip (default: 0)
    - **limit**: Maximum number of items to return (default: 20, max: 100)
    """
    try:
        # Validate product exists
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found")
        
        query = db.query(UserInteraction).filter(UserInteraction.product_id == product_id)
        total = query.count()
        
        interactions = query.order_by(
            UserInteraction.timestamp.desc()
        ).offset(skip).limit(limit).all()
        
        interactions_list = [
            {
                "id": interaction.id,
                "user_id": interaction.user_id,
                "interaction_type": interaction.interaction_type.value,
                "interaction_score": interaction.interaction_score,
                "timestamp": interaction.timestamp.isoformat()
            }
            for interaction in interactions
        ]
        
        return {
            "product_id": product_id,
            "product_name": product.name,
            "total": total,
            "skip": skip,
            "limit": limit,
            "interactions": interactions_list
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving product interactions: {str(e)}")

