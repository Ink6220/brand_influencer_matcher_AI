import json
from collections import defaultdict
import asyncio
import motor.motor_asyncio
from pinecone import Pinecone

# Import from models
from ..models.influencer import get_embedding, index

# Import configuration
from ..config import (
    PINECONE_API_KEY, MONGO_URI, DB_NAME, BRAND_COLLECTION,
    PINECONE_INDEX_NAME
)

# Initialize Pinecone client
pc = Pinecone(api_key=PINECONE_API_KEY)

# MongoDB setup
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
brand_collection = db[BRAND_COLLECTION]

# Mapping brand key -> Pinecone namespace
key_to_namespace = {
    "type_of_product": "Type_of_content",
    "target_group": "target_Audience",
    "positioning": "positioning",
    "brand_personality": "personality",
    "vision": "vision"
}

# ------------------------------
# Async function to rank top 3 influencers
async def rank_top3_influencers_by_brand(brand_name: str):
    print(f"Starting influencer matching for brand: {brand_name}")
    
    try:
        # 1) ดึง brand data จาก MongoDB
        print(f"Fetching brand data for '{brand_name}' from MongoDB...")
        brand_doc = await brand_collection.find_one({"brand_name": brand_name})
        if not brand_doc:
            error_msg = f"Brand '{brand_name}' not found in MongoDB"
            print(error_msg)
            raise ValueError(error_msg)
        print("Brand data found in MongoDB")

        # 2) เตรียม brand_input dict จาก document
        brand_input = {k: brand_doc[k] for k in key_to_namespace.keys() if k in brand_doc}
        print(f"Brand input fields: {list(brand_input.keys())}")

        # 3) เก็บคะแนน raw
        raw_scores = defaultdict(dict)
        
        if index is None:
            error_msg = "Pinecone index is not initialized"
            print(error_msg)
            raise ValueError(error_msg)

        for input_key, text in brand_input.items():
            try:
                namespace = key_to_namespace[input_key]
                print(f"Processing namespace: {namespace} for input key: {input_key}")
                
                print(f"Generating embedding for text: {text[:50]}...")
                query_emb = get_embedding(text)
                print(f"Generated embedding vector of length: {len(query_emb) if query_emb else 0}")

                print(f"Querying Pinecone index '{index}' in namespace '{namespace}'...")
                result = index.query(
                    vector=query_emb,
                    top_k=10,
                    namespace=namespace,
                    include_metadata=True
                )
                print(f"Received {len(result.matches)} matches from Pinecone")

                for match in result.matches:
                    if not hasattr(match, 'metadata') or not match.metadata or "influencer" not in match.metadata:
                        print(f"Warning: Match is missing required 'influencer' metadata: {match}")
                        continue
                    influencer = match.metadata["influencer"]
                    raw_scores[input_key][influencer] = match.score
                    print(f"Added score {match.score:.4f} for influencer '{influencer}' in category '{input_key}'")
                    
            except Exception as e:
                print(f"Error processing input key '{input_key}' with namespace '{namespace}': {str(e)}")
                raise

        # 4) Normalize score แต่ละ key เป็น 0-10
        print("Normalizing scores...")
        normalized = defaultdict(lambda: {"details": {}, "total_score": 0.0})
        for key, influencer_scores in raw_scores.items():
            if not influencer_scores:
                print(f"No scores found for key: {key}")
                continue
            max_score = max(influencer_scores.values()) if influencer_scores else 0
            print(f"Normalizing scores for key: {key}, max_score: {max_score}")
            for influencer, score in influencer_scores.items():
                norm_score = (score / max_score) * 10 if max_score > 0 else 0
                normalized[influencer]["details"][key] = round(norm_score, 2)
                normalized[influencer]["total_score"] += norm_score
                print(f"Normalized score for {influencer} in {key}: {norm_score:.2f}")
                
        if not normalized:
            error_msg = "No influencers found for the given brand attributes"
            print(error_msg)
            raise ValueError(error_msg)

        # 5) แปลงเป็น list + sort + slice top 3
        print("Sorting and selecting top 3 influencers...")
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

        print(f"Top 3 influencers found: {[r['influencer'] for r in ranked]}")
        return json.dumps(ranked, ensure_ascii=False, indent=2)
        
    except Exception as e:
        print(f"Error in rank_top3_influencers_by_brand: {str(e)}")
        raise
