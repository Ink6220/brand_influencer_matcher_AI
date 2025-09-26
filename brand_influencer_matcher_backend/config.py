import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

# Database Configuration
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "brand_influencer_db")

# Pinecone Configuration
PINECONE_INDEX_NAME = "influencer-analysis"
PINECONE_DIMENSION = 1024  # Cohere v3 embeddings dimension
PINECONE_METRIC = "cosine"
PINECONE_SPEC = {
    "cloud": "aws",
    "region": "us-east-1"
}

# Validation
REQUIRED_KEYS = ["OPENAI_API_KEY", "COHERE_API_KEY", "PINECONE_API_KEY"]
missing_keys = [key for key in REQUIRED_KEYS if not os.getenv(key)]
if missing_keys:
    raise ValueError(f"Missing required environment variables: {', '.join(missing_keys)}")

# Collections
BRAND_COLLECTION = "brands"
INFLUENCER_COLLECTION = "influencers"
