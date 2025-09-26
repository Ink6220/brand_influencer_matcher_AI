from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from brand_influencer_matcher_backend.services.influencer_service import search_influ_analysis

router = APIRouter(prefix="/api/v1", tags=["influencers"])

class InfluencerRequest(BaseModel):
    influencer_name: str

@router.post("/analyze-influencer")
async def analyze_influencer(request: InfluencerRequest):
    """
    Analyze an influencer and return the analysis results.
    """
    try:
        result = await search_influ_analysis(request.influencer_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
