import os
import asyncio
import json
from datetime import datetime
from collections import defaultdict
from dotenv import load_dotenv

from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from pinecone import Pinecone, ServerlessSpec
import cohere
from openai import AsyncOpenAI

# -----------------------------
# Load environment variables
# -----------------------------
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "brand_influencer_db")

if not OPENAI_API_KEY or not COHERE_API_KEY or not PINECONE_API_KEY:
    raise ValueError("Set OPENAI_API_KEY, COHERE_API_KEY, PINECONE_API_KEY in .env")

# -----------------------------
# Initialize clients
# -----------------------------
client_openai = AsyncOpenAI(api_key=OPENAI_API_KEY)
co = cohere.Client(COHERE_API_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY)
index_name = "influencer-analysis"

# MongoDB
mongo_client = AsyncIOMotorClient(MONGO_URI)
db = mongo_client[DB_NAME]
collection = db["influencers"]

# -----------------------------
# Pinecone index setup
# -----------------------------
try:
    if index_name not in pc.list_indexes().names():
        pc.create_index(
            name=index_name,
            dimension=1024,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
    index = pc.Index(index_name)
except Exception as e:
    print(f"Error initializing Pinecone: {str(e)}")
    index = None

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
    resp = co.embed(
        model="embed-multilingual-v3.0",
        texts=[text],
        input_type="classification"
    )
    return resp.embeddings[0]

# -----------------------------
# Import TikTok processing function
# -----------------------------
from process_tiktok import process_tiktok_user

async def process_tiktok_user_async(username, limit=2):
    # Directly await the async function
    return await process_tiktok_user(username, limit)

# -----------------------------
# Web search placeholder (ต้อง implement)
# -----------------------------
from agents import Agent, Runner, WebSearchTool

agent = Agent(name="Assistant", tools=[WebSearchTool()])

async def search_influ(influ: str):
    result = await Runner.run(agent, f"tiktok {influ} คือ ใคร ข้อมูลว่าคนติดตามเป็นกลุ่มไหน ทำ content อะไร")
    return result.final_output

# -----------------------------
# Main pipeline
# -----------------------------
async def search_influ_analysis(influ: str):
    # 1) Search online
    search_result = await search_influ(influ)

    # 2) Process TikTok videos
    tiktok_result = await process_tiktok_user_async(influ, 2)
    
    # Convert TikTok result to string if it's not already
    tiktok_result_str = str(tiktok_result) if tiktok_result else "No TikTok data available"

    # 3) Analyze with LLM
    llm_response = await client_openai.responses.parse(
        model="gpt-4o-mini",
        text_format=InfluencerAnalysis,
        input=f"""
วิเคราะห์ TikTok {influ} ตามโครงสร้างที่กำหนด

ผลจากการสืบค้นจากเน็ต:
{search_result}

ผลการวิเคราะห์ตัวอย่างคลิปในช่อง:
{tiktok_result_str}
"""
    )

    # แปลงเป็น dict
    if isinstance(llm_response.output_text, str):
        try:
            analysis = json.loads(llm_response.output_text)
        except:
            # fallback เป็น dict
            analysis = {k: getattr(llm_response.output_parsed, k, "") for k in InfluencerAnalysis.__fields__}
    else:
        analysis = llm_response.output_text

    # 4) Save to MongoDB
    doc = {
        "influencer": influ,
        "search_result": search_result,
        "tiktok_result": tiktok_result_str,  # Use the string version we created earlier
        "analysis": analysis,
        "last_updated": datetime.now().isoformat()
    }
    await collection.update_one(
        {"influencer": influ},
        {"$set": doc},
        upsert=True
    )

    # 5) Upsert embeddings to Pinecone
    if index:
        for key, value in analysis.items():
            vector_id = f"{influ}_{key}"
            # ลบเก่า
            index.delete(ids=[vector_id], namespace=key)
            # สร้าง embedding
            embedding = get_embedding(value)
            index.upsert(
                vectors=[{
                    "id": vector_id,
                    "values": embedding,
                    "metadata": {"influencer": influ, "field": key, "text": value}
                }],
                namespace=key
            )

    return analysis
