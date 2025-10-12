# Database Seeding Guide

## Overview

The `seed_data.py` script populates your database with realistic sample data for testing and development.

## What Gets Seeded?

### 📦 Products (50 total)

Products are distributed evenly across 5 categories:

#### Electronics (10 products)
- Wireless Noise-Cancelling Headphones ($249.99)
- 4K Smart TV 55-inch ($599.99)
- Laptop Ultrabook 13-inch ($1,299.99)
- Wireless Gaming Mouse ($79.99)
- Smartphone Flagship 128GB ($899.99)
- Wireless Earbuds Pro ($199.99)
- Smart Watch Fitness Tracker ($299.99)
- Portable Bluetooth Speaker ($129.99)
- Tablet 10-inch WiFi ($349.99)
- USB-C Hub Multi-Port Adapter ($49.99)

#### Fashion (10 products)
- Men's Classic Leather Jacket ($299.99)
- Women's Running Sneakers ($119.99)
- Unisex Backpack 30L ($79.99)
- Women's Summer Dress ($59.99)
- Men's Slim Fit Jeans ($69.99)
- Polarized Sunglasses ($89.99)
- Women's Yoga Leggings ($44.99)
- Men's Formal Dress Shirt ($49.99)
- Leather Wallet RFID Blocking ($39.99)
- Women's Crossbody Handbag ($99.99)

#### Home (10 products)
- Coffee Maker Programmable ($89.99)
- Memory Foam Pillow Set ($79.99)
- Robot Vacuum Cleaner ($299.99)
- Non-Stick Cookware Set 10-Piece ($149.99)
- Air Fryer 5.8 Quart ($119.99)
- Bamboo Bed Sheet Set Queen ($89.99)
- Essential Oil Diffuser ($34.99)
- Stainless Steel Knife Set ($129.99)
- Smart LED Light Bulbs 4-Pack ($49.99)
- Weighted Blanket 15 lbs ($79.99)

#### Books (10 products)
- The Art of Programming ($49.99)
- Mindfulness for Beginners ($16.99)
- The Science of Nutrition ($34.99)
- Mystery Thriller: Dark Waters ($14.99)
- Financial Freedom Blueprint ($24.99)
- Creative Photography Handbook ($39.99)
- World History: A Modern Perspective ($44.99)
- Quick & Easy Cookbook ($19.99)
- Fantasy Epic: Dragon's Legacy ($18.99)
- The Leadership Handbook ($29.99)

#### Sports (10 products)
- Yoga Mat Extra Thick ($39.99)
- Adjustable Dumbbell Set ($349.99)
- Resistance Bands Set ($29.99)
- Camping Tent 4-Person ($159.99)
- Mountain Bike 27.5-inch ($499.99)
- Jump Rope Speed Rope ($14.99)
- Foam Roller for Muscle Recovery ($24.99)
- Swimming Goggles Anti-Fog ($19.99)
- Basketball Official Size ($34.99)
- Fitness Tracker Watch ($59.99)

### 👥 Users (10 total)

Each user has distinct preferences:

1. **tech_enthusiast** - Interested in Electronics
2. **fashionista_sarah** - Interested in Fashion
3. **home_chef_mike** - Interested in Home & Books
4. **bookworm_emily** - Interested in Books
5. **fitness_guru** - Interested in Sports & Fashion
6. **outdoor_adventurer** - Interested in Sports & Books
7. **smart_shopper** - Interested in Electronics, Home & Fashion (diverse)
8. **lifestyle_blogger** - Interested in Fashion, Home & Books (diverse)
9. **gadget_lover** - Interested in Electronics & Sports
10. **wellness_coach** - Interested in Sports, Books & Home

### 🔄 User Interactions (200 total)

Interactions are generated with realistic patterns:

- **80% preference-based**: Users interact mostly with products in their preferred categories
- **20% random exploration**: Users occasionally browse other categories
- **Interaction distribution**:
  - ~43% VIEW (score: 1.0)
  - ~29% CLICK (score: 2.0)
  - ~14% CART_ADD (score: 3.0)
  - ~14% PURCHASE (score: 5.0)
- **Time spread**: Interactions are distributed over the last 30 days

## Running the Seed Script

```bash
# First time seeding
python seed_data.py

# If data already exists, you'll be prompted:
# ⚠️  Database already has X products. Continue? (yes/no):
```

## Viewing Statistics

After seeding, view comprehensive database statistics:

```bash
python db_stats.py
```

This shows:
- Total products by category
- Price statistics (average, min, max)
- Total users and interactions
- Interaction type distribution
- Most active users
- Most popular products
- Category preferences

## Resetting Data

To clear all data and start fresh:

```bash
python create_db.py --reset
python seed_data.py
```

⚠️ **Warning**: This will delete all existing data!

## Use Cases

This seed data enables testing of:

1. **Collaborative Filtering**: User-based recommendations using interaction patterns
2. **Content-Based Filtering**: Similar product recommendations based on tags and categories
3. **Personalized Recommendations**: User-specific suggestions based on browsing history
4. **Category Analysis**: Popular categories and user preferences
5. **Interaction Scoring**: Different weights for view, click, cart, and purchase actions

## Customization

To customize the seed data, edit `seed_data.py`:

- **Add more products**: Extend the `products_data` list
- **Modify user preferences**: Update the `user_preferences` dictionary
- **Change interaction patterns**: Adjust the `interaction_types_list` distribution
- **Extend time range**: Modify the `timedelta` in the interaction generation

## Data Consistency

The seed script ensures:
- Unique usernames and emails
- Valid foreign key relationships
- Proper timestamp ordering
- Realistic price ranges
- Consistent tag formats (lowercase, hyphenated)
- Auto-calculated interaction scores

