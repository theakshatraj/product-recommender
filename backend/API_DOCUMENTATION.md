# Product Recommender API Documentation

Base URL: `http://localhost:8000`

## 📦 Products Endpoints

### GET `/products`
Get all products with pagination and filters

**Query Parameters:**
- `skip` (int, default: 0) - Number of items to skip
- `limit` (int, default: 10, max: 100) - Number of items to return
- `category` (string, optional) - Filter by category
- `min_price` (float, optional) - Minimum price filter
- `max_price` (float, optional) - Maximum price filter

**Example Request:**
```bash
curl "http://localhost:8000/products?skip=0&limit=10&category=Electronics"
```

**Example Response:**
```json
{
  "total": 50,
  "skip": 0,
  "limit": 10,
  "products": [
    {
      "id": 1,
      "name": "Wireless Noise-Cancelling Headphones",
      "description": "Premium over-ear headphones...",
      "category": "Electronics",
      "price": 249.99,
      "image_url": "https://picsum.photos/seed/product1/400/400",
      "tags": ["bluetooth", "wireless", "audio"],
      "created_at": "2024-01-15T10:30:00"
    }
  ]
}
```

### GET `/products/{product_id}`
Get a specific product by ID

**Path Parameters:**
- `product_id` (int) - Product ID

**Example Request:**
```bash
curl "http://localhost:8000/products/1"
```

### GET `/products/category/{category}`
Get products by category with pagination

**Path Parameters:**
- `category` (string) - Category name

**Query Parameters:**
- `skip` (int, default: 0)
- `limit` (int, default: 10, max: 100)

**Example Request:**
```bash
curl "http://localhost:8000/products/category/Electronics?limit=5"
```

### GET `/products/categories/list`
Get list of all available categories

**Example Response:**
```json
{
  "categories": ["Electronics", "Fashion", "Home", "Books", "Sports"],
  "total": 5
}
```

---

## 👥 Users Endpoints

### GET `/users/{user_id}`
Get user details with statistics

**Path Parameters:**
- `user_id` (int) - User ID

**Example Request:**
```bash
curl "http://localhost:8000/users/1"
```

**Example Response:**
```json
{
  "id": 1,
  "username": "tech_enthusiast",
  "email": "techie@example.com",
  "created_at": "2024-01-10T08:00:00",
  "stats": {
    "total_interactions": 25,
    "unique_products_interacted": 15
  }
}
```

### GET `/users/{user_id}/interactions`
Get user's interaction history with products

**Path Parameters:**
- `user_id` (int) - User ID

**Query Parameters:**
- `skip` (int, default: 0)
- `limit` (int, default: 20, max: 100)

**Example Request:**
```bash
curl "http://localhost:8000/users/1/interactions?limit=5"
```

**Example Response:**
```json
{
  "user_id": 1,
  "username": "tech_enthusiast",
  "total": 25,
  "skip": 0,
  "limit": 5,
  "interactions": [
    {
      "id": 150,
      "interaction_type": "purchase",
      "interaction_score": 5.0,
      "timestamp": "2024-02-01T14:30:00",
      "product": {
        "id": 1,
        "name": "Wireless Noise-Cancelling Headphones",
        "category": "Electronics",
        "price": 249.99,
        "image_url": "https://picsum.photos/seed/product1/400/400"
      }
    }
  ]
}
```

### GET `/users/{user_id}/preferences`
Get user's category preferences based on interaction history

**Example Response:**
```json
{
  "user_id": 1,
  "username": "tech_enthusiast",
  "preferences": [
    {
      "category": "Electronics",
      "interaction_count": 20,
      "total_score": 65.0,
      "avg_score": 3.25
    },
    {
      "category": "Sports",
      "interaction_count": 5,
      "total_score": 8.0,
      "avg_score": 1.6
    }
  ]
}
```

---

## 🔄 Interactions Endpoints

### POST `/interactions`
Log a new user interaction with a product

**Query Parameters:**
- `user_id` (int) - User ID
- `product_id` (int) - Product ID
- `interaction_type` (string) - Type: `view`, `click`, `cart_add`, or `purchase`

**Example Request:**
```bash
curl -X POST "http://localhost:8000/interactions?user_id=1&product_id=5&interaction_type=view"
```

**Example Response:**
```json
{
  "id": 201,
  "user_id": 1,
  "product_id": 5,
  "interaction_type": "view",
  "interaction_score": 1.0,
  "timestamp": "2024-02-10T15:45:30",
  "message": "Interaction logged successfully"
}
```

### GET `/interactions/user/{user_id}`
Get all interactions for a specific user

**Path Parameters:**
- `user_id` (int) - User ID

**Query Parameters:**
- `skip` (int, default: 0)
- `limit` (int, default: 20, max: 100)
- `interaction_type` (string, optional) - Filter by type

**Example Request:**
```bash
curl "http://localhost:8000/interactions/user/1?interaction_type=purchase"
```

### GET `/interactions/product/{product_id}`
Get all interactions for a specific product

**Path Parameters:**
- `product_id` (int) - Product ID

**Example Request:**
```bash
curl "http://localhost:8000/interactions/product/5"
```

---

## 🎯 Recommendations Endpoints

### GET `/recommendations/{user_id}`
Get personalized product recommendations with AI explanations

**Path Parameters:**
- `user_id` (int) - User ID

**Query Parameters:**
- `limit` (int, default: 5, max: 20) - Number of recommendations
- `algorithm` (string, default: "hybrid") - Algorithm type:
  - `collaborative` - Based on similar users
  - `content_based` - Based on user's category preferences
  - `hybrid` - Combination of both

**Example Request:**
```bash
curl "http://localhost:8000/recommendations/1?limit=5&algorithm=hybrid"
```

**Example Response:**
```json
{
  "user_id": 1,
  "username": "tech_enthusiast",
  "algorithm": "hybrid",
  "total": 5,
  "recommendations": [
    {
      "product_id": 10,
      "name": "USB-C Hub Multi-Port Adapter",
      "description": "7-in-1 USB-C hub with HDMI, USB 3.0...",
      "category": "Electronics",
      "price": 49.99,
      "image_url": "https://picsum.photos/seed/product10/400/400",
      "tags": ["adapter", "usb-c", "hub"],
      "recommendation_score": 85.0,
      "explanation": "We recommend 'USB-C Hub Multi-Port Adapter' because customers with similar interests have shown strong interest in this product. Recommended based on 12 interactions from similar users"
    }
  ]
}
```

### GET `/recommendations/product/{product_id}/similar`
Get similar products based on a specific product

**Path Parameters:**
- `product_id` (int) - Product ID

**Query Parameters:**
- `limit` (int, default: 5, max: 20)

**Example Request:**
```bash
curl "http://localhost:8000/recommendations/product/1/similar?limit=3"
```

**Example Response:**
```json
{
  "product_id": 1,
  "product_name": "Wireless Noise-Cancelling Headphones",
  "category": "Electronics",
  "total": 3,
  "similar_products": [
    {
      "product_id": 6,
      "name": "Wireless Earbuds Pro",
      "description": "True wireless earbuds with ANC...",
      "category": "Electronics",
      "price": 199.99,
      "image_url": "https://picsum.photos/seed/product6/400/400",
      "tags": ["earbuds", "wireless", "anc"],
      "similarity_reason": "Same category: Electronics",
      "explanation": "Similar to 'Wireless Noise-Cancelling Headphones' - both are in Electronics category"
    }
  ]
}
```

---

## 🏥 Health & Status

### GET `/`
Root endpoint with API information

**Example Response:**
```json
{
  "message": "Product Recommender API is running",
  "version": "1.0.0",
  "docs": "/docs",
  "endpoints": {
    "products": "/products",
    "users": "/users",
    "interactions": "/interactions",
    "recommendations": "/recommendations"
  }
}
```

### GET `/health`
Health check endpoint

**Example Response:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

## 🔧 Error Responses

### 404 Not Found
```json
{
  "detail": "User with ID 999 not found"
}
```

### 400 Bad Request
```json
{
  "detail": "Invalid interaction type. Must be one of: view, click, cart_add, purchase"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Error retrieving products: Database connection failed"
}
```

---

## 📊 Interaction Types & Scores

| Type | Score | Description |
|------|-------|-------------|
| `view` | 1.0 | User viewed the product |
| `click` | 2.0 | User clicked on the product |
| `cart_add` | 3.0 | User added product to cart |
| `purchase` | 5.0 | User purchased the product |

---

## 🚀 Interactive API Documentation

FastAPI provides interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These interfaces allow you to:
- View all available endpoints
- See request/response schemas
- Test API calls directly in the browser
- Download OpenAPI specification

---

## 📝 Example Usage Flow

1. **Browse Products**
   ```bash
   GET /products?limit=10
   ```

2. **View Product Details**
   ```bash
   GET /products/1
   ```

3. **Log Interaction**
   ```bash
   POST /interactions?user_id=1&product_id=1&interaction_type=view
   ```

4. **Get Recommendations**
   ```bash
   GET /recommendations/1?limit=5
   ```

5. **Find Similar Products**
   ```bash
   GET /recommendations/product/1/similar
   ```

6. **Check User Preferences**
   ```bash
   GET /users/1/preferences
   ```

