import asyncio
import json
from datetime import datetime
from collections import defaultdict

# Import from models
from brand_influencer_matcher_backend.models.influencer import (
    client_openai, co, index, collection,
    InfluencerAnalysis, get_embedding
)

# -----------------------------
# Import TikTok processing function
# -----------------------------
from brand_influencer_matcher_backend.process_tiktok import process_tiktok_user

async def process_tiktok_user_async(username, limit=2):
    # Directly await the async function
    return await process_tiktok_user(username, limit)

# -----------------------------
# Web search
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

    # Convert to dict
    if isinstance(llm_response.output_text, str):
        try:
            analysis = json.loads(llm_response.output_text)
        except:
            # fallback to dict
            analysis = {k: getattr(llm_response.output_parsed, k, "") for k in InfluencerAnalysis.__fields__}
    else:
        analysis = llm_response.output_text

    # 4) Save to MongoDB
    doc = {
        "influencer": influ,
        "search_result": search_result,
        "tiktok_result": tiktok_result_str,
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
            # Delete old
            index.delete(ids=[vector_id], namespace=key)
            # Create embedding
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
