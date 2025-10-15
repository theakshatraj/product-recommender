"""
FastAPI Main Application
E-commerce Product Recommender System

This module provides the main FastAPI application for the product recommendation
system, including database initialization, middleware configuration, and route
registration.

Key Features:
- Database initialization and connection management
- CORS middleware for cross-origin requests
- Comprehensive API documentation with Swagger/ReDoc
- Health check endpoints for monitoring
- Structured logging for debugging and monitoring

API Endpoints:
- /: Root endpoint with API information
- /health: Health check endpoint
- /docs: Swagger UI documentation
- /redoc: ReDoc documentation
- /products: Product management endpoints
- /users: User management endpoints
- /interactions: User interaction tracking
- /recommendations: Basic recommendation endpoints
- /api/recommendations: Enhanced recommendation endpoints with LLM
- /analytics: Analytics and metrics endpoints

Author: Product Recommender Team
Version: 1.0.0
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import logging
from typing import Dict, Any

# Import database initialization
from app.database.connection import init_db, engine
from app.database import models

# Import routers
from app.routes import products, users, interactions, recommendations
from app.routes import recommendations_enhanced, analytics

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    
    This function handles the application lifecycle, including database
    initialization, connection management, and graceful shutdown.
    
    Startup Process:
    1. Initialize database tables and connections
    2. Verify database connectivity
    3. Log startup completion
    
    Shutdown Process:
    1. Close database connections
    2. Clean up resources
    3. Log shutdown completion
    """
    # Startup: Initialize database
    logger.info("🚀 Starting up application...")
    logger.info("📊 Initializing database...")
    
    try:
        init_db()
        logger.info("✓ Database initialized successfully!")
        logger.info("✓ Application startup complete")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("👋 Shutting down application...")
    try:
        engine.dispose()
        logger.info("✓ Database connections closed")
        logger.info("✓ Application shutdown complete")
    except Exception as e:
        logger.error(f"❌ Error during shutdown: {e}")


app = FastAPI(
    title="Product Recommender API",
    description="E-commerce product recommendation system with LLM explanations",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Middleware to log all HTTP requests with timing information.
    
    This middleware logs:
    - Request method and URL
    - Client IP address
    - Response status code
    - Processing time
    - Error details (if any)
    """
    start_time = time.time()
    
    # Log request
    logger.info(f"📥 {request.method} {request.url.path} from {request.client.host}")
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Log response
        logger.info(f"📤 {request.method} {request.url.path} -> {response.status_code} ({process_time:.3f}s)")
        
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(f"❌ {request.method} {request.url.path} -> ERROR: {str(e)} ({process_time:.3f}s)")
        raise

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with logging
logger.info("🔗 Registering API routes...")
app.include_router(products.router)
app.include_router(users.router)
app.include_router(interactions.router)
app.include_router(recommendations.router)
app.include_router(recommendations_enhanced.router)
app.include_router(analytics.router)
logger.info("✓ All routes registered successfully")


@app.get("/", response_model=Dict[str, Any])
async def root():
    """
    Root endpoint providing API information and available endpoints.
    
    Returns:
        Dict containing API information, version, documentation links,
        and available endpoint paths.
    """
    logger.info("📋 Root endpoint accessed")
    return {
        "message": "Product Recommender API is running",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
        "endpoints": {
            "products": "/products",
            "users": "/users",
            "interactions": "/interactions",
            "recommendations": "/recommendations",
            "recommendations_enhanced": "/api/recommendations",
            "analytics": "/analytics"
        },
        "features": [
            "Hybrid recommendation algorithm",
            "LLM-powered explanations",
            "Business rules engine",
            "Performance metrics",
            "Real-time analytics"
        ]
    }


@app.get("/health", response_model=Dict[str, Any])
async def health_check():
    """
    Health check endpoint for monitoring and load balancer health checks.
    
    This endpoint provides:
    - Application status
    - Database connectivity
    - System health metrics
    - Service availability
    
    Returns:
        Dict containing health status and system information.
    """
    logger.info("🏥 Health check requested")
    
    try:
        # Check database connectivity
        from app.database.connection import engine
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        db_status = "connected"
        logger.info("✓ Database health check passed")
    except Exception as e:
        db_status = f"error: {str(e)}"
        logger.error(f"❌ Database health check failed: {e}")
    
    return {
        "status": "healthy",
        "database": db_status,
        "timestamp": time.time(),
        "version": "1.0.0",
        "uptime": "running"
    }

