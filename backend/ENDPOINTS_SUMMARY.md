# API Endpoints Summary

## Quick Reference

### 🛍️ Products (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List all products with pagination |
| GET | `/products/{id}` | Get specific product |
| GET | `/products/category/{category}` | Filter by category |
| GET | `/products/categories/list` | List all categories |

### 👤 Users (3 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/{user_id}` | User details + stats |
| GET | `/users/{user_id}/interactions` | User interaction history |
| GET | `/users/{user_id}/preferences` | Category preferences |

### 🔄 Interactions (3 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/interactions` | Log new interaction |
| GET | `/interactions/user/{user_id}` | User's interactions |
| GET | `/interactions/product/{product_id}` | Product's interactions |

### 🎯 Recommendations (2 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/recommendations/{user_id}` | Personalized recommendations |
| GET | `/recommendations/product/{product_id}/similar` | Similar products |

---

## Features Implemented

### ✅ Pagination
All list endpoints support pagination:
- `skip` - Offset for pagination (default: 0)
- `limit` - Items per page (default varies, max: 100)

### ✅ Filtering
Products can be filtered by:
- Category
- Price range (min_price, max_price)

Interactions can be filtered by:
- Interaction type (view, click, cart_add, purchase)

### ✅ Error Handling
Comprehensive error handling:
- 404: Resource not found
- 400: Bad request (invalid parameters)
- 500: Internal server errors

All errors return descriptive messages.

### ✅ CORS Middleware
Configured to allow cross-origin requests for frontend integration.

### ✅ Recommendation Algorithms
Three algorithms implemented:
1. **Collaborative Filtering** - Based on similar users
2. **Content-Based** - Based on user's category preferences
3. **Hybrid** - Combination of both (default)

### ✅ AI Explanations
Each recommendation includes:
- Recommendation score
- Natural language explanation
- Reasoning for the recommendation

---

## Testing the API

### Method 1: Swagger UI (Interactive)
Visit: http://localhost:8000/docs
- Browse all endpoints
- Test directly in browser
- See request/response schemas

### Method 2: Test Script
```bash
python test_api.py
```

### Method 3: cURL
```bash
# Get products
curl "http://localhost:8000/products?limit=5"

# Get recommendations
curl "http://localhost:8000/recommendations/1?limit=5"

# Log interaction
curl -X POST "http://localhost:8000/interactions?user_id=1&product_id=1&interaction_type=view"
```

---

## Response Format

All endpoints return JSON with consistent structure:

### List Responses
```json
{
  "total": 50,
  "skip": 0,
  "limit": 10,
  "data": [...]
}
```

### Single Resource
```json
{
  "id": 1,
  "field1": "value",
  ...
}
```

### Error Response
```json
{
  "detail": "Error message here"
}
```

---

## Performance Optimizations

- Database connection pooling (5 connections, 10 overflow)
- Indexed columns for fast queries (id, category, user_id, product_id, timestamp)
- Pagination to limit response sizes
- Efficient JOIN queries
- Pool pre-ping for connection health

---

## Next Steps

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed documentation with examples.

