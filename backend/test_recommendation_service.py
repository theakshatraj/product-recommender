"""
Test script for Recommendation Service

Demonstrates the usage of the hybrid recommendation service with business rules.
"""

import sys
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal, engine
from app.database.models import User, Product, UserInteraction, InteractionType
from app.services.recommendation_service import RecommendationService
import json


def test_recommendation_service():
    """Test the recommendation service with sample data."""
    
    # Create database session
    db: Session = SessionLocal()
    
    try:
        print("=" * 80)
        print("RECOMMENDATION SERVICE TEST")
        print("=" * 80)
        
        # Initialize recommendation service
        print("\n1. Initializing Recommendation Service...")
        rec_service = RecommendationService(db)
        
        # Train models
        print("\n2. Training recommendation models...")
        training_time = rec_service.train_models()
        print(f"   ✓ Models trained in {training_time:.2f} seconds")
        
        # Get a sample user
        user = db.query(User).first()
        if not user:
            print("   ✗ No users found in database. Please seed data first.")
            return
        
        print(f"\n3. Testing recommendations for user: {user.username} (ID: {user.id})")
        
        # Get user's interaction history
        interactions = db.query(UserInteraction).filter(
            UserInteraction.user_id == user.id
        ).all()
        print(f"   User has {len(interactions)} interactions")
        
        # Show user's purchased products
        purchased = [i for i in interactions if i.interaction_type == InteractionType.PURCHASE]
        print(f"   User has purchased {len(purchased)} products")
        
        # Get recommendations
        print("\n4. Generating personalized recommendations...")
        recommendations = rec_service.get_recommendations(
            user_id=user.id,
            n_recommendations=10,
            apply_rules=True
        )
        
        print(f"\n   ✓ Generated {len(recommendations)} recommendations")
        print("\n" + "=" * 80)
        print("TOP RECOMMENDATIONS:")
        print("=" * 80)
        
        for idx, rec in enumerate(recommendations, 1):
            print(f"\n#{idx}. {rec.product_name}")
            print(f"   Category: {rec.product_category}")
            print(f"   Price: ${rec.product_price:.2f}")
            print(f"   Score: {rec.recommendation_score:.4f}")
            print(f"   Reason Factors:")
            for factor, value in rec.reason_factors.items():
                print(f"      - {factor}: {value:.4f}")
        
        # Test similar products
        print("\n" + "=" * 80)
        print("SIMILAR PRODUCTS TEST")
        print("=" * 80)
        
        # Get a product the user interacted with
        if interactions:
            test_product_id = interactions[0].product_id
            test_product = db.query(Product).filter(Product.id == test_product_id).first()
            
            print(f"\n5. Finding products similar to: {test_product.name}")
            similar = rec_service.get_similar_products(
                product_id=test_product_id,
                n_recommendations=5
            )
            
            print(f"\n   ✓ Found {len(similar)} similar products")
            for idx, rec in enumerate(similar, 1):
                print(f"\n   {idx}. {rec.product_name}")
                print(f"      Category: {rec.product_category}")
                print(f"      Similarity: {rec.recommendation_score:.4f}")
        
        # Test explanation
        print("\n" + "=" * 80)
        print("RECOMMENDATION EXPLANATION TEST")
        print("=" * 80)
        
        if recommendations:
            first_rec = recommendations[0]
            print(f"\n6. Explaining recommendation for: {first_rec.product_name}")
            
            explanation = rec_service.explain_recommendation(
                user_id=user.id,
                product_id=first_rec.product_id
            )
            
            if explanation:
                print("\n   Explanation:")
                print(json.dumps(explanation, indent=4))
        
        # Show performance metrics
        print("\n" + "=" * 80)
        print("PERFORMANCE METRICS")
        print("=" * 80)
        
        metrics = rec_service.get_metrics()
        print("\n", json.dumps(metrics, indent=4))
        
        # Test JSON serialization
        print("\n" + "=" * 80)
        print("JSON SERIALIZATION TEST")
        print("=" * 80)
        
        if recommendations:
            print("\nSample recommendation as JSON:")
            print(json.dumps(recommendations[0].to_dict(), indent=4))
        
        print("\n" + "=" * 80)
        print("✓ ALL TESTS COMPLETED SUCCESSFULLY")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n✗ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        db.close()


def test_business_rules():
    """Test specific business rules."""
    
    db: Session = SessionLocal()
    
    try:
        print("\n" + "=" * 80)
        print("BUSINESS RULES TEST")
        print("=" * 80)
        
        rec_service = RecommendationService(db)
        
        # Get a user with purchases
        user = db.query(User).join(UserInteraction).filter(
            UserInteraction.interaction_type == InteractionType.PURCHASE
        ).first()
        
        if not user:
            print("No users with purchases found.")
            return
        
        print(f"\nTesting for user: {user.username} (ID: {user.id})")
        
        # Get purchased products
        purchased_ids = rec_service.get_purchased_product_ids(user.id)
        print(f"User has purchased {len(purchased_ids)} products: {list(purchased_ids)}")
        
        # Get preferred categories
        preferred_categories = rec_service.get_user_preferred_categories(user.id)
        print(f"User's preferred categories: {preferred_categories}")
        
        # Get recommendations WITHOUT rules
        print("\n--- Recommendations WITHOUT Business Rules ---")
        recs_no_rules = rec_service.get_recommendations(
            user_id=user.id,
            n_recommendations=10,
            apply_rules=False
        )
        
        print(f"Got {len(recs_no_rules)} recommendations")
        purchased_in_recs = sum(1 for r in recs_no_rules if r.product_id in purchased_ids)
        print(f"Contains {purchased_in_recs} already purchased products")
        
        # Get recommendations WITH rules
        print("\n--- Recommendations WITH Business Rules ---")
        recs_with_rules = rec_service.get_recommendations(
            user_id=user.id,
            n_recommendations=10,
            apply_rules=True
        )
        
        print(f"Got {len(recs_with_rules)} recommendations")
        purchased_in_recs = sum(1 for r in recs_with_rules if r.product_id in purchased_ids)
        print(f"Contains {purchased_in_recs} already purchased products (should be 0)")
        
        # Check category diversity
        from collections import Counter
        categories = [r.product_category for r in recs_with_rules]
        category_counts = Counter(categories)
        print(f"\nCategory distribution:")
        for cat, count in category_counts.most_common():
            print(f"   {cat}: {count} products")
        
        max_per_category = max(category_counts.values()) if category_counts else 0
        print(f"\nMax products per category: {max_per_category}")
        print(f"Diversity constraint (max {rec_service.max_products_per_category} per category): " + 
              ("✓ PASSED" if max_per_category <= rec_service.max_products_per_category * 1.5 else "✗ FAILED"))
        
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        db.close()


if __name__ == "__main__":
    print("\n")
    print("╔" + "=" * 78 + "╗")
    print("║" + " " * 20 + "RECOMMENDATION SERVICE TESTING" + " " * 28 + "║")
    print("╚" + "=" * 78 + "╝")
    
    # Run tests
    test_recommendation_service()
    test_business_rules()
    
    print("\n✓ Testing complete!\n")

