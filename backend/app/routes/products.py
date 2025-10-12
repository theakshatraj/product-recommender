"""
Product API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database.connection import get_db
from app.database.models import Product as DBProduct
from app.models.product import Product, ProductCreate

router = APIRouter(
    prefix="/products",
    tags=["products"]
)


@router.get("/", response_model=dict)
async def get_products(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of items to return"),
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    db: Session = Depends(get_db)
):
    """
    Get all products with pagination and optional filters
    
    - **skip**: Number of items to skip (default: 0)
    - **limit**: Maximum number of items to return (default: 10, max: 100)
    - **category**: Filter by category (optional)
    - **min_price**: Minimum price filter (optional)
    - **max_price**: Maximum price filter (optional)
    """
    try:
        query = db.query(DBProduct)
        
        # Apply filters
        if category:
            query = query.filter(DBProduct.category == category)
        if min_price is not None:
            query = query.filter(DBProduct.price >= min_price)
        if max_price is not None:
            query = query.filter(DBProduct.price <= max_price)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        products = query.offset(skip).limit(limit).all()
        
        # Convert to dict
        products_list = [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "category": p.category,
                "price": p.price,
                "image_url": p.image_url,
                "tags": p.tags,
                "created_at": p.created_at.isoformat() if p.created_at else None
            }
            for p in products
        ]
        
        return {
            "total": total,
            "skip": skip,
            "limit": limit,
            "products": products_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving products: {str(e)}")


@router.get("/category/{category}", response_model=dict)
async def get_products_by_category(
    category: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get products by category with pagination
    
    - **category**: Category name
    - **skip**: Number of items to skip (default: 0)
    - **limit**: Maximum number of items to return (default: 10, max: 100)
    """
    try:
        query = db.query(DBProduct).filter(DBProduct.category == category)
        total = query.count()
        
        if total == 0:
            raise HTTPException(status_code=404, detail=f"No products found in category: {category}")
        
        products = query.offset(skip).limit(limit).all()
        
        products_list = [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "category": p.category,
                "price": p.price,
                "image_url": p.image_url,
                "tags": p.tags,
                "created_at": p.created_at.isoformat() if p.created_at else None
            }
            for p in products
        ]
        
        return {
            "category": category,
            "total": total,
            "skip": skip,
            "limit": limit,
            "products": products_list
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving products: {str(e)}")


@router.get("/{product_id}", response_model=dict)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """
    Get a specific product by ID
    
    - **product_id**: Product ID
    """
    try:
        product = db.query(DBProduct).filter(DBProduct.id == product_id).first()
        
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found")
        
        return {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "category": product.category,
            "price": product.price,
            "image_url": product.image_url,
            "tags": product.tags,
            "created_at": product.created_at.isoformat() if product.created_at else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving product: {str(e)}")


@router.get("/categories/list", response_model=dict)
async def get_categories(db: Session = Depends(get_db)):
    """
    Get list of all available product categories
    """
    try:
        categories = db.query(DBProduct.category).distinct().all()
        category_list = [cat[0] for cat in categories]
        
        return {
            "categories": category_list,
            "total": len(category_list)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving categories: {str(e)}")

