import asyncio
import motor.motor_asyncio
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from the specified .env file
env_path = Path('/Users/inkk/projectA/brand_influencer_matcher_backend/.env')
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    print(f"Loaded environment variables from {env_path}")
else:
    print(f"Warning: {env_path} not found. Using default environment variables.")
    load_dotenv()  # Fallback to default .env if exists

async def check_brands_async():
    try:
        # Connect using async motor
        client = motor.motor_asyncio.AsyncIOMotorClient(os.getenv("MONGODB_URI"))
        db = client[os.getenv("DB_NAME", "brand_influencer_db")]
        
        # Count documents
        count = await db.brands.count_documents({})
        print(f"Found {count} documents in 'brands' collection")
        
        # Get all documents
        cursor = db.brands.find({})
        
        print("\nDocuments in 'brands' collection:")
        print("-" * 50)
        
        async for doc in cursor:
            print(f"Brand: {doc.get('brand_name', 'N/A')}")
            print(f"ID: {doc.get('_id')}")
            print("Data:")
            for key, value in doc.items():
                if key not in ['_id', 'brand_name']:
                    print(f"  {key}: {value}")
            print("-" * 50)
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'client' in locals():
            client.close()

def check_brands_sync():
    try:
        # Connect using pymongo
        client = MongoClient(os.getenv("MONGODB_URI", "mongodb://localhost:27017/"))
        db = client[os.getenv("DB_NAME", "brand_influencer_db")]
        
        # Count documents
        count = db.brands.count_documents({})
        print(f"Found {count} documents in 'brands' collection")
        
        # Get all documents
        cursor = db.brands.find({})
        
        print("\nDocuments in 'brands' collection:")
        print("-" * 50)
        
        for doc in cursor:
            print(f"Brand: {doc.get('brand_name', 'N/A')}")
            print(f"ID: {doc.get('_id')}")
            print("Data:")
            for key, value in doc.items():
                if key not in ['_id', 'brand_name']:
                    print(f"  {key}: {value}")
            print("-" * 50)
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    print("Trying async check...")
    try:
        asyncio.run(check_brands_async())
    except Exception as e:
        print(f"Async check failed: {e}")
        print("\nTrying sync check...")
        check_brands_sync()
