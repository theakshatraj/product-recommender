"""
SQLAlchemy Database Models
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.dialects.postgresql import JSON, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .connection import Base


class InteractionType(enum.Enum):
    """Enum for user interaction types with associated scores"""
    VIEW = "view"
    CLICK = "click"
    CART_ADD = "cart_add"
    PURCHASE = "purchase"
    
    @property
    def score(self):
        """Return the interaction score based on type"""
        scores = {
            "view": 1.0,
            "click": 2.0,
            "cart_add": 3.0,
            "purchase": 5.0
        }
        return scores.get(self.value, 1.0)


class Product(Base):
    """Product model for storing product information"""
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    price = Column(Float, nullable=False)
    image_url = Column(String(500), nullable=True)
    tags = Column(JSON, nullable=True, default=list)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    interactions = relationship("UserInteraction", back_populates="product", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Product(id={self.id}, name='{self.name}', category='{self.category}', price={self.price})>"


class User(Base):
    """User model for storing user information"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    interactions = relationship("UserInteraction", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"


class UserInteraction(Base):
    """User interaction model for tracking user behavior with products"""
    __tablename__ = "user_interactions"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    interaction_type = Column(Enum(InteractionType), nullable=False)
    interaction_score = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships
    user = relationship("User", back_populates="interactions")
    product = relationship("Product", back_populates="interactions")
    
    def __repr__(self):
        return f"<UserInteraction(id={self.id}, user_id={self.user_id}, product_id={self.product_id}, type={self.interaction_type.value}, score={self.interaction_score})>"
    
    def __init__(self, **kwargs):
        """Initialize interaction with automatic score calculation"""
        super().__init__(**kwargs)
        if self.interaction_type and not self.interaction_score:
            self.interaction_score = self.interaction_type.score

