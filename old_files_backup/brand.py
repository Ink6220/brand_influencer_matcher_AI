import motor.motor_asyncio
from agents import Agent, Runner, WebSearchTool
from pydantic import BaseModel

# ------------------------------
# MongoDB setup
# ------------------------------
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "brand_influencer_db")

if not MONGO_URI:
    raise ValueError("MONGODB_URI environment variable is not set")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
try:
    # Test the connection
    client.server_info()
    db = client[DB_NAME]
    brand_collection = db["brands"]
except Exception as e:
    print(f"Error connecting to MongoDB: {str(e)}")
    raise

# ------------------------------
# Pydantic Schema
# ------------------------------
class BrandAnalysis(BaseModel):
    type_of_product: str
    target_group: str
    positioning: str
    brand_personality: str
    vision: str

# ------------------------------
# Agent setup
# ------------------------------
agent = Agent(
    name="Brand Researcher",
    tools=[WebSearchTool()],
    output_type=BrandAnalysis,
)

# ------------------------------
# Function
# ------------------------------
async def search_Brand(brand: str):
    result = await Runner.run(agent, f"วิเคราะห์แบรนด์ {brand}  ตามโครงสร้างที่กำหนด")
    data = result.final_output.model_dump()

    # เก็บลง MongoDB
    await brand_collection.update_one(
        {"brand_name": brand},              # filter
        {"$set": {"brand_name": brand, **data}},  
        upsert=True                         # ถ้ามีอยู่แล้ว update ถ้าไม่มี insert ใหม่
    )

    return data