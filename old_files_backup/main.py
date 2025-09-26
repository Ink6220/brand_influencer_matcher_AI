import os
import json
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import motor.motor_asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import existing modules
from brand import search_Brand, BrandAnalysis
from influ import search_influ_analysis
from result_influ import rank_top3_influencers_by_brand

# Initialize FastAPI app
app = FastAPI(
    title="Brand-Influencer Matching API",
    description="API for analyzing brands and influencers, and finding the best matches",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class BrandRequest(BaseModel):
    brand_name: str

class InfluencerRequest(BaseModel):
    influencer_name: str

class MatchRequest(BaseModel):
    brand_name: str

# Endpoints
@app.post("/analyze-brand", response_model=BrandAnalysis)
async def analyze_brand(request: BrandRequest):
    """
    Analyze a brand and store the results in the database.
    """
    try:
        result = await search_Brand(request.brand_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-influencer")
async def analyze_influencer(request: InfluencerRequest):
    """
    Analyze an influencer and store the results in the database.
    """
    try:
        result = await search_influ_analysis(request.influencer_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/match-influencers")
async def match_influencers(request: MatchRequest):
    """
    Find the top 3 influencers that best match the given brand.
    """
    try:
        result = await rank_top3_influencers_by_brand(request.brand_name)
        # Parse the JSON string to a Python object before returning
        return {"matches": json.loads(result)}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
