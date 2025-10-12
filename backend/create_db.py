"""
Database creation script
Run this script to create all database tables
"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.init_db import create_tables, reset_database


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Database management script")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Reset database (drop and recreate all tables)"
    )
    
    args = parser.parse_args()
    
    if args.reset:
        confirm = input("⚠️  This will DELETE all data. Are you sure? (yes/no): ")
        if confirm.lower() == "yes":
            reset_database()
        else:
            print("❌ Database reset cancelled")
    else:
        create_tables()

