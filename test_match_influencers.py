import httpx
import asyncio

async def test_match_influencers():
    url = "http://localhost:8000/api/v1/match-influencers"
    data = {"brand_name": "Gymshark"}  # Testing with Gymshark brand
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data, timeout=30.0)
            response.raise_for_status()
            result = response.json()
            print("Match Influencers Result:")
            print(result)
            return result
    except httpx.HTTPStatusError as e:
        print(f"HTTP error occurred: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_match_influencers())
