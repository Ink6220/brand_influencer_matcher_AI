from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from brand_influencer_matcher_backend.services.brand_service import search_Brand, brand_collection
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

@router.get("/brands", response_model=List[Dict[str, str]])
async def list_brands():
    """
    List all brands in the database.
    """
    try:
        # Get all brands from the brand collection
        cursor = brand_collection.find({}, {"brand_name": 1, "_id": 0}).sort("brand_name", 1)  # Sort by brand_name
        brands = await cursor.to_list(length=100)  # Limit to 100 brands
        # Return unique brand names
        unique_brands = {}
        for b in brands:
            if "brand_name" in b and b["brand_name"]:
                unique_brands[b["brand_name"]] = {"name": b["brand_name"]}
        return list(unique_brands.values())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
