"""
Quick test script for Windows users to test the API
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_api():
    print("=" * 80)
    print("QUICK API TEST")
    print("=" * 80)
    
    # 1. Train models
    print("\n1. Training models...")
    try:
        response = requests.post(f"{BASE_URL}/api/recommendations/train")
        if response.status_code == 200:
            result = response.json()
            print(f"   ✓ Training completed in {result['training_time_seconds']}s")
            print(f"   - Total users: {result['statistics']['total_users']}")
            print(f"   - Total products: {result['statistics']['total_products']}")
            print(f"   - Total interactions: {result['statistics']['total_interactions']}")
        else:
            print(f"   ✗ Error: {response.status_code}")
            print(f"   {response.text}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
        print("   Make sure the server is running: uvicorn app.main:app --reload")
        return
    
    # 2. Get recommendations for user 1
    print("\n2. Getting recommendations for user 1...")
    try:
        response = requests.get(
            f"{BASE_URL}/api/recommendations/user/1",
            params={"limit": 5}
        )
        if response.status_code == 200:
            result = response.json()
            print(f"   ✓ Got {result['total']} recommendations")
            print("\n   Top recommendations:")
            for idx, rec in enumerate(result['recommendations'][:3], 1):
                details = rec['product_details']
                score = rec['recommendation_score']
                print(f"\n   {idx}. {details['name']}")
                print(f"      Category: {details['category']}, Price: ${details['price']}")
                print(f"      Score: {score:.4f}")
        else:
            print(f"   ✗ Error: {response.status_code}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # 3. Get similar products
    print("\n3. Getting similar products to product 1...")
    try:
        response = requests.get(
            f"{BASE_URL}/api/recommendations/product/1/similar",
            params={"limit": 3}
        )
        if response.status_code == 200:
            result = response.json()
            print(f"   ✓ Found {result['total']} similar products")
            if result['total'] > 0:
                for idx, rec in enumerate(result['similar_products'][:3], 1):
                    details = rec['product_details']
                    score = rec['recommendation_score']
                    print(f"   {idx}. {details['name']} - Similarity: {score:.4f}")
        else:
            print(f"   ✗ Error: {response.status_code}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # 4. Get user preferences
    print("\n4. Getting user 1 preferences...")
    try:
        response = requests.get(f"{BASE_URL}/api/recommendations/user/1/preferences")
        if response.status_code == 200:
            result = response.json()
            print(f"   ✓ User: {result['username']}")
            print(f"   - Total interactions: {result['total_interactions']}")
            print(f"   - Purchased products: {result['purchased_count']}")
            print(f"   - Preferred categories: {list(result['preferred_categories'].keys())}")
        else:
            print(f"   ✗ Error: {response.status_code}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # 5. Get metrics
    print("\n5. Getting performance metrics...")
    try:
        response = requests.get(f"{BASE_URL}/api/recommendations/metrics")
        if response.status_code == 200:
            result = response.json()
            metrics = result['metrics']
            print(f"   ✓ Total requests: {metrics['total_requests']}")
            print(f"   - Avg response time: {metrics['avg_response_time_seconds']}s")
        else:
            print(f"   ✗ Error: {response.status_code}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    print("\n" + "=" * 80)
    print("✓ QUICK TEST COMPLETED")
    print("=" * 80)
    print("\nFor more comprehensive testing, run:")
    print("  python test_recommendation_service.py")
    print("\nTo view API docs, visit:")
    print("  http://localhost:8000/docs")

if __name__ == "__main__":
    test_api()


