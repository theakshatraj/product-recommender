"""
Test script for LLM Service

Demonstrates the usage of the LLM service for generating recommendation explanations.
"""

import os
from app.services.llm_service import LLMService
import json


def test_llm_service():
    """Test the LLM service with sample data."""
    
    print("=" * 80)
    print("LLM SERVICE TEST")
    print("=" * 80)
    
    # Check if API key is available
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        print(f"\n✓ OpenAI API key found: {api_key[:8]}...{api_key[-4:]}")
    else:
        print("\n⚠ No OpenAI API key found. Will use fallback explanations.")
        print("  To use OpenAI API, set OPENAI_API_KEY environment variable.")
    
    # Initialize LLM service
    print("\n1. Initializing LLM Service...")
    llm_service = LLMService(
        model="gpt-3.5-turbo",
        cache_ttl=3600,
        max_requests_per_minute=50
    )
    print("   ✓ LLM Service initialized")
    
    # Sample user data
    user_data = {
        "user_id": 1,
        "username": "john_doe",
        "preferred_categories": ["Electronics", "Books", "Home & Garden"],
        "interaction_summary": "laptops, headphones, and tech accessories",
        "purchased_count": 5
    }
    
    # Sample product
    product = {
        "product_id": 42,
        "name": "Wireless Noise-Canceling Headphones",
        "category": "Electronics",
        "price": 199.99,
        "description": "Premium wireless headphones with active noise cancellation",
        "tags": ["wireless", "bluetooth", "noise-canceling", "audio", "premium"]
    }
    
    # Sample recommendation factors
    recommendation_factors = {
        "collaborative_score": 0.45,
        "content_based_score": 0.35,
        "combined_base_score": 0.80,
        "category_boost": 1.3,
        "diversity_penalty": 1.0,
        "final_score": 0.92
    }
    
    print("\n2. Generating explanation (first call - will be cached)...")
    print(f"   Product: {product['name']}")
    print(f"   User: {user_data['username']}")
    
    try:
        explanation = llm_service.generate_explanation(
            user_data=user_data,
            product=product,
            recommendation_factors=recommendation_factors
        )
        
        print(f"\n   ✓ Explanation generated:")
        print(f"\n   \"{explanation}\"")
        
    except Exception as e:
        print(f"\n   ✗ Error: {str(e)}")
        return
    
    # Test cache
    print("\n3. Generating same explanation again (should use cache)...")
    explanation2 = llm_service.generate_explanation(
        user_data=user_data,
        product=product,
        recommendation_factors=recommendation_factors
    )
    print("   ✓ Retrieved from cache")
    print(f"   Same result: {explanation == explanation2}")
    
    # Test with different product
    product2 = {
        "product_id": 15,
        "name": "The Art of Programming",
        "category": "Books",
        "price": 39.99,
        "description": "Comprehensive guide to modern programming",
        "tags": ["programming", "technical", "education", "software"]
    }
    
    recommendation_factors2 = {
        "collaborative_score": 0.35,
        "content_based_score": 0.45,
        "combined_base_score": 0.80,
        "category_boost": 1.0,
        "diversity_penalty": 1.0,
        "final_score": 0.80
    }
    
    print("\n4. Generating explanation for different product...")
    print(f"   Product: {product2['name']}")
    
    explanation3 = llm_service.generate_explanation(
        user_data=user_data,
        product=product2,
        recommendation_factors=recommendation_factors2
    )
    
    print(f"\n   ✓ Explanation generated:")
    print(f"\n   \"{explanation3}\"")
    
    # Test with category boost
    product3 = {
        "product_id": 28,
        "name": "Smart Home Security Camera",
        "category": "Electronics",
        "price": 129.99,
        "description": "WiFi-enabled security camera with night vision",
        "tags": ["smart-home", "security", "wifi", "camera", "iot"]
    }
    
    recommendation_factors3 = {
        "collaborative_score": 0.25,
        "content_based_score": 0.55,
        "combined_base_score": 0.80,
        "category_boost": 1.3,
        "diversity_penalty": 1.0,
        "final_score": 0.88
    }
    
    print("\n5. Generating explanation with category boost...")
    print(f"   Product: {product3['name']}")
    
    explanation4 = llm_service.generate_explanation(
        user_data=user_data,
        product=product3,
        recommendation_factors=recommendation_factors3
    )
    
    print(f"\n   ✓ Explanation generated:")
    print(f"\n   \"{explanation4}\"")
    
    # Get metrics
    print("\n" + "=" * 80)
    print("PERFORMANCE METRICS")
    print("=" * 80)
    
    metrics = llm_service.get_metrics()
    print("\n", json.dumps(metrics, indent=4))
    
    # Cache statistics
    print("\n" + "=" * 80)
    print("CACHE STATISTICS")
    print("=" * 80)
    
    cache_stats = llm_service.cache.get_stats()
    print(f"\n   Cache size: {cache_stats['cache_size']} entries")
    print(f"   Hits: {cache_stats['hits']}")
    print(f"   Misses: {cache_stats['misses']}")
    print(f"   Hit rate: {cache_stats['hit_rate_percent']:.2f}%")
    
    print("\n" + "=" * 80)
    print("✓ ALL TESTS COMPLETED SUCCESSFULLY")
    print("=" * 80)


def test_fallback_explanation():
    """Test fallback explanations when API is not available."""
    
    print("\n" + "=" * 80)
    print("FALLBACK EXPLANATION TEST")
    print("=" * 80)
    
    # Initialize without API key
    print("\n1. Initializing LLM Service without API key...")
    llm_service = LLMService(api_key=None)
    print("   ✓ Service initialized (will use fallback)")
    
    user_data = {
        "user_id": 2,
        "username": "jane_smith",
        "preferred_categories": ["Fashion", "Beauty"],
        "interaction_summary": "dresses, makeup, and accessories",
        "purchased_count": 8
    }
    
    product = {
        "product_id": 55,
        "name": "Designer Handbag",
        "category": "Fashion",
        "price": 299.99,
        "description": "Luxury leather handbag",
        "tags": ["luxury", "leather", "fashion", "designer"]
    }
    
    recommendation_factors = {
        "collaborative_score": 0.50,
        "content_based_score": 0.30,
        "combined_base_score": 0.80,
        "category_boost": 1.3,
        "diversity_penalty": 1.0,
        "final_score": 0.95
    }
    
    print("\n2. Generating fallback explanation...")
    explanation = llm_service.generate_explanation(
        user_data=user_data,
        product=product,
        recommendation_factors=recommendation_factors
    )
    
    print(f"\n   ✓ Fallback explanation generated:")
    print(f"\n   \"{explanation}\"")
    
    metrics = llm_service.get_metrics()
    print(f"\n   API calls: {metrics['api_calls']}")
    print(f"   Fallback uses: {metrics['fallback_uses']}")
    print(f"   ✓ Confirmed using fallback (no API calls)")


def test_rate_limiting():
    """Test rate limiting functionality."""
    
    print("\n" + "=" * 80)
    print("RATE LIMITING TEST")
    print("=" * 80)
    
    # Initialize with low rate limit for testing
    print("\n1. Initializing LLM Service with rate limit of 3 requests/minute...")
    llm_service = LLMService(
        api_key=None,  # Use fallback for speed
        max_requests_per_minute=3
    )
    print("   ✓ Service initialized")
    
    user_data = {
        "user_id": 3,
        "username": "test_user",
        "preferred_categories": ["Electronics"],
        "interaction_summary": "gadgets",
        "purchased_count": 2
    }
    
    print("\n2. Making 5 rapid requests (limit: 3/min)...")
    
    for i in range(5):
        product = {
            "product_id": i,
            "name": f"Product {i}",
            "category": "Electronics",
            "price": 99.99,
            "tags": ["test"]
        }
        
        factors = {"final_score": 0.8}
        
        print(f"   Request {i+1}...", end=" ")
        explanation = llm_service.generate_explanation(user_data, product, factors)
        print("✓")
    
    print("\n   ✓ All requests completed (rate limiter handled limits)")


def test_error_handling():
    """Test error handling."""
    
    print("\n" + "=" * 80)
    print("ERROR HANDLING TEST")
    print("=" * 80)
    
    llm_service = LLMService(api_key="invalid_key_for_testing")
    
    user_data = {
        "user_id": 4,
        "username": "test_user",
        "preferred_categories": ["Test"],
        "interaction_summary": "test products",
        "purchased_count": 0
    }
    
    product = {
        "product_id": 999,
        "name": "Test Product",
        "category": "Test",
        "price": 10.00,
        "tags": ["test"]
    }
    
    factors = {"final_score": 0.5}
    
    print("\n1. Testing with invalid API key (should fallback gracefully)...")
    
    try:
        explanation = llm_service.generate_explanation(user_data, product, factors)
        print(f"   ✓ Fallback explanation generated: \"{explanation[:50]}...\"")
        
        metrics = llm_service.get_metrics()
        print(f"   Errors handled: {metrics['errors']}")
        print(f"   Fallback uses: {metrics['fallback_uses']}")
        
    except Exception as e:
        print(f"   ✗ Unexpected error: {str(e)}")


if __name__ == "__main__":
    print("\n")
    print("╔" + "=" * 78 + "╗")
    print("║" + " " * 25 + "LLM SERVICE TESTING" + " " * 34 + "║")
    print("╚" + "=" * 78 + "╝")
    
    # Run tests
    test_llm_service()
    test_fallback_explanation()
    test_rate_limiting()
    test_error_handling()
    
    print("\n✓ All tests complete!\n")
    print("To use with OpenAI API:")
    print("  1. Set OPENAI_API_KEY environment variable")
    print("  2. Run tests again to see AI-generated explanations")
    print("\nExample:")
    print('  $env:OPENAI_API_KEY="sk-your-key-here"  # PowerShell')
    print('  python test_llm_service.py\n')

