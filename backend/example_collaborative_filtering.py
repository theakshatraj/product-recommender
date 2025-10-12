"""
Example Usage: Collaborative Filtering Recommendation Engine

This script demonstrates how to use the collaborative filtering system
in your application code.
"""

from app.database.connection import get_db
from app.recommender.collaborative_filtering import CollaborativeFiltering
from app.database.models import User, Product


def example_basic_usage():
    """Example 1: Basic recommendation retrieval"""
    print("=" * 80)
    print("EXAMPLE 1: Basic Recommendation Retrieval")
    print("=" * 80)
    
    db = next(get_db())
    
    try:
        # Initialize the collaborative filtering engine
        cf_engine = CollaborativeFiltering(db)
        
        # Train the model (builds matrices and calculates similarities)
        print("\n1. Training the collaborative filtering model...")
        cf_engine.fit()
        print(f"   ✓ Model trained with {len(cf_engine.user_id_to_idx)} users and {len(cf_engine.product_id_to_idx)} products")
        
        # Get recommendations for user ID 1
        user_id = 1
        print(f"\n2. Getting recommendations for user {user_id}...")
        
        recommendations = cf_engine.get_recommendations(
            user_id=user_id,
            n_recommendations=10,
            method='hybrid'  # 'user_based', 'item_based', or 'hybrid'
        )
        
        print(f"   ✓ Found {len(recommendations)} recommendations")
        
        # Display recommendations
        print("\n3. Top 5 Recommendations:")
        for i, (product_id, score) in enumerate(recommendations[:5], 1):
            product = db.query(Product).filter(Product.id == product_id).first()
            if product:
                print(f"\n   {i}. {product.name}")
                print(f"      Category: {product.category}")
                print(f"      Price: ${product.price:.2f}")
                print(f"      Score: {score:.4f}")
    
    finally:
        db.close()


def example_compare_methods():
    """Example 2: Compare different recommendation methods"""
    print("\n\n" + "=" * 80)
    print("EXAMPLE 2: Comparing Recommendation Methods")
    print("=" * 80)
    
    db = next(get_db())
    
    try:
        cf_engine = CollaborativeFiltering(db)
        cf_engine.fit()
        
        user_id = 1
        n = 3  # Top 3 recommendations
        
        # User-based recommendations
        print("\n🔵 User-Based Collaborative Filtering:")
        user_based = cf_engine.get_recommendations(user_id, n, method='user_based')
        for i, (pid, score) in enumerate(user_based, 1):
            product = db.query(Product).filter(Product.id == pid).first()
            print(f"   {i}. {product.name if product else 'Unknown'} (score: {score:.4f})")
        
        # Item-based recommendations
        print("\n🟢 Item-Based Collaborative Filtering:")
        item_based = cf_engine.get_recommendations(user_id, n, method='item_based')
        for i, (pid, score) in enumerate(item_based, 1):
            product = db.query(Product).filter(Product.id == pid).first()
            print(f"   {i}. {product.name if product else 'Unknown'} (score: {score:.4f})")
        
        # Hybrid recommendations
        print("\n🟣 Hybrid Approach (60% User + 40% Item):")
        hybrid = cf_engine.get_recommendations(user_id, n, method='hybrid')
        for i, (pid, score) in enumerate(hybrid, 1):
            product = db.query(Product).filter(Product.id == pid).first()
            print(f"   {i}. {product.name if product else 'Unknown'} (score: {score:.4f})")
    
    finally:
        db.close()


def example_cold_start():
    """Example 3: Cold-start user handling"""
    print("\n\n" + "=" * 80)
    print("EXAMPLE 3: Cold-Start User Handling")
    print("=" * 80)
    
    db = next(get_db())
    
    try:
        # Create a new user with no interactions
        new_user = User(username="cold_start_demo", email="coldstart@example.com")
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print(f"\n1. Created new user: {new_user.username} (ID: {new_user.id})")
        print("   This user has NO interaction history")
        
        # Get recommendations
        cf_engine = CollaborativeFiltering(db)
        cf_engine.fit()
        
        print("\n2. Getting recommendations (will fallback to popular products)...")
        recommendations = cf_engine.get_recommendations(new_user.id, n_recommendations=5)
        
        print(f"\n3. Popular Products Recommended:")
        for i, (product_id, popularity_score) in enumerate(recommendations, 1):
            product = db.query(Product).filter(Product.id == product_id).first()
            if product:
                print(f"\n   {i}. {product.name}")
                print(f"      Category: {product.category}")
                print(f"      Popularity: {popularity_score:.2f}")
        
        # Clean up
        db.delete(new_user)
        db.commit()
        print("\n✓ Demo user cleaned up")
    
    finally:
        db.close()


def example_similarity_analysis():
    """Example 4: Analyze user and item similarities"""
    print("\n\n" + "=" * 80)
    print("EXAMPLE 4: Similarity Analysis")
    print("=" * 80)
    
    db = next(get_db())
    
    try:
        cf_engine = CollaborativeFiltering(db)
        cf_engine.fit()
        
        # Analyze user similarity
        users = db.query(User).limit(2).all()
        if len(users) >= 2:
            user1 = users[0]
            user1_idx = cf_engine.user_id_to_idx.get(user1.id)
            
            if user1_idx is not None:
                print(f"\n👥 Top 5 Most Similar Users to '{user1.username}':")
                similarities = cf_engine.user_similarity_matrix[user1_idx]
                
                # Get sorted indices (excluding self)
                similar_indices = sorted(
                    enumerate(similarities), 
                    key=lambda x: x[1], 
                    reverse=True
                )[1:6]  # Skip self, get top 5
                
                for rank, (idx, similarity) in enumerate(similar_indices, 1):
                    similar_user_id = cf_engine.idx_to_user_id[idx]
                    similar_user = db.query(User).filter(User.id == similar_user_id).first()
                    if similar_user:
                        print(f"   {rank}. {similar_user.username} - Similarity: {similarity:.4f}")
        
        # Analyze product similarity
        products = db.query(Product).limit(2).all()
        if products:
            product1 = products[0]
            product1_idx = cf_engine.product_id_to_idx.get(product1.id)
            
            if product1_idx is not None:
                print(f"\n🔗 Top 5 Most Similar Products to '{product1.name}':")
                similarities = cf_engine.item_similarity_matrix[product1_idx]
                
                # Get sorted indices (excluding self)
                similar_indices = sorted(
                    enumerate(similarities),
                    key=lambda x: x[1],
                    reverse=True
                )[1:6]  # Skip self, get top 5
                
                for rank, (idx, similarity) in enumerate(similar_indices, 1):
                    similar_product_id = cf_engine.idx_to_product_id[idx]
                    similar_product = db.query(Product).filter(Product.id == similar_product_id).first()
                    if similar_product:
                        print(f"   {rank}. {similar_product.name} - Similarity: {similarity:.4f}")
    
    finally:
        db.close()


def example_api_integration():
    """Example 5: How to integrate in API routes"""
    print("\n\n" + "=" * 80)
    print("EXAMPLE 5: API Integration Pattern")
    print("=" * 80)
    
    code_example = """
# In your FastAPI route:

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.recommender.collaborative_filtering import CollaborativeFiltering

@app.get("/api/recommendations/{user_id}")
async def get_recommendations(user_id: int, db: Session = Depends(get_db)):
    # Initialize CF engine
    cf_engine = CollaborativeFiltering(db)
    cf_engine.fit()
    
    # Get recommendations
    recommendations = cf_engine.get_recommendations(
        user_id=user_id,
        n_recommendations=10,
        method='hybrid'
    )
    
    # Fetch product details
    product_ids = [pid for pid, score in recommendations]
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    
    # Format response
    return {
        "user_id": user_id,
        "recommendations": [
            {
                "product_id": p.id,
                "name": p.name,
                "score": next(s for pid, s in recommendations if pid == p.id)
            }
            for p in products
        ]
    }
"""
    
    print(code_example)


if __name__ == "__main__":
    print("\n" + "=" * 80)
    print("  COLLABORATIVE FILTERING - USAGE EXAMPLES")
    print("=" * 80)
    
    # Run examples
    example_basic_usage()
    example_compare_methods()
    example_cold_start()
    example_similarity_analysis()
    example_api_integration()
    
    print("\n\n" + "=" * 80)
    print("  ALL EXAMPLES COMPLETED")
    print("=" * 80)
    print("\n✅ Collaborative filtering system is ready to use!")
    print("\nFor more information:")
    print("  - See COLLABORATIVE_FILTERING_GUIDE.md for detailed documentation")
    print("  - See PHASE3_STEP1_SUMMARY.md for implementation summary")
    print("  - Run test_collaborative_filtering.py for comprehensive tests")
    print("\n")

