# LLM Service Guide

## Overview

The `LLMService` generates personalized, natural language explanations for product recommendations using OpenAI's GPT models. It includes intelligent caching, rate limiting, and graceful error handling.

## Features

### 1. **OpenAI API Integration**
- Support for GPT-4 and GPT-3.5-turbo
- Configurable model selection
- Automatic error handling with fallbacks

### 2. **Intelligent Caching**
- In-memory cache with configurable TTL (default: 1 hour)
- Automatic cache key generation from user/product/factors
- Cache statistics tracking
- Prevents redundant API calls for same recommendations

### 3. **Rate Limiting**
- Configurable requests per minute (default: 50)
- Automatic waiting when limit approached
- Prevents API throttling
- Request tracking and management

### 4. **Error Handling**
- Graceful degradation to fallback explanations
- Rate limit error handling with retry
- Connection error handling
- Comprehensive logging

### 5. **Performance Tracking**
- Total requests counter
- API call tracking
- Cache hit rate monitoring
- Average API response time
- Error rate tracking

## Installation & Setup

### Prerequisites

```bash
pip install openai python-dotenv
```

### API Key Configuration

**Option 1: Environment Variable**
```bash
# Windows PowerShell
$env:OPENAI_API_KEY="sk-your-api-key-here"

# Linux/Mac
export OPENAI_API_KEY="sk-your-api-key-here"
```

**Option 2: .env File**
```bash
# Create .env file in backend directory
echo "OPENAI_API_KEY=sk-your-api-key-here" > .env
```

**Option 3: Direct in Code**
```python
llm_service = LLMService(api_key="sk-your-api-key-here")
```

### Get an OpenAI API Key

1. Visit https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy and save the key securely

## Usage

### Basic Usage

```python
from app.services.llm_service import LLMService

# Initialize service
llm_service = LLMService(
    model="gpt-3.5-turbo",
    cache_ttl=3600,
    max_requests_per_minute=50
)

# Prepare data
user_data = {
    "user_id": 1,
    "username": "john_doe",
    "preferred_categories": ["Electronics", "Books"],
    "interaction_summary": "laptops and tech accessories",
    "purchased_count": 5
}

product = {
    "product_id": 42,
    "name": "Wireless Headphones",
    "category": "Electronics",
    "price": 79.99,
    "description": "High-quality wireless headphones",
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
# Output: "We think you'll love these Wireless Headphones! Based on your interest 
#          in Electronics and tech accessories, this product is a perfect match. 
#          Other users with similar preferences have highly rated this item."
```

### Integration with Recommendation Service

```python
from app.services.recommendation_service import RecommendationService
from app.services.llm_service import LLMService
from app.database.connection import SessionLocal

# Initialize services
db = SessionLocal()
rec_service = RecommendationService(db)
llm_service = LLMService()

# Get recommendations
recommendations = rec_service.get_recommendations(user_id=1, n_recommendations=10)

# Generate explanations for each recommendation
for rec in recommendations:
    # Prepare data
    user_data = {
        "user_id": 1,
        "username": "john_doe",
        "preferred_categories": rec_service.get_user_preferred_categories(1),
        "interaction_summary": "various products",
        "purchased_count": len(rec_service.get_purchased_product_ids(1))
    }
    
    product = {
        "product_id": rec.product_id,
        "name": rec.product_name,
        "category": rec.product_category,
        "price": rec.product_price,
        "description": rec.product_description,
        "tags": rec.product_tags
    }
    
    # Generate explanation
    explanation = llm_service.generate_explanation(
        user_data=user_data,
        product=product,
        recommendation_factors=rec.reason_factors
    )
    
    print(f"\n{rec.product_name}:")
    print(f"  {explanation}")

db.close()
```

### Advanced Configuration

```python
# Use GPT-4 with custom settings
llm_service = LLMService(
    api_key="sk-your-key",
    model="gpt-4",
    cache_ttl=7200,  # 2 hours
    max_requests_per_minute=30  # Lower limit for GPT-4
)

# Clear cache manually
llm_service.clear_cache()

# Get performance metrics
metrics = llm_service.get_metrics()
print(f"Cache hit rate: {metrics['cache_stats']['hit_rate_percent']}%")

# Reset metrics
llm_service.reset_metrics()
```

## API Reference

### LLMService Class

#### Constructor

```python
LLMService(
    api_key: Optional[str] = None,
    model: str = "gpt-3.5-turbo",
    cache_ttl: int = 3600,
    max_requests_per_minute: int = 50
)
```

**Parameters:**
- `api_key`: OpenAI API key (default: from OPENAI_API_KEY env var)
- `model`: OpenAI model to use (default: "gpt-3.5-turbo")
- `cache_ttl`: Cache time-to-live in seconds (default: 3600 = 1 hour)
- `max_requests_per_minute`: Rate limit (default: 50)

#### generate_explanation()

```python
def generate_explanation(
    user_data: Dict,
    product: Dict,
    recommendation_factors: Dict
) -> str
```

**Parameters:**

**user_data** (required):
```python
{
    "user_id": int,                    # Required
    "username": str,                   # Required
    "preferred_categories": List[str], # Required
    "interaction_summary": str,        # Required
    "purchased_count": int             # Optional, default: 0
}
```

**product** (required):
```python
{
    "product_id": int,      # Required
    "name": str,            # Required
    "category": str,        # Required
    "price": float,         # Required
    "description": str,     # Optional
    "tags": List[str]       # Optional
}
```

**recommendation_factors** (required):
```python
{
    "collaborative_score": float,  # Required
    "content_based_score": float,  # Required
    "category_boost": float,       # Optional, default: 1.0
    "final_score": float          # Required
}
```

**Returns:** String (2-3 sentence explanation)

#### Other Methods

```python
# Get performance metrics
metrics = llm_service.get_metrics()

# Reset metrics
llm_service.reset_metrics()

# Clear cache
llm_service.clear_cache()
```

## Prompt Template

The service uses this prompt structure:

```
You are a helpful shopping assistant. Explain why we recommend "{product_name}" to this user.

User's recent interests: {categories}
User's past purchases: {count} products
User has shown interest in: {interaction_summary}

Product details:
- Name: {product_name}
- Category: {product_category}
- Price: ${price}
- Features: {tags}

Recommendation factors:
- Collaborative filtering score: {collab_score}
- Content similarity score: {content_score}
- Category preference match: {yes/no}
- Overall match score: {final_score}

Primary reason: {reason}

Provide a friendly, concise explanation (2-3 sentences) focusing on why this product matches their preferences.
```

## Caching

### How It Works

1. **Cache Key Generation**:
   - Combines user_id, product_id, and recommendation_factors
   - Hashed using MD5 for consistent keys

2. **Cache Lookup**:
   - Checks cache before API call
   - Returns cached explanation if available and not expired

3. **Cache Storage**:
   - Stores explanation with timestamp
   - Automatically expires after TTL

4. **Cache Statistics**:
   - Tracks hits, misses, and hit rate
   - Provides cache size information

### Cache Configuration

```python
# Short cache (5 minutes)
llm_service = LLMService(cache_ttl=300)

# Long cache (24 hours)
llm_service = LLMService(cache_ttl=86400)

# No cache
llm_service = LLMService(cache_ttl=0)
```

### Manual Cache Management

```python
# Clear entire cache
llm_service.clear_cache()

# View cache statistics
stats = llm_service.cache.get_stats()
print(f"Cache size: {stats['cache_size']}")
print(f"Hit rate: {stats['hit_rate_percent']}%")
```

## Rate Limiting

### How It Works

1. **Request Tracking**:
   - Records timestamp of each API request
   - Maintains sliding window of last minute

2. **Limit Checking**:
   - Before each API call, checks if limit reached
   - Waits if necessary to stay within limit

3. **Automatic Wait**:
   - Calculates wait time until oldest request expires
   - Sleeps automatically to prevent throttling

### Rate Limit Configuration

```python
# Conservative (20 requests/minute)
llm_service = LLMService(max_requests_per_minute=20)

# Aggressive (100 requests/minute)
llm_service = LLMService(max_requests_per_minute=100)

# OpenAI default tier
llm_service = LLMService(max_requests_per_minute=3500)
```

## Error Handling

### Automatic Fallback

When OpenAI API is unavailable:
1. Service detects error
2. Logs error with details
3. Generates template-based explanation
4. Returns fallback gracefully
5. Tracks fallback usage in metrics

### Fallback Explanation Logic

```python
# Fallback rules:
if category_boost > 1.0:
    # User prefers this category
    explanation = "...matches your interest in {category}..."
elif collaborative_score > content_score:
    # Similar users liked it
    explanation = "...users with similar tastes loved it..."
else:
    # Content similarity
    explanation = "...similar to items you enjoyed..."
```

### Error Types Handled

1. **No API Key**: Uses fallback immediately
2. **Rate Limit Error**: Waits and retries
3. **Connection Error**: Falls back gracefully
4. **API Error**: Falls back with logging
5. **Invalid Response**: Falls back with error tracking

## Performance

### Expected Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| API Response Time | 1-3s | Depends on model |
| Cache Hit Rate | 40-60% | With typical usage |
| Fallback Rate | <5% | With valid API key |
| Rate Limit Hits | 0% | With proper configuration |

### Optimization Tips

1. **Use Caching**: Set appropriate TTL for your use case
2. **Choose Right Model**: GPT-3.5-turbo is faster than GPT-4
3. **Batch Requests**: Generate multiple explanations together
4. **Monitor Metrics**: Track cache hit rate and API time
5. **Configure Rate Limits**: Match your OpenAI tier

### Cost Optimization

```python
# GPT-3.5-turbo (cheaper, faster)
llm_service = LLMService(model="gpt-3.5-turbo")

# Longer cache (fewer API calls)
llm_service = LLMService(cache_ttl=7200)  # 2 hours

# Monitor costs
metrics = llm_service.get_metrics()
print(f"API calls: {metrics['api_calls']}")
print(f"Cache saves: {metrics['cache_hits']}")
```

## Testing

### Run Test Suite

```bash
cd backend
python test_llm_service.py
```

### Test Coverage

- ✅ Basic explanation generation
- ✅ Caching functionality
- ✅ Rate limiting
- ✅ Error handling
- ✅ Fallback explanations
- ✅ Performance metrics
- ✅ Multiple scenarios (category boost, collaborative, content-based)

### Manual Testing

```python
from app.services.llm_service import LLMService

# Test with your API key
llm_service = LLMService(api_key="sk-your-key")

# Generate explanation
explanation = llm_service.generate_explanation(
    user_data={
        "user_id": 1,
        "username": "test_user",
        "preferred_categories": ["Electronics"],
        "interaction_summary": "gadgets",
        "purchased_count": 3
    },
    product={
        "product_id": 1,
        "name": "Smart Watch",
        "category": "Electronics",
        "price": 299.99,
        "tags": ["smart", "wearable", "fitness"]
    },
    recommendation_factors={
        "collaborative_score": 0.5,
        "content_based_score": 0.4,
        "final_score": 0.9
    }
)

print(explanation)
```

## Troubleshooting

### Issue: "No API key found"

**Solution:**
```bash
# Set environment variable
$env:OPENAI_API_KEY="sk-your-key"  # PowerShell

# Or create .env file
echo "OPENAI_API_KEY=sk-your-key" > .env
```

### Issue: "Rate limit exceeded"

**Solution:**
```python
# Lower rate limit
llm_service = LLMService(max_requests_per_minute=20)

# Or use longer cache
llm_service = LLMService(cache_ttl=7200)
```

### Issue: "API connection errors"

**Solution:**
- Check internet connection
- Verify API key is valid
- Check OpenAI service status
- Service will automatically use fallback

### Issue: "Explanations are too similar"

**Solution:**
```python
# Clear cache for fresh generation
llm_service.clear_cache()

# Adjust temperature (in _call_openai_api)
# Higher temperature = more varied responses
```

## Best Practices

1. **Set Appropriate Cache TTL**
   - Short TTL (5-15 min) for dynamic content
   - Long TTL (1-2 hours) for stable recommendations

2. **Monitor Performance**
   - Regularly check metrics
   - Adjust rate limits based on usage
   - Track cache hit rate

3. **Handle Errors Gracefully**
   - Always have fallback ready
   - Log errors for debugging
   - Don't expose API errors to users

4. **Optimize Costs**
   - Use GPT-3.5-turbo for production
   - Implement aggressive caching
   - Use fallback for non-critical cases

5. **Test Thoroughly**
   - Test with and without API key
   - Test rate limiting behavior
   - Test error scenarios

## Examples

### Example 1: Basic Integration

```python
llm_service = LLMService()

explanation = llm_service.generate_explanation(
    user_data={
        "user_id": 1,
        "username": "alice",
        "preferred_categories": ["Books", "Education"],
        "interaction_summary": "programming books and online courses",
        "purchased_count": 5
    },
    product={
        "product_id": 10,
        "name": "Python for Data Science",
        "category": "Books",
        "price": 45.99,
        "description": "Comprehensive Python guide",
        "tags": ["python", "data-science", "programming"]
    },
    recommendation_factors={
        "collaborative_score": 0.6,
        "content_based_score": 0.3,
        "category_boost": 1.3,
        "final_score": 0.95
    }
)

print(explanation)
```

### Example 2: Batch Processing

```python
llm_service = LLMService()

recommendations = [...]  # List of recommendations

explanations = []
for rec in recommendations:
    explanation = llm_service.generate_explanation(
        user_data=prepare_user_data(user_id),
        product=rec.to_product_dict(),
        recommendation_factors=rec.reason_factors
    )
    explanations.append(explanation)
```

### Example 3: With Metrics Monitoring

```python
llm_service = LLMService()

# Generate explanations
for product in products:
    explanation = llm_service.generate_explanation(...)

# Check performance
metrics = llm_service.get_metrics()

if metrics['cache_stats']['hit_rate_percent'] < 30:
    print("Warning: Low cache hit rate!")

if metrics['errors'] > 0:
    print(f"Errors occurred: {metrics['errors']}")
```

## Support

For issues:
1. Check logs for error messages
2. Verify API key is valid
3. Test with fallback mode
4. Review OpenAI service status
5. Check rate limits and quotas

## License

Part of the Product Recommender System

