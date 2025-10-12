# Testing Guide - Product Recommender System

Complete step-by-step guide to test the application from scratch.

---

## 📋 **Prerequisites**

- Python 3.9+
- PostgreSQL installed and running
- Terminal/Command Prompt

---

## 🔧 **Step 1: Environment Setup**

### 1.1 Navigate to Backend Directory
```bash
cd backend
```

### 1.2 Create Virtual Environment (Recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 1.3 Install Dependencies
```bash
pip install -r requirements.txt
```

You should see packages being installed:
- FastAPI, Uvicorn
- SQLAlchemy, psycopg2-binary
- Pandas, NumPy, scikit-learn
- OpenAI, python-dotenv, etc.

---

## 💾 **Step 2: Database Setup**

### 2.1 Create PostgreSQL Database
```bash
# Option 1: Using psql command line
psql -U postgres
CREATE DATABASE product_recommender;
\q

# Option 2: Using pgAdmin (GUI)
# - Right-click Databases → Create → Database
# - Name: product_recommender
```

### 2.2 Configure Environment Variables
Create a `.env` file in the `backend` directory:

```bash
# Windows
echo DATABASE_URL=postgresql://user:password@localhost:5432/product_recommender > .env

# macOS/Linux  
echo "DATABASE_URL=postgresql://user:password@localhost:5432/product_recommender" > .env
```

**Replace `user` and `password` with your PostgreSQL credentials!**

Example:
```
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/product_recommender
OPENAI_API_KEY=your_key_here_optional
SECRET_KEY=your_secret_key_here
```

### 2.3 Create Database Tables
```bash
python create_db.py
```

**Expected Output:**
```
Creating database tables...
✓ Database tables created successfully!
```

### 2.4 Seed Sample Data
```bash
python seed_data.py
```

**Expected Output:**
```
🌱 Seeding database with sample data...
✓ Added 50 products across 5 categories
✓ Added 10 users
✓ Added 200 user interactions with realistic patterns
✅ Database seeded successfully!
```

### 2.5 Verify Database (Optional)
```bash
python db_stats.py
```

**Expected Output:**
```
============================================================
📊 DATABASE STATISTICS
============================================================

📦 PRODUCTS: 50 total
   • Electronics: 10 products
   • Fashion: 10 products
   • Home: 10 products
   • Books: 10 products
   • Sports: 10 products

💰 PRICE RANGE:
   • Average: $134.99
   • Min: $14.99
   • Max: $1299.99

👥 USERS: 10 total

🔄 INTERACTIONS: 200 total
   • view: 86 (43.0%)
   • click: 58 (29.0%)
   • cart_add: 28 (14.0%)
   • purchase: 28 (14.0%)
...
```

---

## 🚀 **Step 3: Start the API Server**

### 3.1 Start FastAPI Server
```bash
uvicorn app.main:app --reload
```

**Expected Output:**
```
🚀 Starting up application...
📊 Initializing database...
✓ Database initialized successfully!
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**✅ Server is now running at: http://localhost:8000**

---

## 🧪 **Step 4: Test the API**

Keep the server running and open a **NEW terminal window** for testing.

### Method 1: Interactive Swagger UI (Easiest) ⭐

1. **Open your browser** and navigate to:
   ```
   http://localhost:8000/docs
   ```

2. **You'll see a beautiful interactive API documentation** with all endpoints

3. **Try it out:**
   - Click on any endpoint (e.g., `GET /products`)
   - Click "Try it out" button
   - Modify parameters if needed
   - Click "Execute"
   - See the response below!

**Example: Test GET /products**
   - Expand `GET /products`
   - Click "Try it out"
   - Set `limit` to 5
   - Click "Execute"
   - See JSON response with 5 products!

### Method 2: Automated Test Script

Navigate to backend directory (if not already there) and run:

```bash
python test_api.py
```

**This will test all 15 endpoints automatically!**

**Expected Output:**
```
🚀 TESTING PRODUCT RECOMMENDER API
============================================================

============================================================
📍 Health Check
============================================================
Status Code: 200
Response:
{
  "status": "healthy",
  "database": "connected"
}

============================================================
📍 GET /products (first 5)
============================================================
Status Code: 200
Response:
{
  "total": 50,
  "skip": 0,
  "limit": 5,
  "products": [...]
}

...

✅ API TESTING COMPLETE!
============================================================
📖 View interactive docs at: http://localhost:8000/docs
============================================================
```

### Method 3: Manual Testing with cURL

```bash
# 1. Health Check
curl http://localhost:8000/health

# 2. Get products (first 5)
curl "http://localhost:8000/products?limit=5"

# 3. Get product by ID
curl http://localhost:8000/products/1

# 4. Get products by category
curl "http://localhost:8000/products/category/Electronics"

# 5. Get all categories
curl http://localhost:8000/products/categories/list

# 6. Get user details
curl http://localhost:8000/users/1

# 7. Get user interactions
curl "http://localhost:8000/users/1/interactions?limit=5"

# 8. Get user preferences
curl http://localhost:8000/users/1/preferences

# 9. Log a new interaction
curl -X POST "http://localhost:8000/interactions?user_id=1&product_id=5&interaction_type=view"

# 10. Get recommendations (hybrid algorithm)
curl "http://localhost:8000/recommendations/1?limit=5&algorithm=hybrid"

# 11. Get collaborative filtering recommendations
curl "http://localhost:8000/recommendations/1?limit=5&algorithm=collaborative"

# 12. Get content-based recommendations
curl "http://localhost:8000/recommendations/1?limit=5&algorithm=content_based"

# 13. Get similar products
curl "http://localhost:8000/recommendations/product/1/similar?limit=3"
```

### Method 4: Using Postman or Insomnia

1. **Import the API** using OpenAPI spec:
   - URL: `http://localhost:8000/openapi.json`

2. **Or manually create requests:**
   - Base URL: `http://localhost:8000`
   - Add endpoints as needed

---

## 🎯 **Step 5: Test Specific Features**

### Test Recommendation Algorithms

```bash
# User 1 (tech_enthusiast) - should recommend Electronics
curl "http://localhost:8000/recommendations/1?limit=3"

# User 2 (fashionista_sarah) - should recommend Fashion
curl "http://localhost:8000/recommendations/2?limit=3"

# User 4 (bookworm_emily) - should recommend Books
curl "http://localhost:8000/recommendations/4?limit=3"
```

### Test Pagination

```bash
# Get first 10 products
curl "http://localhost:8000/products?skip=0&limit=10"

# Get next 10 products
curl "http://localhost:8000/products?skip=10&limit=10"
```

### Test Filtering

```bash
# Filter by price range
curl "http://localhost:8000/products?min_price=50&max_price=200"

# Filter by category and price
curl "http://localhost:8000/products?category=Electronics&max_price=500"
```

### Test Interaction Logging

```bash
# Log different interaction types
curl -X POST "http://localhost:8000/interactions?user_id=1&product_id=10&interaction_type=view"
curl -X POST "http://localhost:8000/interactions?user_id=1&product_id=10&interaction_type=click"
curl -X POST "http://localhost:8000/interactions?user_id=1&product_id=10&interaction_type=cart_add"
curl -X POST "http://localhost:8000/interactions?user_id=1&product_id=10&interaction_type=purchase"

# Check the user's updated interactions
curl "http://localhost:8000/users/1/interactions?limit=5"
```

---

## 📊 **Step 6: Explore the Data**

### View User Behavior Patterns

```bash
# See what tech_enthusiast (user 1) likes
curl http://localhost:8000/users/1/preferences

# See what fashionista_sarah (user 2) likes  
curl http://localhost:8000/users/2/preferences

# See what bookworm_emily (user 4) likes
curl http://localhost:8000/users/4/preferences
```

### Find Popular Products

```bash
# Get interactions for a popular product
curl http://localhost:8000/interactions/product/1
```

---

## ✅ **Expected Test Results**

### All Tests Should Pass ✓

- ✅ Server starts successfully
- ✅ Database connected
- ✅ All endpoints return 200 status
- ✅ Products are returned with correct structure
- ✅ Recommendations are personalized per user
- ✅ Interactions are logged successfully
- ✅ Pagination works correctly
- ✅ Filters return correct results
- ✅ Error handling works (try invalid IDs)

### Sample Success Indicators

**Products Endpoint:**
```json
{
  "total": 50,
  "skip": 0,
  "limit": 5,
  "products": [
    {
      "id": 1,
      "name": "Wireless Noise-Cancelling Headphones",
      "category": "Electronics",
      "price": 249.99
    }
  ]
}
```

**Recommendations Endpoint:**
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
      "recommendation_score": 85.0,
      "explanation": "We recommend 'USB-C Hub...' because..."
    }
  ]
}
```

---

## 🐛 **Troubleshooting**

### Issue: "Database connection failed"
**Solution:**
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env` file
- Check username/password are correct
- Ensure database `product_recommender` exists

### Issue: "Module not found"
**Solution:**
```bash
pip install -r requirements.txt
```

### Issue: "Port 8000 already in use"
**Solution:**
```bash
# Use a different port
uvicorn app.main:app --reload --port 8001
```

### Issue: "No products found"
**Solution:**
```bash
# Re-seed the database
python seed_data.py
```

### Issue: "Import errors"
**Solution:**
```bash
# Make sure you're in the backend directory
cd backend
# And virtual environment is activated
```

---

## 📚 **Additional Resources**

- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **API Documentation**: See `API_DOCUMENTATION.md`
- **Endpoints Summary**: See `ENDPOINTS_SUMMARY.md`

---

## 🎉 **Success!**

If all tests pass, you have successfully:
✅ Set up the database
✅ Seeded realistic sample data
✅ Started the FastAPI server
✅ Tested all 12 API endpoints
✅ Verified recommendation algorithms work
✅ Confirmed pagination and filtering work

**Your Product Recommender System backend is fully operational!** 🚀

---

## 🔄 **Reset Everything**

If you want to start fresh:

```bash
# Reset database
python create_db.py --reset

# Re-seed data
python seed_data.py

# Restart server
uvicorn app.main:app --reload
```


