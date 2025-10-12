"""
Test API endpoints
Run this after starting the server with: uvicorn app.main:app --reload
"""

import requests
import json

BASE_URL = "http://localhost:8000"


def print_response(title, response):
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"📍 {title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print(f"Response:\n{json.dumps(response.json(), indent=2)}")
    else:
        print(f"Error: {response.text}")


def test_api():
    """Test all API endpoints"""
    
    print("\n🚀 TESTING PRODUCT RECOMMENDER API")
    print("="*60)
    
    # 1. Health Check
    response = requests.get(f"{BASE_URL}/health")
    print_response("Health Check", response)
    
    # 2. Get all products (first 5)
    response = requests.get(f"{BASE_URL}/products?limit=5")
    print_response("GET /products (first 5)", response)
    
    # 3. Get product by ID
    response = requests.get(f"{BASE_URL}/products/1")
    print_response("GET /products/1", response)
    
    # 4. Get products by category
    response = requests.get(f"{BASE_URL}/products/category/Electronics?limit=3")
    print_response("GET /products/category/Electronics", response)
    
    # 5. Get all categories
    response = requests.get(f"{BASE_URL}/products/categories/list")
    print_response("GET /products/categories/list", response)
    
    # 6. Get user details
    response = requests.get(f"{BASE_URL}/users/1")
    print_response("GET /users/1", response)
    
    # 7. Get user interactions
    response = requests.get(f"{BASE_URL}/users/1/interactions?limit=5")
    print_response("GET /users/1/interactions", response)
    
    # 8. Get user preferences
    response = requests.get(f"{BASE_URL}/users/1/preferences")
    print_response("GET /users/1/preferences", response)
    
    # 9. Create new interaction
    response = requests.post(
        f"{BASE_URL}/interactions",
        params={
            "user_id": 1,
            "product_id": 5,
            "interaction_type": "view"
        }
    )
    print_response("POST /interactions (new view)", response)
    
    # 10. Get user's interactions
    response = requests.get(f"{BASE_URL}/interactions/user/1?limit=3")
    print_response("GET /interactions/user/1", response)
    
    # 11. Get product interactions
    response = requests.get(f"{BASE_URL}/interactions/product/1?limit=5")
    print_response("GET /interactions/product/1", response)
    
    # 12. Get personalized recommendations (hybrid)
    response = requests.get(f"{BASE_URL}/recommendations/1?limit=3&algorithm=hybrid")
    print_response("GET /recommendations/1 (hybrid)", response)
    
    # 13. Get collaborative filtering recommendations
    response = requests.get(f"{BASE_URL}/recommendations/1?limit=3&algorithm=collaborative")
    print_response("GET /recommendations/1 (collaborative)", response)
    
    # 14. Get content-based recommendations
    response = requests.get(f"{BASE_URL}/recommendations/1?limit=3&algorithm=content_based")
    print_response("GET /recommendations/1 (content_based)", response)
    
    # 15. Get similar products
    response = requests.get(f"{BASE_URL}/recommendations/product/1/similar?limit=3")
    print_response("GET /recommendations/product/1/similar", response)
    
    print("\n✅ API TESTING COMPLETE!")
    print("="*60)
    print("\n📖 View interactive docs at: http://localhost:8000/docs")
    print("="*60 + "\n")


if __name__ == "__main__":
    try:
        test_api()
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to API server")
        print("   Make sure the server is running with: uvicorn app.main:app --reload")
    except Exception as e:
        print(f"\n❌ Error: {e}")

