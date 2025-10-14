# Recommendation Service Guide

## Overview

The `RecommendationService` is a hybrid recommendation engine that combines collaborative filtering and content-based filtering with intelligent business rules to provide personalized product recommendations.

## Features

### 1. **Hybrid Recommendation Algorithm**
- **Collaborative Filtering (60% weight)**: Uses user-based and item-based collaborative filtering
- **Content-Based Filtering (40% weight)**: Analyzes product features (category, price, tags)
- Automatically normalizes scores and combines them intelligently

### 2. **Business Rules**
- **Purchase Filtering**: Excludes already purchased products from recommendations
- **Category Boosting**: Boosts recommendations from user's preferred categories by 30%
- **Diversity Constraints**: Limits to max 2 products per category in top 10 results
- **Diversity Penalty**: Applies 0.8x penalty for exceeding category limits

### 3. **Performance Tracking**
- Request count tracking
- Average response time calculation
- Cache hit metrics
- Detailed logging for debugging

### 4. **Structured Results**
The service returns `RecommendationResult` objects containing:
- Complete product details (name, category, price, image, description, tags)
- Final recommendation score
- Detailed scoring breakdown showing contribution of each component

## Architecture

```
RecommendationService
├── CollaborativeFiltering
│   ├── User-based CF
│   ├── Item-based CF
│   └── Hybrid CF (60% user + 40% item)
├── ContentBasedRecommender
│   ├── Category features (one-hot encoding)
│   ├── Price features (normalized)
│   └── Tag features (TF-IDF)
└── Business Rules Engine
    ├── Purchase filter
    ├── Category boost
    └── Diversity constraint
```

## Installation & Setup

### Prerequisites
```bash
pip install -r requirements.txt
```

Required packages:
- pandas
- numpy
- scikit-learn
- sqlalchemy
- fastapi

### Initialization

```python
from sqlalchemy.orm import Session
from app.services.recommendation_service import RecommendationService

# Create service instance
db: Session = SessionLocal()
rec_service = RecommendationService(db)

# Train models (should be done periodically)
rec_service.train_models()
```

## Usage Examples

### 1. Get Personalized Recommendations

```python
# Get top 10 recommendations for a user
recommendations = rec_service.get_recommendations(
    user_id=1,
    n_recommendations=10,
    apply_rules=True  # Apply business rules
)

# Access recommendation details
for rec in recommendations:
    print(f"Product: {rec.product_name}")
    print(f"Category: {rec.product_category}")
    print(f"Score: {rec.recommendation_score}")
    print(f"Factors: {rec.reason_factors}")
```

### 2. Get Similar Products

```python
# Find products similar to a specific product
similar_products = rec_service.get_similar_products(
    product_id=42,
    n_recommendations=5
)

for product in similar_products:
    print(f"{product.product_name} - Similarity: {product.recommendation_score}")
```

### 3. Explain Recommendations

```python
# Get explanation for why a product was recommended
explanation = rec_service.explain_recommendation(
    user_id=1,
    product_id=42
)

print(explanation)
```

### 4. Monitor Performance

```python
# Get performance metrics
metrics = rec_service.get_metrics()
print(f"Total requests: {metrics['total_requests']}")
print(f"Avg response time: {metrics['avg_response_time_seconds']}s")

# Reset metrics
rec_service.reset_metrics()
```

## API Response Format

### RecommendationResult Structure

```json
{
  "product_id": 123,
  "product_details": {
    "name": "Wireless Headphones",
    "category": "Electronics",
    "price": 79.99,
    "image_url": "https://example.com/image.jpg",
    "description": "High-quality wireless headphones...",
    "tags": ["wireless", "bluetooth", "audio"]
  },
  "recommendation_score": 0.8542,
  "reason_factors": {
    "collaborative_score": 0.3542,
    "content_based_score": 0.2184,
    "combined_base_score": 0.5726,
    "category_boost": 1.3,
    "diversity_penalty": 1.0,
    "final_score": 0.8542
  }
}
```

### Scoring Components Explained

- **collaborative_score**: Score from collaborative filtering (weighted)
- **content_based_score**: Score from content-based filtering (weighted)
- **combined_base_score**: Initial hybrid score before business rules
- **category_boost**: Multiplier applied for preferred categories (1.0 or 1.3)
- **diversity_penalty**: Multiplier for diversity constraint (1.0 or 0.8)
- **final_score**: Final recommendation score after all adjustments

## Business Rules Configuration

### Adjustable Parameters

```python
# Hybrid weights (must sum to 1.0)
rec_service.collaborative_weight = 0.6  # 60% collaborative
rec_service.content_based_weight = 0.4   # 40% content-based

# Category boost
rec_service.category_boost_factor = 1.3  # 30% boost

# Diversity constraints
rec_service.max_products_per_category = 2  # Max per category
rec_service.diversity_penalty = 0.8        # Penalty for exceeding
```

## Model Training

### When to Train

Models should be trained:
1. On initial setup
2. After significant data changes (new products, many new interactions)
3. Periodically (e.g., daily or weekly)

### Training Process

```python
# Manual training
training_time = rec_service.train_models()
print(f"Training completed in {training_time:.2f} seconds")

# Auto-training (happens automatically on first request if models not trained)
recommendations = rec_service.get_recommendations(user_id=1)
```

## Performance Optimization

### Tips for Production

1. **Pre-train models**: Train models during off-peak hours
2. **Cache results**: Consider caching recommendations for short periods
3. **Batch processing**: Train models in batch rather than per-request
4. **Database indexing**: Ensure proper indexes on foreign keys and timestamps
5. **Monitoring**: Track response times and adjust parameters as needed

### Expected Performance

- **Model training**: 1-5 seconds (depends on data size)
- **Recommendation generation**: 50-200ms per request
- **Cold-start handling**: Automatic fallback to popular products

## Cold-Start Handling

The service automatically handles cold-start scenarios:

### New Users (No Interaction History)
- Falls back to popular products based on overall interaction scores
- Uses content-based recommendations when possible

### New Products (No Interactions)
- Content-based filtering identifies similar products
- Products appear in recommendations based on feature similarity

## Logging

The service includes comprehensive logging:

```python
import logging

# Configure logging level
logging.basicConfig(level=logging.INFO)

# Logs include:
# - Service initialization
# - Model training progress
# - Recommendation requests
# - Business rule applications
# - Performance metrics
# - Errors and warnings
```

### Sample Log Output

```
INFO: RecommendationService initialized
INFO: Training collaborative filtering model...
INFO: Training content-based filtering model...
INFO: Model training completed in 2.34 seconds
INFO: Getting recommendations for user 1 (n=10)
INFO: Generating hybrid recommendations for user 1
INFO: Generated 45 hybrid recommendations
INFO: Applying business rules for user 1
INFO: Filtering 3 purchased products
INFO: User's preferred categories: ['Electronics', 'Books']
INFO: Applying diversity constraint (max 2 per category)
INFO: Final recommendations after business rules: 10
INFO: Recommendation request completed in 0.127s (returned 10 recommendations)
```

## Testing

### Run Test Suite

```bash
cd backend
python test_recommendation_service.py
```

### Test Coverage

The test script validates:
- ✓ Service initialization
- ✓ Model training
- ✓ Personalized recommendations
- ✓ Similar products
- ✓ Recommendation explanations
- ✓ Business rules (purchase filter, category boost, diversity)
- ✓ Performance metrics
- ✓ JSON serialization

## Integration with FastAPI

### Example Endpoint

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.get("/user/{user_id}")
async def get_user_recommendations(
    user_id: int,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get personalized recommendations for a user."""
    rec_service = RecommendationService(db)
    
    recommendations = rec_service.get_recommendations(
        user_id=user_id,
        n_recommendations=limit
    )
    
    return {
        "user_id": user_id,
        "recommendations": [rec.to_dict() for rec in recommendations],
        "count": len(recommendations)
    }

@router.get("/product/{product_id}/similar")
async def get_similar_products(
    product_id: int,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Get products similar to a given product."""
    rec_service = RecommendationService(db)
    
    similar = rec_service.get_similar_products(
        product_id=product_id,
        n_recommendations=limit
    )
    
    return {
        "product_id": product_id,
        "similar_products": [rec.to_dict() for rec in similar],
        "count": len(similar)
    }

@router.get("/metrics")
async def get_metrics(db: Session = Depends(get_db)):
    """Get recommendation service performance metrics."""
    rec_service = RecommendationService(db)
    return rec_service.get_metrics()
```

## Troubleshooting

### Common Issues

**Issue**: No recommendations returned
- **Cause**: No interaction data or insufficient data
- **Solution**: Ensure database has users, products, and interactions seeded

**Issue**: Slow response times
- **Cause**: Models not pre-trained
- **Solution**: Train models before handling requests

**Issue**: Same products recommended repeatedly
- **Cause**: Limited product diversity or too strict business rules
- **Solution**: Adjust diversity constraints or add more products

**Issue**: Recommendations don't match user preferences
- **Cause**: Insufficient interaction data or incorrect weights
- **Solution**: Adjust collaborative/content-based weights or collect more data

## Advanced Configuration

### Custom Weighting Strategy

```python
# Favor collaborative filtering more
rec_service.collaborative_weight = 0.7
rec_service.content_based_weight = 0.3

# Favor content-based filtering more
rec_service.collaborative_weight = 0.4
rec_service.content_based_weight = 0.6
```

### Custom Business Rules

```python
# More aggressive category boosting
rec_service.category_boost_factor = 1.5  # 50% boost

# More diverse recommendations
rec_service.max_products_per_category = 1  # Only 1 per category

# Less strict diversity
rec_service.max_products_per_category = 3  # Up to 3 per category
rec_service.diversity_penalty = 0.9        # Lighter penalty
```

## Best Practices

1. **Regular Model Updates**: Retrain models regularly to adapt to changing user preferences
2. **A/B Testing**: Test different weight combinations to find optimal settings
3. **Monitor Metrics**: Track response times and adjust caching strategies
4. **Validate Results**: Manually review recommendations periodically
5. **Handle Edge Cases**: Ensure graceful degradation for users with no history
6. **Log Everything**: Maintain detailed logs for debugging and optimization

## Future Enhancements

Potential improvements:
- Real-time model updates with streaming data
- Deep learning-based embeddings
- Context-aware recommendations (time, location, season)
- Multi-armed bandit for exploration vs exploitation
- Recommendation explanation UI
- Automated A/B testing framework

## Support

For issues or questions:
1. Check the logs for error messages
2. Review the test script for usage examples
3. Consult the API documentation
4. Check database for proper data seeding

## License

Part of the Product Recommender System

