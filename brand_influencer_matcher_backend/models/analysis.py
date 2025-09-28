from pydantic import BaseModel
from typing import List, Optional

class InfluencerBrandMatchAnalysis(BaseModel):
    """
    Model for influencer-brand match analysis results.
    """
    influencer_strengths: str
    content_style: str
    brand_compatibility: str
    campaign_suitability: str
    strategic_recommendations: str
    
    class Config:
        schema_extra = {
            "example": {
                "influencer_strengths": "Influencer has a strong presence in the beauty niche...",
                "content_style": "Casual and engaging presentation style...",
                "brand_compatibility": "High compatibility with brand values...",
                "campaign_suitability": "Well-suited for product launch campaigns...",
                "strategic_recommendations": "Recommend focusing on tutorial-style content..."
            }
        }
