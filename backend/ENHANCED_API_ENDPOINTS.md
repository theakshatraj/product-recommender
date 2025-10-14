# Enhanced Recommendation API Endpoints

## Overview

The enhanced recommendation API provides advanced recommendation features with business rules, detailed scoring, and performance metrics.

**Base URL**: `/api/recommendations`

---

## Endpoints

### 1. Get User Recommendations (Enhanced)

Get personalized recommendations with hybrid filtering and business rules.

**Endpoint**: `GET /api/recommendations/user/{user_id}`

**Parameters**:
- `user_id` (path, required): User ID
- `limit` (query, optional): Number of recommendations (1-50, default: 10)
- `apply_rules` (query, optional): Apply business rules (default: true)

**Example Request**:
```bash
curl http://localhost:8000/api/recommendations/user/1?limit=10&apply_rules=true
```

**Example Response**:
```json
{
  "user_id": 1,
  "username": "john_doe",
  "algorithm": "hybrid",
  "applied_rules": true,
  "total": 10,
  "recommendations": [
    {
      "product_id": 42,
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
  ],
  "info": {
    "collaborative_weight": 0.6,
    "content_based_weight": 0.4,
    "category_boost_factor": 1.3,
    "max_products_per_category": 2
  }
}
```

**Features**:
- ✅ Hybrid recommendation (60% collaborative + 40% content-based)
- ✅ Filters out already purchased products
- ✅ Boosts recommendations from preferred categories by 30%
- ✅ Ensures diversity (max 2 products per category)
- ✅ Detailed scoring breakdown

---

### 2. Get Similar Products (Enhanced)

Find products similar to a given product using content-based filtering.

**Endpoint**: `GET /api/recommendations/product/{product_id}/similar`

**Parameters**:
- `product_id` (path, required): Product ID
- `limit` (query, optional): Number of similar products (1-20, default: 5)

**Example Request**:
```bash
curl http://localhost:8000/api/recommendations/product/5/similar?limit=5
```

**Example Response**:
```json
{
  "product_id": 5,
  "product_name": "Laptop Pro 15",
  "category": "Electronics",
  "price": 1299.99,
  "total": 5,
  "similar_products": [
    {
      "product_id": 8,
      "product_details": {
        "name": "Laptop Air 13",
        "category": "Electronics",
        "price": 999.99,
        "image_url": "https://example.com/laptop.jpg",
        "description": "Lightweight laptop...",
        "tags": ["laptop", "portable", "computing"]
      },
      "recommendation_score": 0.9234,
      "reason_factors": {
        "content_similarity": 0.9234,
        "final_score": 0.9234
      }
    }
  ],
  "method": "content_based_similarity"
}
```

**Features**:
- ✅ Content-based similarity (category, price, tags)
- ✅ TF-IDF vectorization for tags
- ✅ Cosine similarity calculation
- ✅ Detailed similarity scores

---

### 3. Explain Recommendation

Get detailed explanation for why a product was recommended.

**Endpoint**: `GET /api/recommendations/user/{user_id}/explain/{product_id}`

**Parameters**:
- `user_id` (path, required): User ID
- `product_id` (path, required): Product ID

**Example Request**:
```bash
curl http://localhost:8000/api/recommendations/user/1/explain/42
```

**Example Response**:
```json
{
  "product_id": 42,
  "product_name": "Wireless Headphones",
  "product_category": "Electronics",
  "user_id": 1,
  "user_interaction_count": 15,
  "in_preferred_category": true,
  "preferred_categories": ["Electronics", "Books", "Home & Garden"],
  "recommendation_factors": [
    "Based on 15 user interactions",
    "Category: Electronics",
    "Matches your preference for Electronics"
  ]
}
```

**Features**:
- ✅ User preference analysis
- ✅ Category matching
- ✅ Interaction history
- ✅ Transparent recommendation reasoning

---

### 4. Train Recommendation Models

Manually trigger model training.

**Endpoint**: `POST /api/recommendations/train`

**Example Request**:
```bash
curl -X POST http://localhost:8000/api/recommendations/train
```

**Example Response**:
```json
{
  "status": "success",
  "training_time_seconds": 2.345,
  "statistics": {
    "total_users": 100,
    "total_products": 500,
    "total_interactions": 2500
  },
  "message": "Models trained successfully"
}
```

**When to Use**:
- After initial data seeding
- After significant data changes
- Periodically (e.g., daily/weekly via cron)

---

### 5. Get Performance Metrics

View recommendation service performance metrics.

**Endpoint**: `GET /api/recommendations/metrics`

**Example Request**:
```bash
curl http://localhost:8000/api/recommendations/metrics
```

**Example Response**:
```json
{
  "status": "success",
  "metrics": {
    "total_requests": 150,
    "avg_response_time_seconds": 0.127,
    "cache_hits": 0
  }
}
```

**Metrics Tracked**:
- Total recommendation requests
- Average response time
- Cache hit rate

---

### 6. Reset Performance Metrics

Reset performance metrics to zero.

**Endpoint**: `DELETE /api/recommendations/metrics`

**Example Request**:
```bash
curl -X DELETE http://localhost:8000/api/recommendations/metrics
```

**Example Response**:
```json
{
  "status": "success",
  "message": "Metrics reset successfully"
}
```

---

### 7. Get User Preferences

View user's preference summary and statistics.

**Endpoint**: `GET /api/recommendations/user/{user_id}/preferences`

**Parameters**:
- `user_id` (path, required): User ID

**Example Request**:
```bash
curl http://localhost:8000/api/recommendations/user/1/preferences
```

**Example Response**:
```json
{
  "user_id": 1,
  "username": "john_doe",
  "preferred_categories": {
    "Electronics": 45.5,
    "Books": 32.0,
    "Home & Garden": 18.5
  },
  "purchased_product_ids": [5, 12, 23, 45],
  "purchased_count": 4,
  "total_interactions": 28
}
```

**Features**:
- User's top categories with scores
- List of purchased products
- Interaction statistics

---

## Comparison: Standard vs Enhanced API

| Feature | Standard API (`/recommendations`) | Enhanced API (`/api/recommendations`) |
|---------|-----------------------------------|---------------------------------------|
| Hybrid Filtering | ✅ Basic | ✅ Advanced (weighted) |
| Purchase Filter | ❌ No | ✅ Yes |
| Category Boost | ❌ No | ✅ Yes (30% boost) |
| Diversity Control | ❌ No | ✅ Yes (max 2 per category) |
| Detailed Scoring | ⚠️ Limited | ✅ Complete breakdown |
| Performance Metrics | ❌ No | ✅ Yes |
| Model Training API | ❌ No | ✅ Yes |
| Explanation API | ⚠️ Basic | ✅ Detailed |
| User Preferences | ❌ No | ✅ Yes |
| Configurable Rules | ❌ No | ✅ Yes |

---

## Business Rules

### 1. Purchase Filter
**Rule**: Don't recommend already purchased products
**Implementation**: Queries user's purchase history and excludes those products
**Impact**: Ensures fresh, relevant recommendations

### 2. Category Boost
**Rule**: Boost products from user's preferred categories
**Implementation**: 
- Identifies top 3 categories from user's interaction history
- Applies 1.3x multiplier to matching products
**Impact**: Recommendations better match user interests

### 3. Diversity Constraint
**Rule**: Limit products per category for variety
**Implementation**:
- Max 2 products per category in top 10
- 0.8x penalty for exceeding limit
**Impact**: More diverse recommendations

---

## Scoring Components Explained

Each recommendation includes a detailed scoring breakdown:

```json
"reason_factors": {
  "collaborative_score": 0.3542,      // From collaborative filtering (weighted)
  "content_based_score": 0.2184,      // From content-based filtering (weighted)
  "combined_base_score": 0.5726,      // Initial hybrid score
  "category_boost": 1.3,               // Category preference multiplier (1.0 or 1.3)
  "diversity_penalty": 1.0,            // Diversity constraint (0.8 or 1.0)
  "final_score": 0.8542               // Final recommendation score
}
```

**Formula**:
```
final_score = combined_base_score × category_boost × diversity_penalty
```

---

## Usage Examples

### Python (requests)

```python
import requests

# Get recommendations
response = requests.get(
    "http://localhost:8000/api/recommendations/user/1",
    params={"limit": 10, "apply_rules": True}
)
recommendations = response.json()

# Train models
response = requests.post("http://localhost:8000/api/recommendations/train")
training_result = response.json()

# Get similar products
response = requests.get(
    "http://localhost:8000/api/recommendations/product/5/similar",
    params={"limit": 5}
)
similar = response.json()
```

### JavaScript (fetch)

```javascript
// Get recommendations
const response = await fetch(
  'http://localhost:8000/api/recommendations/user/1?limit=10&apply_rules=true'
);
const recommendations = await response.json();

// Train models
const trainResponse = await fetch(
  'http://localhost:8000/api/recommendations/train',
  { method: 'POST' }
);
const training = await trainResponse.json();

// Get metrics
const metricsResponse = await fetch(
  'http://localhost:8000/api/recommendations/metrics'
);
const metrics = await metricsResponse.json();
```

### cURL

```bash
# Get recommendations with business rules
curl "http://localhost:8000/api/recommendations/user/1?limit=10&apply_rules=true"

# Get recommendations without business rules
curl "http://localhost:8000/api/recommendations/user/1?limit=10&apply_rules=false"

# Train models
curl -X POST "http://localhost:8000/api/recommendations/train"

# Get user preferences
curl "http://localhost:8000/api/recommendations/user/1/preferences"

# Get similar products
curl "http://localhost:8000/api/recommendations/product/5/similar?limit=5"

# Get explanation
curl "http://localhost:8000/api/recommendations/user/1/explain/42"

# Get metrics
curl "http://localhost:8000/api/recommendations/metrics"

# Reset metrics
curl -X DELETE "http://localhost:8000/api/recommendations/metrics"
```

---

## Testing the API

### 1. Start the Server

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Access API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 3. Run Test Script

```bash
cd backend
python test_recommendation_service.py
```

---

## Performance Tips

### 1. Pre-train Models
```bash
# Train models before accepting traffic
curl -X POST http://localhost:8000/api/recommendations/train
```

### 2. Monitor Metrics
```bash
# Check performance regularly
curl http://localhost:8000/api/recommendations/metrics
```

### 3. Caching (Future Enhancement)
Consider implementing Redis caching for frequently requested users

### 4. Batch Training
Schedule model retraining during off-peak hours:
```bash
# Crontab example: daily at 2 AM
0 2 * * * curl -X POST http://localhost:8000/api/recommendations/train
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Successful request
- `404 Not Found`: User or product not found
- `500 Internal Server Error`: Server error with detailed message

**Example Error Response**:
```json
{
  "detail": "User with ID 999 not found"
}
```

---

## Integration Guide

### FastAPI Integration

The enhanced API is already integrated. Just start the server:

```bash
uvicorn app.main:app --reload
```

### Frontend Integration

```javascript
// Example React component
async function getRecommendations(userId) {
  const response = await fetch(
    `http://localhost:8000/api/recommendations/user/${userId}?limit=10`
  );
  const data = await response.json();
  return data.recommendations;
}

// Display recommendations
const recommendations = await getRecommendations(1);
recommendations.forEach(rec => {
  console.log(`${rec.product_details.name} - Score: ${rec.recommendation_score}`);
});
```

---

## Next Steps

1. ✅ API endpoints are ready to use
2. ✅ Test with sample data using test script
3. ✅ Integrate with frontend application
4. ✅ Monitor performance metrics
5. ✅ Schedule periodic model training
6. ⏳ Consider adding caching for production
7. ⏳ Implement A/B testing for different weights

---

## Support

For issues or questions:
- Check API docs: http://localhost:8000/docs
- Review logs for detailed error messages
- Consult RECOMMENDATION_SERVICE_GUIDE.md
- Run test script: `python test_recommendation_service.py`

