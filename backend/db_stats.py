"""
View database statistics
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import SessionLocal
from app.database.models import Product, User, UserInteraction, InteractionType
from sqlalchemy import func


def show_statistics():
    """Display database statistics"""
    db = SessionLocal()
    
    try:
        print("\n" + "="*60)
        print("📊 DATABASE STATISTICS")
        print("="*60)
        
        # Product statistics
        total_products = db.query(Product).count()
        print(f"\n📦 PRODUCTS: {total_products} total")
        
        products_by_category = db.query(
            Product.category,
            func.count(Product.id).label('count')
        ).group_by(Product.category).all()
        
        for category, count in products_by_category:
            print(f"   • {category}: {count} products")
        
        # Price statistics
        avg_price = db.query(func.avg(Product.price)).scalar()
        min_price = db.query(func.min(Product.price)).scalar()
        max_price = db.query(func.max(Product.price)).scalar()
        print(f"\n💰 PRICE RANGE:")
        print(f"   • Average: ${avg_price:.2f}")
        print(f"   • Min: ${min_price:.2f}")
        print(f"   • Max: ${max_price:.2f}")
        
        # User statistics
        total_users = db.query(User).count()
        print(f"\n👥 USERS: {total_users} total")
        
        # Interaction statistics
        total_interactions = db.query(UserInteraction).count()
        print(f"\n🔄 INTERACTIONS: {total_interactions} total")
        
        interactions_by_type = db.query(
            UserInteraction.interaction_type,
            func.count(UserInteraction.id).label('count')
        ).group_by(UserInteraction.interaction_type).all()
        
        for interaction_type, count in interactions_by_type:
            percentage = (count / total_interactions) * 100
            print(f"   • {interaction_type.value}: {count} ({percentage:.1f}%)")
        
        # User activity
        print(f"\n📈 USER ACTIVITY:")
        user_activity = db.query(
            User.username,
            func.count(UserInteraction.id).label('interaction_count')
        ).join(UserInteraction).group_by(User.id, User.username).order_by(
            func.count(UserInteraction.id).desc()
        ).limit(5).all()
        
        print("   Top 5 Most Active Users:")
        for username, count in user_activity:
            print(f"   • {username}: {count} interactions")
        
        # Popular products
        print(f"\n🌟 POPULAR PRODUCTS:")
        popular_products = db.query(
            Product.name,
            func.count(UserInteraction.id).label('interaction_count')
        ).join(UserInteraction).group_by(Product.id, Product.name).order_by(
            func.count(UserInteraction.id).desc()
        ).limit(5).all()
        
        print("   Top 5 Most Interacted Products:")
        for name, count in popular_products:
            print(f"   • {name}: {count} interactions")
        
        # Category preferences
        print(f"\n🎯 CATEGORY PREFERENCES:")
        category_interactions = db.query(
            Product.category,
            func.count(UserInteraction.id).label('interaction_count')
        ).join(UserInteraction).group_by(Product.category).order_by(
            func.count(UserInteraction.id).desc()
        ).all()
        
        for category, count in category_interactions:
            percentage = (count / total_interactions) * 100
            print(f"   • {category}: {count} interactions ({percentage:.1f}%)")
        
        print("\n" + "="*60 + "\n")
        
    except Exception as e:
        print(f"❌ Error retrieving statistics: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    show_statistics()

