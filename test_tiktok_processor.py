import asyncio
import os
from dotenv import load_dotenv
from brand_influencer_matcher_backend.services.influencer_service import process_tiktok_user_async

# Load environment variables
load_dotenv()

async def test_process_tiktok_user():
    # Test with a popular Thai TikTok user
    username = "kubkhaonaikrua"
    limit = 2  # Process 2 videos to test
    
    print(f"Starting to process TikTok user: @{username}")
    try:
        result = await process_tiktok_user_async(username, limit)
        print("\nProcessing completed successfully!")
        print("\nResults:")
        print(f"Username: {result['username']}")
        print(f"Videos Processed: {result['videos_processed']}")
        
        print("\nVideos Analysis:")
        for i, video in enumerate(result.get('videos', []), 1):
            print(f"\nVideo {i}:")
            print(f"URL: {video.get('url')}")
            print(f"Caption: {video.get('caption', 'No caption')}")
            print(f"Likes: {video.get('likes')}")
            print(f"Comments: {video.get('comments')}")
            print(f"Shares: {video.get('shares')}")
            print(f"Views: {video.get('views')}")
            print(f"Engagement Rate: {video.get('engagement_rate', 0)*100:.2f}%")
            print(f"Summary: {video.get('summary', 'No summary available')}")
            print("-" * 50)
            
    except Exception as e:
        print(f"\nError processing TikTok user: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_process_tiktok_user())
