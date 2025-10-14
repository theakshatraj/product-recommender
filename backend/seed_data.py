"""
Seed database with sample data
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import SessionLocal
from app.database.models import Product, User, UserInteraction, InteractionType
from datetime import datetime, timedelta
import random


def seed_products(db):
    """Seed 50 sample products across 5 categories"""
    
    products_data = [
        # Electronics (10 products)
        {
            "name": "Wireless Noise-Cancelling Headphones",
            "description": "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and premium sound quality.",
            "category": "Electronics",
            "price": 249.99,
            "tags": ["bluetooth", "wireless", "audio", "noise-cancellation", "premium"]
        },
        {
            "name": "4K Smart TV 55-inch",
            "description": "Ultra HD Smart TV with HDR, built-in streaming apps, and voice control.",
            "category": "Electronics",
            "price": 599.99,
            "tags": ["tv", "4k", "smart", "hdr", "entertainment"]
        },
        {
            "name": "Laptop Ultrabook 13-inch",
            "description": "Lightweight laptop with 16GB RAM, 512GB SSD, and 10-hour battery life.",
            "category": "Electronics",
            "price": 1299.99,
            "tags": ["laptop", "computer", "ultrabook", "portable", "work"]
        },
        {
            "name": "Wireless Gaming Mouse",
            "description": "High-precision gaming mouse with customizable RGB lighting and programmable buttons.",
            "category": "Electronics",
            "price": 79.99,
            "tags": ["gaming", "mouse", "wireless", "rgb", "accessories"]
        },
        {
            "name": "Smartphone Flagship 128GB",
            "description": "Latest flagship smartphone with 5G, triple camera system, and AMOLED display.",
            "category": "Electronics",
            "price": 899.99,
            "tags": ["smartphone", "5g", "camera", "mobile", "flagship"]
        },
        {
            "name": "Wireless Earbuds Pro",
            "description": "True wireless earbuds with ANC, transparency mode, and wireless charging case.",
            "category": "Electronics",
            "price": 199.99,
            "tags": ["earbuds", "wireless", "anc", "bluetooth", "portable"]
        },
        {
            "name": "Smart Watch Fitness Tracker",
            "description": "Advanced fitness tracker with heart rate monitoring, GPS, sleep tracking, and 7-day battery.",
            "category": "Electronics",
            "price": 299.99,
            "tags": ["smartwatch", "fitness", "health", "gps", "wearable"]
        },
        {
            "name": "Portable Bluetooth Speaker",
            "description": "Waterproof portable speaker with 360° sound, 20-hour battery, and party mode.",
            "category": "Electronics",
            "price": 129.99,
            "tags": ["speaker", "bluetooth", "portable", "waterproof", "audio"]
        },
        {
            "name": "Tablet 10-inch WiFi",
            "description": "High-resolution tablet perfect for reading, browsing, and streaming content.",
            "category": "Electronics",
            "price": 349.99,
            "tags": ["tablet", "portable", "entertainment", "reading", "productivity"]
        },
        {
            "name": "USB-C Hub Multi-Port Adapter",
            "description": "7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and 100W power delivery.",
            "category": "Electronics",
            "price": 49.99,
            "tags": ["adapter", "usb-c", "hub", "accessories", "productivity"]
        },
        
        # Fashion (10 products)
        {
            "name": "Men's Classic Leather Jacket",
            "description": "Premium genuine leather jacket with quilted lining and modern fit.",
            "category": "Fashion",
            "price": 299.99,
            "tags": ["leather", "jacket", "men", "outerwear", "premium"]
        },
        {
            "name": "Women's Running Sneakers",
            "description": "Lightweight running shoes with responsive cushioning and breathable mesh upper.",
            "category": "Fashion",
            "price": 119.99,
            "tags": ["shoes", "sneakers", "women", "running", "athletic"]
        },
        {
            "name": "Unisex Backpack 30L",
            "description": "Water-resistant backpack with laptop compartment, USB charging port, and ergonomic design.",
            "category": "Fashion",
            "price": 79.99,
            "tags": ["backpack", "bag", "travel", "laptop", "unisex"]
        },
        {
            "name": "Women's Summer Dress",
            "description": "Floral print summer dress with adjustable straps and flowing silhouette.",
            "category": "Fashion",
            "price": 59.99,
            "tags": ["dress", "women", "summer", "casual", "floral"]
        },
        {
            "name": "Men's Slim Fit Jeans",
            "description": "Classic denim jeans with stretch fabric and modern slim fit.",
            "category": "Fashion",
            "price": 69.99,
            "tags": ["jeans", "denim", "men", "pants", "casual"]
        },
        {
            "name": "Polarized Sunglasses",
            "description": "UV400 protection sunglasses with polarized lenses and lightweight frame.",
            "category": "Fashion",
            "price": 89.99,
            "tags": ["sunglasses", "accessories", "uv-protection", "polarized", "eyewear"]
        },
        {
            "name": "Women's Yoga Leggings",
            "description": "High-waisted yoga pants with moisture-wicking fabric and phone pocket.",
            "category": "Fashion",
            "price": 44.99,
            "tags": ["leggings", "yoga", "women", "activewear", "fitness"]
        },
        {
            "name": "Men's Formal Dress Shirt",
            "description": "Non-iron dress shirt with classic fit and button-down collar.",
            "category": "Fashion",
            "price": 49.99,
            "tags": ["shirt", "formal", "men", "business", "dress"]
        },
        {
            "name": "Leather Wallet RFID Blocking",
            "description": "Genuine leather wallet with RFID protection and multiple card slots.",
            "category": "Fashion",
            "price": 39.99,
            "tags": ["wallet", "leather", "accessories", "rfid", "men"]
        },
        {
            "name": "Women's Crossbody Handbag",
            "description": "Elegant crossbody bag with adjustable strap and multiple compartments.",
            "category": "Fashion",
            "price": 99.99,
            "tags": ["handbag", "women", "bag", "crossbody", "accessories"]
        },
        
        # Home (10 products)
        {
            "name": "Coffee Maker Programmable",
            "description": "12-cup programmable coffee maker with thermal carafe and auto-brew function.",
            "category": "Home",
            "price": 89.99,
            "tags": ["coffee", "kitchen", "appliance", "programmable", "brewing"]
        },
        {
            "name": "Memory Foam Pillow Set",
            "description": "Set of 2 adjustable memory foam pillows with cooling gel and hypoallergenic cover.",
            "category": "Home",
            "price": 79.99,
            "tags": ["pillow", "bedding", "memory-foam", "sleep", "comfort"]
        },
        {
            "name": "Robot Vacuum Cleaner",
            "description": "Smart robot vacuum with app control, auto-recharge, and HEPA filter.",
            "category": "Home",
            "price": 299.99,
            "tags": ["vacuum", "robot", "cleaning", "smart", "appliance"]
        },
        {
            "name": "Non-Stick Cookware Set 10-Piece",
            "description": "Complete cookware set with non-stick coating, dishwasher safe, and oven safe.",
            "category": "Home",
            "price": 149.99,
            "tags": ["cookware", "kitchen", "pots", "pans", "cooking"]
        },
        {
            "name": "Air Fryer 5.8 Quart",
            "description": "Digital air fryer with 8 presets, non-stick basket, and recipe book included.",
            "category": "Home",
            "price": 119.99,
            "tags": ["air-fryer", "kitchen", "appliance", "healthy", "cooking"]
        },
        {
            "name": "Bamboo Bed Sheet Set Queen",
            "description": "Ultra-soft bamboo sheets with deep pockets, breathable, and eco-friendly.",
            "category": "Home",
            "price": 89.99,
            "tags": ["sheets", "bedding", "bamboo", "queen", "eco-friendly"]
        },
        {
            "name": "Essential Oil Diffuser",
            "description": "Ultrasonic aromatherapy diffuser with 7 LED colors and auto shut-off.",
            "category": "Home",
            "price": 34.99,
            "tags": ["diffuser", "aromatherapy", "essential-oils", "wellness", "decor"]
        },
        {
            "name": "Stainless Steel Knife Set",
            "description": "Professional 15-piece knife set with wooden block and sharpening steel.",
            "category": "Home",
            "price": 129.99,
            "tags": ["knives", "kitchen", "cutlery", "cooking", "professional"]
        },
        {
            "name": "Smart LED Light Bulbs 4-Pack",
            "description": "WiFi smart bulbs with color changing, dimming, and voice control compatibility.",
            "category": "Home",
            "price": 49.99,
            "tags": ["smart-home", "lighting", "led", "wifi", "voice-control"]
        },
        {
            "name": "Weighted Blanket 15 lbs",
            "description": "Premium weighted blanket for better sleep with breathable cotton cover.",
            "category": "Home",
            "price": 79.99,
            "tags": ["blanket", "weighted", "sleep", "comfort", "bedding"]
        },
        
        # Books (10 products)
        {
            "name": "The Art of Programming",
            "description": "Comprehensive guide to modern software development practices and design patterns.",
            "category": "Books",
            "price": 49.99,
            "tags": ["programming", "technology", "education", "software", "development"]
        },
        {
            "name": "Mindfulness for Beginners",
            "description": "Practical guide to meditation and mindfulness with daily exercises.",
            "category": "Books",
            "price": 16.99,
            "tags": ["mindfulness", "meditation", "self-help", "wellness", "mental-health"]
        },
        {
            "name": "The Science of Nutrition",
            "description": "Evidence-based nutrition guide with meal plans and healthy recipes.",
            "category": "Books",
            "price": 34.99,
            "tags": ["nutrition", "health", "diet", "wellness", "cooking"]
        },
        {
            "name": "Mystery Thriller: Dark Waters",
            "description": "Gripping mystery novel with unexpected twists and memorable characters.",
            "category": "Books",
            "price": 14.99,
            "tags": ["fiction", "mystery", "thriller", "novel", "entertainment"]
        },
        {
            "name": "Financial Freedom Blueprint",
            "description": "Step-by-step guide to building wealth and achieving financial independence.",
            "category": "Books",
            "price": 24.99,
            "tags": ["finance", "investing", "money", "self-help", "business"]
        },
        {
            "name": "Creative Photography Handbook",
            "description": "Master photography techniques with practical tips and inspiring examples.",
            "category": "Books",
            "price": 39.99,
            "tags": ["photography", "art", "creativity", "education", "hobby"]
        },
        {
            "name": "World History: A Modern Perspective",
            "description": "Comprehensive overview of world history from ancient civilizations to modern times.",
            "category": "Books",
            "price": 44.99,
            "tags": ["history", "education", "non-fiction", "world", "knowledge"]
        },
        {
            "name": "Quick & Easy Cookbook",
            "description": "200+ delicious recipes ready in 30 minutes or less with everyday ingredients.",
            "category": "Books",
            "price": 19.99,
            "tags": ["cookbook", "recipes", "cooking", "food", "easy"]
        },
        {
            "name": "Fantasy Epic: Dragon's Legacy",
            "description": "Epic fantasy adventure with dragons, magic, and unforgettable heroes.",
            "category": "Books",
            "price": 18.99,
            "tags": ["fantasy", "fiction", "adventure", "dragons", "novel"]
        },
        {
            "name": "The Leadership Handbook",
            "description": "Essential strategies for effective leadership in business and life.",
            "category": "Books",
            "price": 29.99,
            "tags": ["leadership", "business", "management", "self-help", "career"]
        },
        
        # Sports (10 products)
        {
            "name": "Yoga Mat Extra Thick",
            "description": "Non-slip yoga mat with extra cushioning, carrying strap, and eco-friendly material.",
            "category": "Sports",
            "price": 39.99,
            "tags": ["yoga", "fitness", "exercise", "mat", "wellness"]
        },
        {
            "name": "Adjustable Dumbbell Set",
            "description": "Space-saving adjustable dumbbells from 5-52.5 lbs with storage tray.",
            "category": "Sports",
            "price": 349.99,
            "tags": ["dumbbells", "weights", "strength", "fitness", "home-gym"]
        },
        {
            "name": "Resistance Bands Set",
            "description": "5-level resistance bands with handles, door anchor, and exercise guide.",
            "category": "Sports",
            "price": 29.99,
            "tags": ["resistance-bands", "fitness", "workout", "portable", "strength"]
        },
        {
            "name": "Camping Tent 4-Person",
            "description": "Waterproof family tent with easy setup, ventilation, and storage pockets.",
            "category": "Sports",
            "price": 159.99,
            "tags": ["camping", "tent", "outdoor", "hiking", "adventure"]
        },
        {
            "name": "Mountain Bike 27.5-inch",
            "description": "Durable mountain bike with 21-speed, disc brakes, and suspension fork.",
            "category": "Sports",
            "price": 499.99,
            "tags": ["bike", "cycling", "mountain", "outdoor", "sports"]
        },
        {
            "name": "Jump Rope Speed Rope",
            "description": "Lightweight speed jump rope with ball bearings and adjustable length.",
            "category": "Sports",
            "price": 14.99,
            "tags": ["jump-rope", "cardio", "fitness", "portable", "training"]
        },
        {
            "name": "Foam Roller for Muscle Recovery",
            "description": "High-density foam roller for muscle massage and post-workout recovery.",
            "category": "Sports",
            "price": 24.99,
            "tags": ["foam-roller", "recovery", "massage", "fitness", "therapy"]
        },
        {
            "name": "Swimming Goggles Anti-Fog",
            "description": "Professional swimming goggles with UV protection and leak-proof seal.",
            "category": "Sports",
            "price": 19.99,
            "tags": ["swimming", "goggles", "water-sports", "pool", "training"]
        },
        {
            "name": "Basketball Official Size",
            "description": "Premium composite leather basketball with superior grip and durability.",
            "category": "Sports",
            "price": 34.99,
            "tags": ["basketball", "ball", "sports", "outdoor", "team-sports"]
        },
        {
            "name": "Fitness Tracker Watch",
            "description": "Activity tracker with heart rate monitor, step counter, and sleep tracking.",
            "category": "Sports",
            "price": 59.99,
            "tags": ["fitness-tracker", "watch", "health", "activity", "monitoring"]
        },
    ]
    
    products = []
    for i, product_data in enumerate(products_data, 1):
        product = Product(
            name=product_data["name"],
            description=product_data["description"],
            category=product_data["category"],
            price=product_data["price"],
            image_url=f"https://picsum.photos/seed/product{i}/400/400",
            tags=product_data["tags"]
        )
        products.append(product)
    
    db.add_all(products)
    db.commit()
    print(f"✓ Added {len(products)} products across 5 categories")
    return products


def seed_users(db):
    """Seed 10 sample users with diverse profiles"""
    users_data = [
        {"username": "tech_enthusiast", "email": "techie@example.com"},
        {"username": "fashionista_sarah", "email": "sarah.fashion@example.com"},
        {"username": "home_chef_mike", "email": "mike.chef@example.com"},
        {"username": "bookworm_emily", "email": "emily.reads@example.com"},
        {"username": "fitness_guru", "email": "fitness.pro@example.com"},
        {"username": "outdoor_adventurer", "email": "adventure@example.com"},
        {"username": "smart_shopper", "email": "smart.buyer@example.com"},
        {"username": "lifestyle_blogger", "email": "lifestyle@example.com"},
        {"username": "gadget_lover", "email": "gadgets@example.com"},
        {"username": "wellness_coach", "email": "wellness@example.com"},
    ]
    
    users = []
    for user_data in users_data:
        user = User(
            username=user_data["username"],
            email=user_data["email"]
        )
        users.append(user)
    
    db.add_all(users)
    db.commit()
    print(f"✓ Added {len(users)} users")
    return users


def seed_interactions(db, users, products):
    """Seed 200 user interactions with realistic patterns"""
    
    # Define user preferences (which categories each user prefers)
    user_preferences = {
        0: ["Electronics"],  # tech_enthusiast
        1: ["Fashion"],  # fashionista_sarah
        2: ["Home", "Books"],  # home_chef_mike
        3: ["Books"],  # bookworm_emily
        4: ["Sports", "Fashion"],  # fitness_guru
        5: ["Sports", "Books"],  # outdoor_adventurer
        6: ["Electronics", "Home", "Fashion"],  # smart_shopper (diverse)
        7: ["Fashion", "Home", "Books"],  # lifestyle_blogger (diverse)
        8: ["Electronics", "Sports"],  # gadget_lover
        9: ["Sports", "Books", "Home"],  # wellness_coach
    }
    
    # Group products by category
    products_by_category = {}
    for product in products:
        if product.category not in products_by_category:
            products_by_category[product.category] = []
        products_by_category[product.category].append(product)
    
    interactions = []
    interaction_types_list = [
        InteractionType.VIEW,
        InteractionType.VIEW,  # More views
        InteractionType.VIEW,
        InteractionType.CLICK,
        InteractionType.CLICK,
        InteractionType.CART_ADD,
        InteractionType.PURCHASE,
    ]
    
    # Create realistic interaction patterns
    base_date = datetime.utcnow() - timedelta(days=30)
    
    for i in range(200):
        # Select a user
        user_idx = random.randint(0, len(users) - 1)
        user = users[user_idx]
        
        # 80% chance to interact with preferred categories, 20% random
        if random.random() < 0.8 and user_idx in user_preferences:
            # Choose from preferred categories
            preferred_categories = user_preferences[user_idx]
            category = random.choice(preferred_categories)
            if category in products_by_category:
                product = random.choice(products_by_category[category])
            else:
                product = random.choice(products)
        else:
            # Random product
            product = random.choice(products)
        
        # Select interaction type (more views than purchases)
        interaction_type = random.choice(interaction_types_list)
        
        # Create timestamp (spread over last 30 days)
        timestamp = base_date + timedelta(
            days=random.randint(0, 30),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        )
        
        interaction = UserInteraction(
            user_id=user.id,
            product_id=product.id,
            interaction_type=interaction_type,
            interaction_score=interaction_type.score,
            timestamp=timestamp
        )
        interactions.append(interaction)
    
    db.add_all(interactions)
    db.commit()
    print(f"✓ Added {len(interactions)} user interactions with realistic patterns")


def main():
    """Main seeding function"""
    db = SessionLocal()
    
    try:
        print("Seeding database with sample data...")
        
        # Check if data already exists
        existing_products = db.query(Product).count()
        if existing_products > 0:
            print(f"Database already has {existing_products} products. Skipping seeding.")
            return
        
        products = seed_products(db)
        users = seed_users(db)
        seed_interactions(db, users, products)
        
        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()

