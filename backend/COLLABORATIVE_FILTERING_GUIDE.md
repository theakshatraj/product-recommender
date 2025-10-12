# Collaborative Filtering Recommendation Engine

## Overview

The collaborative filtering recommendation engine implements three approaches to generate personalized product recommendations:

1. **User-Based Collaborative Filtering** - Finds similar users and recommends products they liked
2. **Item-Based Collaborative Filtering** - Finds similar products based on co-interaction patterns
3. **Hybrid Approach** - Combines both methods with weights (60% user-based, 40% item-based)

The system also includes automatic cold-start handling for new users with no interaction history.

---

## Architecture

### Core Components

```
CollaborativeFiltering
├── User-Item Matrix (pandas DataFrame)
│   ├── Rows: Users
│   ├── Columns: Products
│   └── Values: Interaction scores
│
├── User Similarity Matrix (cosine similarity)
│   └── Measures similarity between users based on their interactions
│
└── Item Similarity Matrix (cosine similarity)
    └── Measures similarity between products based on co-interaction patterns
```

---

## Algorithms

### 1. User-Based Collaborative Filtering

**Concept**: Users who interacted with similar products in the past will likely have similar preferences in the future.

**Steps**:
1. Calculate cosine similarity between all users based on their interaction vectors
2. For a target user, find top 5 similar users
3. Recommend products that similar users interacted with but the target user hasn't
4. Weight recommendations by user similarity scores

**Formula**:
```
similarity(u1, u2) = cosine_similarity(interactions_u1, interactions_u2)

score(product_p, user_u) = Σ (similarity(u, similar_user) × interaction_score(similar_user, p))
```

**Advantages**:
- Captures diverse preferences from similar users
- Good for discovering new products
- Works well with sufficient user interaction data

**Limitations**:
- Requires substantial user base
- Computationally expensive with many users
- Can be affected by changing user preferences

---

### 2. Item-Based Collaborative Filtering

**Concept**: Products that are frequently co-interacted with are similar, so recommend products similar to those the user already liked.

**Steps**:
1. Calculate cosine similarity between all products based on user interaction patterns
2. For each product the user interacted with, find similar products
3. Weight similarity by the user's interaction score with the source product
4. Aggregate scores across all user's interactions

**Formula**:
```
similarity(p1, p2) = cosine_similarity(users_interacted_p1, users_interacted_p2)

score(product_p, user_u) = Σ (similarity(p, user_product) × interaction_score(u, user_product))
```

**Advantages**:
- More stable than user-based (product relationships change slowly)
- Scales better with large user bases
- Provides intuitive recommendations ("because you liked X")

**Limitations**:
- Can create filter bubbles (limited diversity)
- Requires products with multiple interactions
- Cold-start problem for new products

---

### 3. Hybrid Approach

**Concept**: Combine strengths of both methods for better overall performance.

**Implementation**:
```
hybrid_score = (user_based_score × 0.6) + (item_based_score × 0.4)
```

**Rationale**:
- 60% user-based: Emphasizes diversity and discovery
- 40% item-based: Ensures relevance to user's existing preferences

**Advantages**:
- Balances exploration (discovery) and exploitation (relevance)
- More robust than individual methods
- Better handles edge cases

---

## Interaction Scoring

Different interaction types have different weights:

| Interaction Type | Score | Weight Rationale |
|-----------------|-------|------------------|
| VIEW | 1.0 | Passive interest |
| CLICK | 2.0 | Active interest |
| CART_ADD | 3.0 | High purchase intent |
| PURCHASE | 5.0 | Strongest signal |

Multiple interactions with the same product are aggregated (summed).

---

## Cold-Start Handling

### Problem
New users with no interaction history cannot be matched with similar users or have their preferences analyzed.

### Solution
**Fallback to Popular Products**: Recommend products with highest total interaction scores across all users.

```python
popularity_score(product) = Σ all_user_interactions(product)
```

This provides reasonable recommendations while the system gathers user preference data.

---

## Usage Examples

### Basic Usage

```python
from sqlalchemy.orm import Session
from app.recommender.collaborative_filtering import CollaborativeFiltering

# Initialize with database session
cf_engine = CollaborativeFiltering(db)

# Train the model (builds matrices and calculates similarities)
cf_engine.fit()

# Get hybrid recommendations (default, recommended)
recommendations = cf_engine.get_recommendations(user_id=1, n_recommendations=10)
# Returns: [(product_id, score), (product_id, score), ...]
```

### Specific Methods

```python
# User-based only
user_recs = cf_engine.get_recommendations(user_id=1, method='user_based')

# Item-based only
item_recs = cf_engine.get_recommendations(user_id=1, method='item_based')

# Hybrid (default)
hybrid_recs = cf_engine.get_recommendations(user_id=1, method='hybrid')

# Popular products (cold-start fallback)
popular = cf_engine.get_popular_products(n_recommendations=10)
```

---

## Performance Considerations

### Scalability

**Time Complexity**:
- Matrix building: O(n × m) where n = users, m = products
- Similarity calculation: O(n² × m) for user-based, O(m² × n) for item-based
- Recommendation generation: O(n × m) per user

**Space Complexity**:
- User-item matrix: O(n × m)
- Similarity matrices: O(n²) + O(m²)

### Optimization Strategies

1. **Incremental Updates**: Instead of full retraining, update matrices incrementally
2. **Dimensionality Reduction**: Use techniques like SVD for large datasets
3. **Caching**: Cache similarity calculations and popular products
4. **Sampling**: Use neighborhood sampling for large user bases
5. **Sparse Matrices**: Utilize sparse matrix representations for efficiency

---

## Evaluation Metrics

### Recommended Metrics

1. **Precision@K**: Proportion of recommended items that are relevant
   ```
   Precision@K = (relevant items in top K) / K
   ```

2. **Recall@K**: Proportion of relevant items that are recommended
   ```
   Recall@K = (relevant items in top K) / (total relevant items)
   ```

3. **Mean Average Precision (MAP)**: Average precision across all users

4. **NDCG (Normalized Discounted Cumulative Gain)**: Ranking quality metric

5. **Coverage**: Percentage of products that can be recommended
   ```
   Coverage = (unique products recommended) / (total products)
   ```

6. **Diversity**: Variety in recommendations (intra-list diversity)

---

## Testing

Run the comprehensive test suite:

```bash
cd backend
python test_collaborative_filtering.py
```

This tests:
- User-based collaborative filtering
- Item-based collaborative filtering
- Hybrid recommendations
- Cold-start user handling
- Similarity matrix calculations
- Popular product fallback

---

## Integration with API

The collaborative filtering engine integrates with the recommendations API:

```python
# In recommendations route
@router.get("/recommendations/{user_id}")
async def get_recommendations(user_id: int, db: Session = Depends(get_db)):
    cf_engine = CollaborativeFiltering(db)
    cf_engine.fit()
    
    recommendations = cf_engine.get_recommendations(
        user_id=user_id,
        n_recommendations=10,
        method='hybrid'
    )
    
    # Fetch product details
    product_ids = [prod_id for prod_id, score in recommendations]
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    
    return products
```

---

## Advantages & Limitations

### Advantages ✅

- **No content needed**: Works purely on interaction patterns
- **Discovers hidden patterns**: Finds non-obvious relationships
- **Personalized**: Tailored to individual user preferences
- **Domain-independent**: Works for any product type
- **Improves over time**: More data → better recommendations

### Limitations ⚠️

- **Cold-start problem**: Struggles with new users/products
- **Sparsity**: Requires sufficient interaction data
- **Scalability**: Can be computationally expensive
- **Filter bubble**: May limit discovery of diverse products
- **Popular item bias**: Tends to recommend already popular items

---

## Future Enhancements

1. **Matrix Factorization**: Implement SVD/ALS for better scalability
2. **Time Decay**: Weight recent interactions more heavily
3. **Context-Aware**: Consider time, location, device
4. **Multi-Armed Bandit**: Balance exploration vs exploitation
5. **Deep Learning**: Neural collaborative filtering
6. **Diversity Optimization**: Ensure diverse recommendations
7. **Explanation Generation**: Provide reasons for recommendations

---

## References

- **Collaborative Filtering**: Goldberg et al., 1992
- **Item-Based CF**: Sarwar et al., 2001
- **Hybrid Recommender Systems**: Burke, 2002
- **Matrix Factorization**: Koren et al., 2009

---

## Support

For issues or questions:
1. Check the API documentation: `API_DOCUMENTATION.md`
2. Review test examples: `test_collaborative_filtering.py`
3. See endpoints summary: `ENDPOINTS_SUMMARY.md`

