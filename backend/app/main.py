"""
FastAPI Main Application
E-commerce Product Recommender System
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import database initialization
from app.database.connection import init_db, engine
from app.database import models

# Import routers
from app.routes import products, users, interactions, recommendations
from app.routes import recommendations_enhanced, analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup: Initialize database
    print("🚀 Starting up application...")
    print("📊 Initializing database...")
    init_db()
    print("✓ Database initialized successfully!")
    
    yield
    
    # Shutdown
    print("👋 Shutting down application...")
    engine.dispose()
    print("✓ Database connections closed")


app = FastAPI(
    title="Product Recommender API",
    description="E-commerce product recommendation system with LLM explanations",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products.router)
app.include_router(users.router)
app.include_router(interactions.router)
app.include_router(recommendations.router)
app.include_router(recommendations_enhanced.router)
app.include_router(analytics.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Product Recommender API is running",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "products": "/products",
            "users": "/users",
            "interactions": "/interactions",
            "recommendations": "/recommendations",
            "recommendations_enhanced": "/api/recommendations",
            "analytics": "/analytics"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected"
    }

