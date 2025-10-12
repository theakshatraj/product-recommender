"""
Product Pydantic Models
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_url: Optional[str] = None
    tags: Optional[List[str]] = []


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

