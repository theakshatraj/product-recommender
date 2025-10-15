# 🛍️ E-commerce Product Recommender System

A sophisticated full-stack e-commerce product recommendation system powered by hybrid machine learning algorithms and AI-generated explanations. This system provides personalized product recommendations with natural language explanations using OpenAI's GPT models.

![Product Recommender Demo](https://via.placeholder.com/800x400/6366f1/ffffff?text=Product+Recommender+System)

## 🌟 Overview

This project demonstrates a complete e-commerce recommendation system that combines:

- **Hybrid Recommendation Engine**: Collaborative filtering + Content-based filtering
- **AI-Powered Explanations**: Natural language explanations using OpenAI GPT
- **Modern Web Stack**: FastAPI backend + React frontend
- **Real-time Interactions**: User behavior tracking and analysis
- **Business Rules**: Purchase filtering, category boosting, diversity constraints

## 🏗️ Architecture

### System Architecture

```mermaid
graph TB
    A[React Frontend] --> B[FastAPI Backend]
    B --> C[PostgreSQL Database]
    B --> D[OpenAI API]
    B --> E[Recommendation Engine]
    
    E --> F[Collaborative Filtering]
    E --> G[Content-Based Filtering]
    E --> H[Business Rules Engine]
    
    F --> I[User-Item Matrix]
    G --> J[TF-IDF Vectorizer]
    H --> K[Category Boost]
    H --> L[Diversity Filter]
    
    D --> M[LLM Explanations]
    M --> N[Personalized Text]
```

### Tech Stack

**Backend:**
- **FastAPI** - Modern, fast web framework with automatic API documentation
- **PostgreSQL** - Robust relational database for data persistence
- **SQLAlchemy** - Python ORM for database operations
- **OpenAI API** - GPT models for natural language explanations
- **Scikit-learn** - Machine learning algorithms for recommendations
- **Pydantic** - Data validation and serialization

**Frontend:**
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **Tailwind CSS** - Utility-first CSS framework

**Infrastructure:**
- **Docker** - Containerization for easy deployment
- **Docker Compose** - Multi-container orchestration
- **Alembic** - Database migration management

## 🚀 Features

### 1. Hybrid Recommendation Engine
- **Collaborative Filtering**: User-based recommendations using interaction patterns
- **Content-Based Filtering**: Product similarity based on features and characteristics
- **Hybrid Approach**: 60% content-based + 40% collaborative filtering
- **Cold Start Handling**: New user and product recommendations

### 2. AI-Powered Explanations
- **Natural Language**: Personalized explanations using OpenAI GPT
- **Behavior Analysis**: Explanations based on user interaction history
- **Fallback System**: Technical explanations when AI is unavailable
- **Caching**: Efficient explanation caching to reduce API calls

### 3. Business Rules Engine
- **Purchase Filtering**: Exclude already purchased products
- **Category Boosting**: 30% boost for user's preferred categories
- **Diversity Constraints**: Maximum 2 products per category in top results
- **Score Normalization**: Consistent scoring across different algorithms

### 4. Interactive Dashboard
- **User Selection**: Switch between different users to see personalized recommendations
- **LLM Toggle**: Enable/disable AI explanations
- **Real-time Updates**: Dynamic recommendation refresh
- **Product Details**: Comprehensive product information display

### 5. User Interaction Tracking
- **Interaction Types**: View, click, cart_add, purchase
- **Scoring System**: Weighted interaction scores (view=1, click=2, cart=3, purchase=5)
- **Behavior Analysis**: User preference detection and category analysis
- **History Tracking**: Complete interaction timeline

## 🛠️ Setup Instructions

### Prerequisites

- **Python 3.9+**
- **Node.js 18+**
- **PostgreSQL 15+** (or Docker)
- **OpenAI API Key** (for LLM explanations)
- **Git**

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd product-recommender
   ```

2. **Set up environment variables**
   ```bash
   # Create .env file in the root directory
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   # Create .env file
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
   echo "DATABASE_URL=sqlite:///./product_recommender.db" >> .env
   ```

5. **Initialize database**
   ```bash
   python create_db.py
   python seed_data.py  # Optional: Add sample data
   ```

6. **Run the application**
   ```bash
   uvicorn app.main:app --reload
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   echo "VITE_API_BASE_URL=http://localhost:8000" > .env
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 📊 Database Schema

### Products Table
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2),
    image_url VARCHAR(500),
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Interactions Table
```sql
CREATE TABLE user_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    product_id INTEGER REFERENCES products(id),
    interaction_type VARCHAR(20) NOT NULL,
    interaction_score DECIMAL(3,1) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 API Documentation

### Core Endpoints

#### Products
- `GET /products/` - List all products with pagination and filters
- `GET /products/{id}` - Get product by ID
- `GET /products/categories/list` - Get all categories

#### Users
- `GET /users/` - List all users
- `GET /users/{id}` - Get user by ID
- `GET /users/{id}/interactions` - Get user interaction history
- `GET /users/{id}/preferences` - Get user category preferences

#### Recommendations
- `GET /api/recommendations/user/{user_id}` - Get personalized recommendations
- `GET /api/recommendations/product/{product_id}/similar` - Get similar products
- `GET /api/recommendations/user/{user_id}/explain/{product_id}` - Explain recommendation

#### Interactions
- `POST /interactions` - Log new user interaction

### Example API Calls

#### Get Personalized Recommendations
```bash
curl "http://localhost:8000/api/recommendations/user/1?limit=10&use_llm=true"
```

**Response:**
```json
{
  "user_id": 1,
  "username": "tech_enthusiast",
  "algorithm": "hybrid",
  "use_llm": true,
  "total": 10,
  "recommendations": [
    {
      "product_id": 6,
      "product_details": {
        "name": "Wireless Earbuds Pro",
        "category": "Electronics",
        "price": 199.99,
        "image_url": "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1",
        "description": "True wireless earbuds with ANC",
        "tags": ["earbuds", "wireless", "anc", "bluetooth"]
      },
      "recommendation_score": 1.6104,
      "reason_factors": {
        "collaborative_score": 0.1913,
        "content_based_score": 0.6345,
        "category_boost": 1.95,
        "final_score": 1.6104
      },
      "llm_explanation": "Hey there! Since you're a tech enthusiast with a strong preference for electronics, I think you'll really love the Wireless Earbuds Pro. They offer features like active noise cancellation and a sleek wireless design that align perfectly with your interests in innovative gadgets..."
    }
  ]
}
```

## 🤖 Recommendation Algorithm

### Hybrid Approach

The system uses a sophisticated hybrid recommendation approach:

1. **Collaborative Filtering (40%)**
   - User-based collaborative filtering using cosine similarity
   - Item-based collaborative filtering for product similarity
   - Handles cold start problems with popularity-based fallbacks

2. **Content-Based Filtering (60%)**
   - TF-IDF vectorization of product features (name, description, tags)
   - Cosine similarity between user preferences and product features
   - Category-based matching and boosting

3. **Business Rules Engine**
   - **Purchase Filtering**: Exclude already purchased products
   - **Category Boosting**: 30% boost for user's preferred categories
   - **Diversity Constraints**: Maximum 2 products per category
   - **Score Normalization**: Consistent scoring across algorithms

### Algorithm Flow

```mermaid
graph TD
    A[User Request] --> B[Load User Data]
    B --> C[Get User Interactions]
    C --> D[Calculate Collaborative Score]
    C --> E[Calculate Content Score]
    D --> F[Hybrid Combination]
    E --> F
    F --> G[Apply Business Rules]
    G --> H[Category Boost]
    G --> I[Diversity Filter]
    G --> J[Purchase Filter]
    H --> K[Final Recommendations]
    I --> K
    J --> K
    K --> L[Generate LLM Explanations]
    L --> M[Return Results]
```

## 🧠 LLM Integration

### Prompt Engineering

The system uses sophisticated prompt engineering to generate personalized explanations:

```python
prompt = f"""Explain why product "{product_name}" is recommended to this user based on their behavior.

USER BEHAVIOR ANALYSIS:
- User: {username}
- Behavior pattern: {behavior_summary}
- Recent interests: {categories_str}
- Interaction history: {interaction_summary}
- Purchase history: {purchased_count} products

PRODUCT DETAILS:
- Name: {product_name}
- Category: {product_category}
- Price: ${product_price:.2f}
- Description: {product_description}
- Key features: {tags_str}

RECOMMENDATION ALGORITHM SCORES:
- Collaborative filtering (similar users): {collab_score:.2f}
- Content-based matching: {content_score:.2f}
- Category preference boost: {category_boost:.1f}x
- Final recommendation score: {final_score:.2f}

TASK: Provide a personalized, conversational explanation (2-3 sentences) that:
1. Specifically mentions how this product connects to their demonstrated behavior patterns
2. Highlights why this recommendation makes sense based on their interests
3. Uses a friendly, helpful tone as if you're a personal shopping assistant

Focus on the behavioral connection - what about their past actions suggests they would like this product?"""
```

### LLM Features

- **Model Support**: OpenAI GPT-4o-mini, GPT-3.5-turbo, Claude, Gemini
- **Caching**: Intelligent caching to reduce API calls and costs
- **Rate Limiting**: Built-in rate limiting to prevent API throttling
- **Fallback System**: Template-based explanations when API is unavailable
- **Cost Optimization**: Efficient prompt design and caching strategies

## 🎯 Demo Credentials

### Test Users

The system comes with pre-seeded test users:

| User ID | Username | Description | Preferred Categories |
|---------|----------|-------------|-------------------|
| 1 | tech_enthusiast | Loves electronics and gadgets | Electronics, Home |
| 2 | fashion_lover | Interested in clothing and accessories | Fashion, Beauty |
| 3 | book_worm | Enjoys reading and literature | Books, Education |
| 4 | fitness_fanatic | Active lifestyle and sports | Sports, Health |
| 5 | home_decorator | Interior design and home improvement | Home, Garden |

### Sample Interactions

Each user has realistic interaction patterns:
- **View interactions**: Browsing products
- **Click interactions**: Showing interest
- **Cart additions**: Serious consideration
- **Purchases**: Completed transactions

## 🚀 Future Improvements

### Short-term Enhancements
- [ ] **Real-time Recommendations**: WebSocket-based live updates
- [ ] **A/B Testing Framework**: Test different recommendation algorithms
- [ ] **Performance Monitoring**: Detailed analytics and metrics
- [ ] **Mobile App**: React Native mobile application
- [ ] **Advanced Filtering**: Price range, brand, rating filters

### Long-term Vision
- [ ] **Deep Learning Models**: Neural collaborative filtering
- [ ] **Multi-modal Recommendations**: Image and text-based similarity
- [ ] **Federated Learning**: Privacy-preserving recommendation training
- [ ] **Graph Neural Networks**: Complex relationship modeling
- [ ] **Real-time Personalization**: Dynamic recommendation updates

### Scalability Improvements
- [ ] **Microservices Architecture**: Service decomposition
- [ ] **Event Streaming**: Apache Kafka for real-time data
- [ ] **Caching Layer**: Redis for high-performance caching
- [ ] **Load Balancing**: Horizontal scaling capabilities
- [ ] **Database Sharding**: Partition data across multiple databases

## 📸 Screenshots

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x400/6366f1/ffffff?text=Recommendation+Dashboard)

### Product Recommendations
![Recommendations](https://via.placeholder.com/800x400/10b981/ffffff?text=AI-Powered+Recommendations)

### LLM Explanations
![LLM Explanations](https://via.placeholder.com/800x400/f59e0b/ffffff?text=Personalized+Explanations)

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
# Test full recommendation pipeline
python backend/test_recommendation_service.py

# Test LLM integration
python backend/test_llm_service.py
```

## 🚢 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Production environment variables
   export DATABASE_URL=postgresql://user:pass@host:5432/db
   export OPENAI_API_KEY=your_production_key
   export APP_ENV=production
   ```

2. **Database Migration**
   ```bash
   alembic upgrade head
   ```

3. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

4. **Deploy Backend**
   ```bash
   cd backend
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔑 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=sqlite:///./product_recommender.db

# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# Application
APP_ENV=development
DEBUG=True
SECRET_KEY=your_secret_key_here

# LLM Configuration
LLM_MODEL=openai/gpt-4o-mini
LLM_CACHE_TTL=3600
LLM_MAX_REQUESTS_PER_MINUTE=50
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For questions, issues, or contributions:
- **GitHub Issues**: [Create an issue](https://github.com/your-repo/issues)
- **Documentation**: [Full documentation](https://your-docs-site.com)
- **Email**: your-email@example.com

## 🙏 Acknowledgments

- **OpenAI** for providing powerful language models
- **FastAPI** team for the excellent web framework
- **React** team for the amazing frontend library
- **Scikit-learn** for machine learning algorithms
- **PostgreSQL** for robust database management

---

**Built with ❤️ for the future of e-commerce recommendations**