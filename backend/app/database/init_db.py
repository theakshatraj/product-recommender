"""
Database initialization script
"""

from .connection import engine, Base, init_db
from .models import Product, User, UserInteraction


def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully!")


def drop_tables():
    """Drop all database tables"""
    print("Dropping database tables...")
    Base.metadata.drop_all(bind=engine)
    print("✓ Database tables dropped successfully!")


def reset_database():
    """Reset database by dropping and recreating all tables"""
    print("Resetting database...")
    drop_tables()
    create_tables()
    print("✓ Database reset complete!")


if __name__ == "__main__":
    # Run this script directly to create tables
    create_tables()

