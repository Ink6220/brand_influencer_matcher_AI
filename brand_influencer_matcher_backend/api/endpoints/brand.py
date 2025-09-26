from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from brand_influencer_matcher_backend.services.brand_service import search_Brand
from brand_influencer_matcher_backend.models.brand import BrandAnalysis

router = APIRouter(prefix="/api/v1", tags=["brands"])

class BrandRequest(BaseModel):
    brand_name: str

@router.post("/analyze-brand", response_model=BrandAnalysis)
async def analyze_brand(request: BrandRequest):
    """
    Analyze a brand and return the analysis results.
    """
    try:
        result = await search_Brand(request.brand_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
