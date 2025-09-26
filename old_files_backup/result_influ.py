import json
import os
from collections import defaultdict
from dotenv import load_dotenv
import motor.motor_asyncio
from pinecone import Pinecone, ServerlessSpec
import cohere
import json
import motor.motor_asyncio
from collections import defaultdict
import asyncio
from pinecone import Pinecone, ServerlessSpec
import cohere
from pinecone import Pinecone, ServerlessSpec
import cohere
# Load environment variables
load_dotenv()

# -----------------------------
# Init Pinecone client
# -----------------------------
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

index_name = "influencer-analysis"

if index_name not in [index.name for index in pc.list_indexes()]:
    pc.create_index(
        name=index_name,
        dimension=1024,   # Cohere v3 embeddings = 1024 dimensions
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )

index = pc.Index(index_name)

# -----------------------------
# Init Cohere client
# -----------------------------
co = cohere.Client(os.getenv("COHERE_API_KEY"))

def get_embedding(text: str) -> list[float]:
    resp = co.embed(
        model="embed-multilingual-v3.0",  
        texts=[text],
        input_type="classification"
    )
    return resp.embeddings[0]
# ------------------------------
# MongoDB setup
# ------------------------------
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "brand_influencer_db")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
brand_collection = db["brands"]

# ------------------------------
# Mapping brand key -> Pinecone namespace
# ------------------------------
key_to_namespace = {
    "type_of_product": "Type_of_content",
    "target_group": "target_Audience",
    "positioning": "positioning",
    "brand_personality": "personality",
    "vision": "vision"
}

# ------------------------------
# Async function to rank top 3 influencers
# ------------------------------
async def rank_top3_influencers_by_brand(brand_name: str):
    # 1) ดึง brand data จาก MongoDB
    brand_doc = await brand_collection.find_one({"brand_name": brand_name})
    if not brand_doc:
        raise ValueError(f"Brand '{brand_name}' not found in MongoDB")

    # 2) เตรียม brand_input dict จาก document
    brand_input = {k: brand_doc[k] for k in key_to_namespace.keys() if k in brand_doc}

    # 3) เก็บคะแนน raw
    raw_scores = defaultdict(dict)

    for input_key, text in brand_input.items():
        namespace = key_to_namespace[input_key]
        query_emb = get_embedding(text)

        result = index.query(
            vector=query_emb,
            top_k=10,
            namespace=namespace,
            include_metadata=True
        )

        for match in result.matches:
            influencer = match.metadata["influencer"]
            raw_scores[input_key][influencer] = match.score

    # 4) Normalize score แต่ละ key เป็น 0-10
    normalized = defaultdict(lambda: {"details": {}, "total_score": 0.0})
    for key, influencer_scores in raw_scores.items():
        if not influencer_scores:
            continue
        max_score = max(influencer_scores.values())
        for influencer, score in influencer_scores.items():
            norm_score = (score / max_score) * 10 if max_score > 0 else 0
            normalized[influencer]["details"][key] = round(norm_score, 2)
            normalized[influencer]["total_score"] += norm_score

    # 5) แปลงเป็น list + sort + slice top 3
    ranked = sorted(
        [
            {"influencer": inf, 
             "total_score": round(data["total_score"], 2), 
             "details": data["details"]}
            for inf, data in normalized.items()
        ],
        key=lambda x: x["total_score"],
        reverse=True
    )[:3]  # <-- top 3

    return json.dumps(ranked, ensure_ascii=False, indent=2)
