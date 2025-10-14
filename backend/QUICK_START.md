# Quick Start Guide - Recommendation Service

## 🚀 Get Started in 3 Steps

### 1. Start the Server
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Train Models (First Time)
```bash
curl -X POST http://localhost:8000/api/recommendations/train
```

### 3. Get Recommendations
```bash
curl "http://localhost:8000/api/recommendations/user/1?limit=10"
```

---

## 📋 Common Operations

### Get Recommendations for User
```bash
# With business rules (default)
curl "http://localhost:8000/api/recommendations/user/1?limit=10&apply_rules=true"

# Without business rules
curl "http://localhost:8000/api/recommendations/user/1?limit=10&apply_rules=false"
```

### Get Similar Products
```bash
curl "http://localhost:8000/api/recommendations/product/5/similar?limit=5"
```

### Explain Recommendation
```bash
curl "http://localhost:8000/api/recommendations/user/1/explain/42"
```

### View Performance Metrics
```bash
curl "http://localhost:8000/api/recommendations/metrics"
```

### Train Models
```bash
curl -X POST "http://localhost:8000/api/recommendations/train"
```

### View User Preferences
```bash
curl "http://localhost:8000/api/recommendations/user/1/preferences"
```

---

## 🧪 Testing

### Run Test Suite
```bash
cd backend
python test_recommendation_service.py
```

### Run Specific Test
```python
# In Python
from app.database.connection import SessionLocal
from app.services.recommendation_service import RecommendationService

db = SessionLocal()
rec_service = RecommendationService(db)
rec_service.train_models()

# Get recommendations
recs = rec_service.get_recommendations(user_id=1, n_recommendations=10)
for rec in recs:
    print(f"{rec.product_name}: {rec.recommendation_score}")

db.close()
```

---

## 📊 Example Response

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
  ]
}
```

---

## 🔧 Configuration

### Adjust Weights
```python
from app.services.recommendation_service import RecommendationService

rec_service = RecommendationService(db)

# Change hybrid weights
rec_service.collaborative_weight = 0.7
rec_service.content_based_weight = 0.3

# Adjust business rules
rec_service.category_boost_factor = 1.5  # 50% boost
rec_service.max_products_per_category = 3
rec_service.diversity_penalty = 0.9
```

---

## 📖 Documentation

- **Full Guide**: `RECOMMENDATION_SERVICE_GUIDE.md`
- **API Reference**: `ENHANCED_API_ENDPOINTS.md`
- **Phase 3 Summary**: `PHASE_3_IMPLEMENTATION_SUMMARY.md`
- **Completion Report**: `STEP_3.3_COMPLETION_REPORT.md`
- **API Docs**: http://localhost:8000/docs

---

## ⚡ Performance Tips

1. **Pre-train models** before accepting traffic
2. **Monitor metrics** regularly
3. **Adjust weights** based on your use case
4. **Schedule training** during off-peak hours
5. **Use indexes** on database foreign keys

---

## 🐛 Troubleshooting

### No recommendations returned?
- Ensure database has seeded data
- Check if models are trained
- Verify user exists in database

### Slow response times?
- Train models using `/api/recommendations/train`
- Check database indexes
- Monitor metrics

### Same products recommended?
- Adjust diversity constraints
- Add more products to database
- Check user interaction history

---

## 📞 Quick Links

- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health
- **Root Endpoint**: http://localhost:8000/

---

## ✨ Features

✅ Hybrid recommendation (60/40 collaborative/content-based)  
✅ Business rules (purchase filter, category boost, diversity)  
✅ Detailed scoring breakdown  
✅ Performance metrics  
✅ Model training API  
✅ Cold-start handling  
✅ Comprehensive logging  

---

**Ready to go!** 🚀

