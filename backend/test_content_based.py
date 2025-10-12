"""
Test script for Content-Based Recommendation Engine
"""

from app.database.connection import SessionLocal
from app.recommender.content_based import ContentBasedRecommender


def test_content_based_recommender():
    """Test the content-based recommendation engine"""
    
    # Create database session
    db = SessionLocal()
    
    try:
        print("=" * 60)
        print("Content-Based Recommendation Engine - Test")
        print("=" * 60)
        
        # Initialize recommender
        print("\n1. Initializing Content-Based Recommender...")
        recommender = ContentBasedRecommender(db)
        
        # Train the model
        print("2. Training the model (building feature matrix)...")
        recommender.fit()
        
        if recommender.feature_matrix is None or recommender.feature_matrix.size == 0:
            print("❌ No products found in database. Please run seed_data.py first.")
            return
        
        print(f"   ✓ Feature matrix shape: {recommender.feature_matrix.shape}")
        print(f"   ✓ Number of products: {len(recommender.product_ids)}")
        print(f"   ✓ Similarity matrix shape: {recommender.similarity_matrix.shape}")
        
        # Test 1: Get similar products
        print("\n3. Testing product similarity...")
        product_id = recommender.product_ids[0] if recommender.product_ids else None
        
        if product_id:
            print(f"   Finding products similar to product ID {product_id}...")
            similar_products = recommender.get_similar_products(product_id, n_recommendations=5)
            
            if similar_products:
                print(f"   ✓ Found {len(similar_products)} similar products:")
                for i, (pid, score) in enumerate(similar_products, 1):
                    print(f"      {i}. Product ID {pid} - Similarity: {score:.4f}")
            else:
                print("   ⚠ No similar products found")
        
        # Test 2: Get recommendations for a user
        print("\n4. Testing user-based recommendations...")
        test_user_id = 1  # Assuming user with ID 1 exists
        
        print(f"   Getting recommendations for user ID {test_user_id}...")
        user_recommendations = recommender.get_recommendations(test_user_id, n_recommendations=10)
        
        if user_recommendations:
            print(f"   ✓ Found {len(user_recommendations)} recommendations:")
            for i, (pid, score) in enumerate(user_recommendations[:5], 1):
                print(f"      {i}. Product ID {pid} - Score: {score:.4f}")
        else:
            print("   ⚠ No recommendations found for this user")
        
        # Test 3: Get product feature summary
        print("\n5. Testing feature extraction...")
        if product_id:
            features = recommender.get_product_features_summary(product_id)
            if features:
                print(f"   ✓ Product features for ID {product_id}:")
                print(f"      Name: {features['name']}")
                print(f"      Category: {features['category']}")
                print(f"      Price: ${features['price']:.2f}")
                print(f"      Tags: {features['tags']}")
                print(f"      Feature Vector Shape: {features['feature_vector_shape']}")
        
        print("\n" + "=" * 60)
        print("✓ Content-Based Recommender Test Complete!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        db.close()


if __name__ == "__main__":
    test_content_based_recommender()


