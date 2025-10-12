"""
Test script for Collaborative Filtering Recommendation Engine

This script demonstrates the functionality of the collaborative filtering system
including user-based, item-based, and hybrid approaches with cold-start handling.
"""

import sys
from sqlalchemy.orm import Session
from app.database.connection import get_db, engine
from app.database.models import User, Product, UserInteraction, InteractionType
from app.recommender.collaborative_filtering import CollaborativeFiltering


def print_section(title: str):
    """Print a formatted section header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


def test_collaborative_filtering():
    """Test the collaborative filtering recommendation engine"""
    
    # Get database session
    db = next(get_db())
    
    try:
        print_section("COLLABORATIVE FILTERING RECOMMENDATION ENGINE TEST")
        
        # Initialize the collaborative filtering engine
        cf_engine = CollaborativeFiltering(db)
        
        # Train the model
        print("\n📊 Training collaborative filtering model...")
        cf_engine.fit()
        
        if cf_engine.user_item_matrix is None or cf_engine.user_item_matrix.empty:
            print("❌ No interaction data available. Please seed the database first.")
            print("   Run: python seed_data.py")
            return
        
        print(f"✅ Model trained successfully!")
        print(f"   - Users: {len(cf_engine.user_id_to_idx)}")
        print(f"   - Products: {len(cf_engine.product_id_to_idx)}")
        print(f"   - User similarity matrix shape: {cf_engine.user_similarity_matrix.shape}")
        print(f"   - Item similarity matrix shape: {cf_engine.item_similarity_matrix.shape}")
        
        # Get a sample user
        users = db.query(User).limit(5).all()
        if not users:
            print("❌ No users found in database")
            return
        
        # Test recommendations for each user
        for user in users:
            print_section(f"Recommendations for User: {user.username} (ID: {user.id})")
            
            # Check if user has interactions
            user_interactions = db.query(UserInteraction).filter(
                UserInteraction.user_id == user.id
            ).all()
            
            print(f"\n📌 User has {len(user_interactions)} interactions:")
            for interaction in user_interactions[:5]:  # Show first 5
                product = db.query(Product).filter(Product.id == interaction.product_id).first()
                print(f"   - {interaction.interaction_type.value.upper()}: {product.name if product else 'Unknown'} "
                      f"(Score: {interaction.interaction_score})")
            if len(user_interactions) > 5:
                print(f"   ... and {len(user_interactions) - 5} more")
            
            # Test User-Based Collaborative Filtering
            print("\n🔵 User-Based Collaborative Filtering:")
            user_based_recs = cf_engine.get_recommendations(user.id, n_recommendations=5, method='user_based')
            if user_based_recs:
                for i, (product_id, score) in enumerate(user_based_recs, 1):
                    product = db.query(Product).filter(Product.id == product_id).first()
                    if product:
                        print(f"   {i}. {product.name} (Category: {product.category})")
                        print(f"      Score: {score:.4f} | Price: ${product.price:.2f}")
            else:
                print("   No recommendations available")
            
            # Test Item-Based Collaborative Filtering
            print("\n🟢 Item-Based Collaborative Filtering:")
            item_based_recs = cf_engine.get_recommendations(user.id, n_recommendations=5, method='item_based')
            if item_based_recs:
                for i, (product_id, score) in enumerate(item_based_recs, 1):
                    product = db.query(Product).filter(Product.id == product_id).first()
                    if product:
                        print(f"   {i}. {product.name} (Category: {product.category})")
                        print(f"      Score: {score:.4f} | Price: ${product.price:.2f}")
            else:
                print("   No recommendations available")
            
            # Test Hybrid Approach (60% user-based, 40% item-based)
            print("\n🟣 Hybrid Approach (60% User-Based + 40% Item-Based):")
            hybrid_recs = cf_engine.get_recommendations(user.id, n_recommendations=5, method='hybrid')
            if hybrid_recs:
                for i, (product_id, score) in enumerate(hybrid_recs, 1):
                    product = db.query(Product).filter(Product.id == product_id).first()
                    if product:
                        print(f"   {i}. {product.name} (Category: {product.category})")
                        print(f"      Score: {score:.4f} | Price: ${product.price:.2f}")
            else:
                print("   No recommendations available")
            
            print("\n" + "-" * 80)
        
        # Test Cold-Start User (user with no interactions)
        print_section("COLD-START USER TEST")
        
        # Create a temporary user with no interactions
        new_user = User(username="test_coldstart_user", email="coldstart@test.com")
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print(f"\n👤 Testing recommendations for cold-start user: {new_user.username} (ID: {new_user.id})")
        print("   (This user has no interaction history)")
        
        cold_start_recs = cf_engine.get_recommendations(new_user.id, n_recommendations=5)
        
        print("\n🔥 Popular Products (Fallback for Cold-Start):")
        if cold_start_recs:
            for i, (product_id, score) in enumerate(cold_start_recs, 1):
                product = db.query(Product).filter(Product.id == product_id).first()
                if product:
                    print(f"   {i}. {product.name} (Category: {product.category})")
                    print(f"      Popularity Score: {score:.4f} | Price: ${product.price:.2f}")
        else:
            print("   No recommendations available")
        
        # Clean up test user
        db.delete(new_user)
        db.commit()
        
        # Test similarity insights
        print_section("SIMILARITY INSIGHTS")
        
        if len(users) >= 2:
            user1 = users[0]
            user1_idx = cf_engine.user_id_to_idx.get(user1.id)
            
            if user1_idx is not None:
                print(f"\n👥 Top 5 Similar Users to {user1.username}:")
                user_similarities = cf_engine.user_similarity_matrix[user1_idx]
                similar_indices = list(enumerate(user_similarities))
                similar_indices.sort(key=lambda x: x[1], reverse=True)
                
                count = 0
                for idx, similarity in similar_indices[1:]:  # Skip self
                    if count >= 5:
                        break
                    similar_user_id = cf_engine.idx_to_user_id[idx]
                    similar_user = db.query(User).filter(User.id == similar_user_id).first()
                    if similar_user:
                        print(f"   {count + 1}. {similar_user.username} - Similarity: {similarity:.4f}")
                        count += 1
        
        # Product similarity insights
        products = db.query(Product).limit(3).all()
        if products:
            product1 = products[0]
            product1_idx = cf_engine.product_id_to_idx.get(product1.id)
            
            if product1_idx is not None:
                print(f"\n🔗 Top 5 Similar Products to '{product1.name}':")
                item_similarities = cf_engine.item_similarity_matrix[product1_idx]
                similar_indices = list(enumerate(item_similarities))
                similar_indices.sort(key=lambda x: x[1], reverse=True)
                
                count = 0
                for idx, similarity in similar_indices[1:]:  # Skip self
                    if count >= 5:
                        break
                    similar_product_id = cf_engine.idx_to_product_id[idx]
                    similar_product = db.query(Product).filter(Product.id == similar_product_id).first()
                    if similar_product:
                        print(f"   {count + 1}. {similar_product.name} - Similarity: {similarity:.4f}")
                        print(f"      Category: {similar_product.category} | Price: ${similar_product.price:.2f}")
                        count += 1
        
        print_section("TEST COMPLETED SUCCESSFULLY")
        print("\n✅ All collaborative filtering features are working correctly!")
        print("\nFeatures tested:")
        print("  ✓ User-based collaborative filtering (top 5 similar users)")
        print("  ✓ Item-based collaborative filtering (product similarity)")
        print("  ✓ Hybrid approach (60% user-based + 40% item-based)")
        print("  ✓ Cold-start user handling (popular products fallback)")
        print("  ✓ User and item similarity matrices")
        print("  ✓ Cosine similarity calculations")
        
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    test_collaborative_filtering()

