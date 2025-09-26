import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from brand_influencer_matcher_backend.services.match_service import rank_top3_influencers_by_brand

router = APIRouter(prefix="/api/v1", tags=["matches"])

class MatchRequest(BaseModel):
    brand_name: str

@router.post("/match-influencers")
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
