from datetime import datetime
from typing import Dict, Any, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from openai import AsyncOpenAI
from brand_influencer_matcher_backend.models import mongo_db
from brand_influencer_matcher_backend.config import OPENAI_API_KEY
from brand_influencer_matcher_backend.models.analysis import InfluencerBrandMatchAnalysis

# Initialize OpenAI client
client_openai = AsyncOpenAI(api_key=OPENAI_API_KEY)

async def get_influencer_data(influencer_name: str) -> Optional[Dict[str, Any]]:
    """
    Fetch influencer data from the database.
    """
    # Remove @ if present
    influencer_name = influencer_name.lstrip('@')
    
    # Find the most recent analysis for this influencer
    cursor = mongo_db['influencers'].find(
        {"influencer": influencer_name}
    ).sort("last_updated", -1).limit(1)
    
    result = await cursor.to_list(1)
    return result[0] if result else None

async def get_brand_data(brand_name: str) -> Optional[Dict[str, Any]]:
    """
    Fetch brand data from the database.
    """
    cursor = mongo_db['brands'].find(
        {"brand_name": brand_name}
    ).sort("last_updated", -1).limit(1)
    
    result = await cursor.to_list(1)
    return result[0] if result else None

async def analyze_influencer_brand_match(influencer_name: str, brand_name: str) -> Dict[str, Any]:
    """
    Analyze the match between an influencer and a brand using LLM.
    """
    # Get influencer data
    influencer_data = await get_influencer_data(influencer_name)
    if not influencer_data:
        raise ValueError(f"No data found for influencer: {influencer_name}")
    
    # Get brand data
    brand_data = await get_brand_data(brand_name)
    if not brand_data:
        raise ValueError(f"No data found for brand: {brand_name}")
    
    # Extract necessary data
    search_result = influencer_data.get("search_result", "")
    tiktok_result_str = influencer_data.get("tiktok_result", "")
    
    # Get brand analysis fields
    brand_analysis = brand_data.get("analysis", {})
    
    # Generate the analysis using LLM
    llm_response = await client_openai.responses.parse(
        model="gpt-4o-mini",
        text_format=InfluencerBrandMatchAnalysis,
        input=f"""
        วิเคราะห์ความเหมาะสมระหว่าง TikToker: {influencer_name} กับ Brand: {brand_name}

        ข้อมูลจากผลการสืบค้นของ {influencer_name}:
        {search_result}

        ผลการวิเคราะห์คลิป TikTok:
        {tiktok_result_str}

        ข้อมูลของ Brand {brand_name}:
        {{
            "type_of_product": "{brand_analysis.get('type_of_product', '')}",
            "target_group": "{brand_analysis.get('target_group', '')}",
            "positioning": "{brand_analysis.get('positioning', '')}",
            "brand_personality": "{brand_analysis.get('brand_personality', '')}",
            "vision": "{brand_analysis.get('vision', '')}"
        }}

        โปรดวิเคราะห์และสรุปประเด็นต่อไปนี้:
        1. จุดเด่นของ {influencer_name} ในการเป็นพรีเซนเตอร์ให้ {brand_name}
        2. สไตล์การนำเสนอคอนเทนต์ที่โดดเด่น
        3. ความเข้ากันได้กับ Brand ตามข้อมูลที่ให้
        4. ความเหมาะสมในการทำแคมเปญร่วมกัน
        5. ข้อเสนอแนะเชิงกลยุทธ์ (รูปแบบคอนเทนต์ที่แนะนำ, จุดขายที่ควรเน้น, แนวทางการทำงานร่วมกัน)
        """
    )
    
    # Prepare the result
    result = llm_response.output_parsed
    
    return result
