from pydantic import BaseModel
from agents import Agent, WebSearchTool

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
brand_agent = Agent(
    name="Brand Researcher",
    tools=[WebSearchTool()],
    output_type=BrandAnalysis,
)
