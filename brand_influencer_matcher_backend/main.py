import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from brand_influencer_matcher_backend.api.endpoints import brand_router, influencer_router, match_router

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

# Include routers
app.include_router(brand_router)
app.include_router(influencer_router)
app.include_router(match_router)

# Debug: Print registered routes
print("\n=== Registered Routes ===")
for route in app.routes:
    if hasattr(route, "methods"):
        print(f"{route.path} - {route.methods}")
print("======================\n")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

# Debug endpoint to list all routes
@app.get("/routes")
async def list_routes():
    """List all available API routes"""
    routes = []
    for route in app.routes:
        if hasattr(route, "methods"):
            routes.append({
                "path": route.path,
                "name": route.name,
                "methods": list(route.methods)
            })
    return {"routes": routes}

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
