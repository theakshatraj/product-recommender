# LLM Service - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Set Your OpenAI API Key

**Windows PowerShell:**
```powershell
$env:OPENAI_API_KEY="sk-your-api-key-here"
```

**Linux/Mac:**
```bash
export OPENAI_API_KEY="sk-your-api-key-here"
```

Don't have an API key? Get one at: https://platform.openai.com/api-keys

### 2. Test the Service

```bash
cd backend
python test_llm_service.py
```

### 3. Use with API

```bash
# Get recommendations with LLM explanations
curl "http://localhost:8000/api/recommendations/user/1?limit=5&use_llm=true"
```

---

## 📋 Common Operations

### Get Recommendations with LLM Explanations

```bash
# With LLM (requires API key)
curl "http://localhost:8000/api/recommendations/user/1?limit=10&use_llm=true"

# Without LLM (faster, no API key needed)
curl "http://localhost:8000/api/recommendations/user/1?limit=10&use_llm=false"
```

### View LLM Metrics

```bash
curl "http://localhost:8000/api/recommendations/llm/metrics"
```

### Clear LLM Cache

```bash
curl -X DELETE "http://localhost:8000/api/recommendations/llm/cache"
```

---

## 🐍 Python Usage

### Basic Example

```python
from app.services.llm_service import LLMService

# Initialize
llm_service = LLMService()

# Prepare data
user_data = {
    "user_id": 1,
    "username": "john_doe",
    "preferred_categories": ["Electronics", "Books"],
    "interaction_summary": "laptops and headphones",
    "purchased_count": 5
}

product = {
    "product_id": 42,
    "name": "Wireless Headphones",
    "category": "Electronics",
    "price": 79.99,
    "description": "High-quality headphones",
    "tags": ["wireless", "bluetooth", "audio"]
}

recommendation_factors = {
    "collaborative_score": 0.45,
    "content_based_score": 0.35,
    "category_boost": 1.3,
    "final_score": 0.92
}

# Generate explanation
explanation = llm_service.generate_explanation(
    user_data=user_data,
    product=product,
    recommendation_factors=recommendation_factors
)

print(explanation)
```

### With Recommendation Service

```python
from app.services.recommendation_service import RecommendationService
from app.services.llm_service import LLMService
from app.database.connection import SessionLocal

# Initialize
db = SessionLocal()
rec_service = RecommendationService(db)
llm_service = LLMService()

# Get recommendations
recommendations = rec_service.get_recommendations(user_id=1, n_recommendations=5)

# Add LLM explanations
for rec in recommendations:
    user_data = {
        "user_id": 1,
        "username": "john_doe",
        "preferred_categories": ["Electronics"],
        "interaction_summary": "tech products",
        "purchased_count": 3
    }
    
    product = {
        "product_id": rec.product_id,
        "name": rec.product_name,
        "category": rec.product_category,
        "price": rec.product_price,
        "description": rec.product_description,
        "tags": rec.product_tags
    }
    
    explanation = llm_service.generate_explanation(
        user_data=user_data,
        product=product,
        recommendation_factors=rec.reason_factors
    )
    
    print(f"\n{rec.product_name}")
    print(f"  Score: {rec.recommendation_score:.2f}")
    print(f"  Explanation: {explanation}")

db.close()
```

---

## ⚙️ Configuration

### Choose Model

```python
# GPT-3.5-turbo (faster, cheaper) - Recommended
llm_service = LLMService(model="gpt-3.5-turbo")

# GPT-4 (better quality, more expensive)
llm_service = LLMService(model="gpt-4")
```

### Adjust Cache

```python
# Short cache (5 minutes)
llm_service = LLMService(cache_ttl=300)

# Long cache (2 hours) - Recommended
llm_service = LLMService(cache_ttl=7200)

# Very long cache (24 hours)
llm_service = LLMService(cache_ttl=86400)
```

### Set Rate Limits

```python
# Conservative (20 requests/minute)
llm_service = LLMService(max_requests_per_minute=20)

# Default (50 requests/minute)
llm_service = LLMService(max_requests_per_minute=50)

# Aggressive (100 requests/minute)
llm_service = LLMService(max_requests_per_minute=100)
```

---

## 📊 Example Response

### With LLM Explanation

```json
{
  "product_id": 42,
  "product_details": {
    "name": "Wireless Headphones",
    "category": "Electronics",
    "price": 79.99
  },
  "recommendation_score": 0.8542,
  "reason_factors": {
    "collaborative_score": 0.3542,
    "content_based_score": 0.2184,
    "final_score": 0.8542
  },
  "llm_explanation": "We think you'll love these Wireless Headphones! Based on your interest in Electronics and tech accessories, this product is a perfect match. Other users with similar preferences have highly rated this item."
}
```

---

## 💡 Without API Key (Fallback)

The service works without an OpenAI API key by using template-based fallback explanations:

```python
# No API key needed!
llm_service = LLMService()

explanation = llm_service.generate_explanation(...)
# Returns: "We recommend 'Wireless Headphones' because you've shown 
#          strong interest in Electronics products. This matches your 
#          browsing preferences and is similar to items you've enjoyed before."
```

---

## 🎯 Performance Metrics

### View Metrics

```python
metrics = llm_service.get_metrics()

print(f"Total requests: {metrics['total_requests']}")
print(f"API calls: {metrics['api_calls']}")
print(f"Cache hits: {metrics['cache_hits']}")
print(f"Cache hit rate: {metrics['cache_stats']['hit_rate_percent']}%")
print(f"Avg API time: {metrics['avg_api_time_seconds']}s")
```

### Cache Statistics

```python
stats = llm_service.cache.get_stats()

print(f"Cache size: {stats['cache_size']} entries")
print(f"Hits: {stats['hits']}")
print(f"Misses: {stats['misses']}")
print(f"Hit rate: {stats['hit_rate_percent']}%")
```

---

## 🐛 Troubleshooting

### Issue: "No API key found"

```bash
# Set environment variable
$env:OPENAI_API_KEY="sk-your-key"

# Or use fallback (no API key needed)
# Service automatically uses fallback when no key available
```

### Issue: "Rate limit exceeded"

```python
# Lower rate limit
llm_service = LLMService(max_requests_per_minute=20)

# Or use longer cache
llm_service = LLMService(cache_ttl=7200)
```

### Issue: Slow responses

```python
# Use GPT-3.5-turbo instead of GPT-4
llm_service = LLMService(model="gpt-3.5-turbo")

# Increase cache TTL
llm_service = LLMService(cache_ttl=7200)
```

---

## 💰 Cost Optimization

### Best Practices

1. **Use GPT-3.5-turbo** (10x cheaper than GPT-4)
2. **Enable caching** (50-90% cost reduction)
3. **Set appropriate TTL** (1-2 hours recommended)
4. **Use fallback for non-critical** cases

### Estimated Costs

**With caching (1-hour TTL):**
- ~$0.10-0.50 per 1000 recommendations
- Cache hit rate: 40-60%

**Without caching:**
- ~$1.00-3.00 per 1000 recommendations
- Every request hits API

---

## 📖 Documentation

- **Complete Guide**: `LLM_SERVICE_GUIDE.md`
- **Environment Setup**: `ENV_SETUP.md`
- **Completion Report**: `PHASE_4_STEP_4.1_COMPLETION.md`
- **API Docs**: http://localhost:8000/docs

---

## ✅ Checklist

- [ ] Set OPENAI_API_KEY environment variable
- [ ] Run test suite: `python test_llm_service.py`
- [ ] Test API with `use_llm=true`
- [ ] Check metrics: `GET /api/recommendations/llm/metrics`
- [ ] Configure cache TTL based on your needs
- [ ] Set rate limits appropriate for your tier
- [ ] Monitor cache hit rate
- [ ] Review generated explanations

---

## 🚀 Ready to Use!

The LLM service is production-ready and integrated with the recommendation API. Start generating personalized explanations for your users today!

**Features:**
✅ OpenAI GPT integration  
✅ Intelligent caching  
✅ Rate limiting  
✅ Error handling  
✅ Fallback support  
✅ Performance tracking  
✅ Cost optimization  

**Happy explaining!** 🎉

