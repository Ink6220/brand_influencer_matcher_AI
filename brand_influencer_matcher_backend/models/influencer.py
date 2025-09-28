from pydantic import BaseModel
import cohere
from openai import AsyncOpenAI
from pinecone import Pinecone, ServerlessSpec
from motor.motor_asyncio import AsyncIOMotorClient

# Import centralized configuration
from brand_influencer_matcher_backend.config import (
    OPENAI_API_KEY, COHERE_API_KEY, PINECONE_API_KEY,
    MONGO_URI, DB_NAME, INFLUENCER_COLLECTION,
    PINECONE_INDEX_NAME, PINECONE_SPEC, PINECONE_DIMENSION, PINECONE_METRIC
)

# -----------------------------
# Initialize clients
# -----------------------------
client_openai = AsyncOpenAI(api_key=OPENAI_API_KEY)
co = cohere.Client(COHERE_API_KEY)

# -----------------------------
# Initialize Pinecone (new SDK)
# -----------------------------
pc = Pinecone(api_key=PINECONE_API_KEY)
index = None
try:
    # List all indexes
    existing_indexes = pc.list_indexes().names()
    
    # Create index if it doesn't exist
    if PINECONE_INDEX_NAME not in existing_indexes:
        pc.create_index(
            name=PINECONE_INDEX_NAME,
            dimension=PINECONE_DIMENSION,
            metric=PINECONE_METRIC,
            spec=PINECONE_SPEC
        )
    
    # Connect to the index
    index = pc.Index(PINECONE_INDEX_NAME)
    
except Exception as e:
    print(f"Error initializing Pinecone: {str(e)}")
    index = None

# -----------------------------
# MongoDB
# -----------------------------
mongo_client = AsyncIOMotorClient(MONGO_URI)
db = mongo_client[DB_NAME]
collection = db[INFLUENCER_COLLECTION]

# Export for use in other modules
__all__ = ['db', 'INFLUENCER_COLLECTION', 'InfluencerAnalysis', 'get_embedding']

# -----------------------------
# Pydantic schema
# -----------------------------
class InfluencerAnalysis(BaseModel):
    Type_of_content: str
    target_Audience: str
    positioning: str
    personality: str
    vision: str

# -----------------------------
# Embedding function
# -----------------------------
def get_embedding(text: str) -> list[float]:
    """
    Get embedding for the given text using Cohere's multilingual model.
    
    Args:
        text: The input text to get embedding for
        
    Returns:
        List[float]: A list of floats representing the text embedding
    """
    try:
        resp = co.embed(
            model="embed-multilingual-v3.0",
            texts=[text],
            input_type="classification"
        )
        return resp.embeddings[0]
    except Exception as e:
        print(f"Error generating embedding: {str(e)}")
        raise
