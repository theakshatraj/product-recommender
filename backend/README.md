# Backend - Product Recommender API

FastAPI backend for the e-commerce product recommender system.

## 🗄️ Database Schema

### Tables

1. **Products**
   - `id` (Primary Key)
   - `name` (String, indexed)
   - `description` (Text)
   - `category` (String, indexed)
   - `price` (Float)
   - `image_url` (String, optional)
   - `tags` (JSON array)
   - `created_at` (Timestamp)

2. **Users**
   - `id` (Primary Key)
   - `username` (String, unique, indexed)
   - `email` (String, unique, indexed)
   - `created_at` (Timestamp)

3. **User Interactions**
   - `id` (Primary Key)
   - `user_id` (Foreign Key → users.id)
   - `product_id` (Foreign Key → products.id)
   - `interaction_type` (Enum: view, click, cart_add, purchase)
   - `interaction_score` (Float: view=1, click=2, cart_add=3, purchase=5)
   - `timestamp` (Timestamp, indexed)

### Relationships
- User → UserInteractions (one-to-many)
- Product → UserInteractions (one-to-many)

## 🚀 Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/product_recommender
OPENAI_API_KEY=your_openai_api_key
SECRET_KEY=your_secret_key
```

### 3. Create Database

```bash
# Create tables
python create_db.py

# Or reset database (WARNING: deletes all data)
python create_db.py --reset
```

### 4. Seed Sample Data (Optional)

```bash
python seed_data.py
```

This will populate the database with:
- **50 products** across 5 categories (Electronics, Fashion, Home, Books, Sports)
- **10 users** with diverse interests
- **200 user interactions** with realistic behavior patterns

View database statistics:
```bash
python db_stats.py
```

### 5. Run the Application

```bash
uvicorn app.main:app --reload
```

The API will be available at:
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📊 Database Migrations with Alembic

### Create a Migration

```bash
alembic revision --autogenerate -m "description"
```

### Apply Migrations

```bash
alembic upgrade head
```

### Rollback Migration

```bash
alembic downgrade -1
```

### View Migration History

```bash
alembic history
```

## 🧪 Testing

```bash
pytest
```

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── database/
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── connection.py    # Database connection
│   │   └── init_db.py       # Database initialization
│   ├── models/              # Pydantic models
│   ├── routes/              # API endpoints
│   ├── services/            # Business logic
│   └── recommender/         # ML algorithms
├── alembic/                 # Database migrations
├── create_db.py             # Database creation script
├── seed_data.py             # Sample data seeding
└── requirements.txt         # Python dependencies
```

## 🔧 Interaction Score System

The system automatically assigns scores to user interactions:

| Interaction Type | Score | Description |
|-----------------|-------|-------------|
| VIEW | 1.0 | User viewed the product |
| CLICK | 2.0 | User clicked on the product |
| CART_ADD | 3.0 | User added product to cart |
| PURCHASE | 5.0 | User purchased the product |

These scores are used by recommendation algorithms to determine user preferences.

## 📝 API Endpoints

### Products
- `GET /products` - List all products (with pagination & filters)
- `GET /products/{id}` - Get product by ID
- `GET /products/category/{category}` - Get products by category
- `GET /products/categories/list` - Get all categories

### Users
- `GET /users/{user_id}` - Get user details with stats
- `GET /users/{user_id}/interactions` - Get user interaction history
- `GET /users/{user_id}/preferences` - Get user category preferences

### Interactions
- `POST /interactions` - Log new interaction
- `GET /interactions/user/{user_id}` - Get user interactions
- `GET /interactions/product/{product_id}` - Get product interactions

### Recommendations
- `GET /recommendations/{user_id}` - Get personalized recommendations with AI explanations
- `GET /recommendations/product/{product_id}/similar` - Get similar products

**Full API Documentation**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

**Interactive Docs**: http://localhost:8000/docs

