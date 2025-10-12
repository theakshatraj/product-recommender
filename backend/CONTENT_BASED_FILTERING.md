# Content-Based Filtering Documentation

## Overview

The content-based filtering recommendation engine recommends products based on their features and similarity to products the user has previously interacted with.

## Features

### 1. **Product Feature Extraction**

The system extracts and processes three types of features from each product:

#### a) **Category Features (One-Hot Encoded)**
- **Weight:** 40%
- **Method:** One-hot encoding using scikit-learn's OneHotEncoder
- **Purpose:** Captures product category information (e.g., Electronics, Clothing, Books)

#### b) **Price Features (Normalized)**
- **Weight:** 20%
- **Method:** Min-Max normalization to scale prices to [0, 1] range
- **Purpose:** Allows price-based similarity (products in similar price ranges)

#### c) **Tag Features (TF-IDF Vectors)**
- **Weight:** 40%
- **Method:** TF-IDF (Term Frequency-Inverse Document Frequency) vectorization
- **Max Features:** 100 most important terms
- **Purpose:** Captures semantic similarity based on product tags/keywords

### 2. **Similarity Calculation**

- **Method:** Cosine similarity between feature vectors
- **Result:** Similarity matrix (NxN) where N is the number of products
- **Range:** [0, 1] where 1 = identical products, 0 = completely different

### 3. **Recommendation Methods**

#### Method 1: Product-to-Product Similarity
```python
get_similar_products(product_id, n_recommendations=5)
```
Returns products most similar to a given product.

#### Method 2: User-Based Recommendations
```python
get_recommendations_for_user(user_id, n_recommendations=10)
```
Recommends products based on user's interaction history:
1. Fetches user's past interactions
2. For each interacted product, finds similar products
3. Weights similarities by user's interaction scores
4. Aggregates and ranks recommendations

### 4. **Cold Start Handling**

For new users with no interaction history:
- Falls back to popular products
- Popularity based on total interaction counts
- Normalized scores for consistency

## Usage Examples

### Basic Usage

```python
from app.database.connection import SessionLocal
from app.recommender.content_based import ContentBasedRecommender

# Initialize
db = SessionLocal()
recommender = ContentBasedRecommender(db)

# Train the model
recommender.fit()

# Get recommendations for a user
recommendations = recommender.get_recommendations(user_id=1, n_recommendations=10)

# Returns: [(product_id, score), ...]
for product_id, score in recommendations:
    print(f"Product {product_id}: Score {score:.4f}")
```

### Finding Similar Products

```python
# Find products similar to a specific product
similar = recommender.get_similar_products(product_id=5, n_recommendations=5)

for product_id, similarity_score in similar:
    print(f"Product {product_id}: Similarity {similarity_score:.4f}")
```

### Getting Product Features

```python
# Get feature summary for a product (useful for debugging)
features = recommender.get_product_features_summary(product_id=5)

print(f"Name: {features['name']}")
print(f"Category: {features['category']}")
print(f"Price: ${features['price']:.2f}")
print(f"Tags: {features['tags']}")
```

### Saving and Loading Models

```python
# Save trained model
recommender.save_model('content_based_model.pkl')

# Load trained model
recommender.load_model('content_based_model.pkl')
```

## Feature Weights

The default feature weights can be adjusted in the class initialization:

```python
class ContentBasedRecommender:
    def __init__(self, db: Session):
        # ...
        self.category_weight = 0.4  # 40%
        self.price_weight = 0.2     # 20%
        self.tags_weight = 0.4      # 40%
```

### Recommended Weight Adjustments:

- **Fashion/Clothing:** Increase category_weight (0.5), decrease price_weight (0.1)
- **Electronics:** Increase price_weight (0.3), keep category_weight (0.4)
- **Books/Media:** Increase tags_weight (0.5), decrease price_weight (0.1)

## Algorithm Flow

```
1. Initialize ContentBasedRecommender with database session
   ↓
2. Call fit() to train the model
   ↓
3. Fetch all products from database
   ↓
4. Extract features:
   - Categories → One-hot encoding
   - Prices → Min-Max normalization
   - Tags → TF-IDF vectors
   ↓
5. Weight and combine features into feature matrix
   ↓
6. Calculate cosine similarity matrix (NxN)
   ↓
7. Ready for recommendations!
   ↓
8. For user recommendations:
   - Fetch user interactions
   - Find similar products to interacted items
   - Weight by interaction scores
   - Aggregate and rank
   ↓
9. Return top N recommendations with scores
```

## Performance Characteristics

### Time Complexity
- **Training (fit):** O(N·F + N²) where N = products, F = features
- **Recommendation:** O(I·N) where I = user interactions
- **Similar Products:** O(N) lookup

### Space Complexity
- **Feature Matrix:** O(N·F)
- **Similarity Matrix:** O(N²)

### Optimization Tips
1. **Cache the model:** Use `save_model()` to avoid retraining
2. **Batch processing:** Process multiple users together
3. **Feature reduction:** Reduce `max_features` in TF-IDF for faster training
4. **Incremental updates:** Retrain only when new products added

## Advantages & Disadvantages

### ✅ Advantages
1. **No cold start problem for products:** New products can be recommended immediately
2. **Explainable:** Recommendations based on clear feature similarities
3. **No user data needed:** Can work with product data alone
4. **Diverse recommendations:** Doesn't depend on other users

### ❌ Disadvantages
1. **Limited discovery:** Only recommends similar items
2. **Feature engineering required:** Quality depends on good features
3. **No serendipity:** Won't recommend unexpected items
4. **Scalability:** O(N²) similarity matrix can be large

## Integration with Routes

Example route integration:

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.recommender.content_based import ContentBasedRecommender

router = APIRouter()

@router.get("/recommendations/content-based/{user_id}")
def get_content_based_recommendations(
    user_id: int,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    recommender = ContentBasedRecommender(db)
    recommender.fit()
    
    recommendations = recommender.get_recommendations(user_id, n_recommendations=limit)
    
    # Fetch product details
    product_ids = [pid for pid, _ in recommendations]
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    
    # Create response
    results = []
    for product in products:
        score = next(s for pid, s in recommendations if pid == product.id)
        results.append({
            "product": product,
            "score": score
        })
    
    return results
```

## Testing

Run the test script:

```bash
cd backend
python test_content_based.py
```

This will:
1. Train the content-based model
2. Test product similarity
3. Test user recommendations
4. Display feature extraction results

## Troubleshooting

### Issue: "No products found in database"
**Solution:** Run `python seed_data.py` to populate the database

### Issue: "No recommendations found"
**Solution:** Ensure products have tags and the user has some interactions

### Issue: "Feature matrix is empty"
**Solution:** Check that products have valid category, price, and tags fields

### Issue: Model is slow to train
**Solution:** 
- Reduce `max_features` in TfidfVectorizer (default: 100)
- Use `save_model()` and `load_model()` to cache trained models

## Future Enhancements

1. **Description-based features:** Add TF-IDF on product descriptions
2. **Image features:** Extract CNN features from product images
3. **Temporal features:** Consider product creation date, trending items
4. **Dynamic weights:** Learn optimal feature weights from data
5. **Sparse matrices:** Use sparse matrices for large-scale deployment


