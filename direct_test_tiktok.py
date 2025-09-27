import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import the functions from the provided code
from process_tiktok import (
    fetch_tiktok_profile_and_videos,
    download_audio,
    transcribe_audio,
    summarize_text,
    process_tiktok_user_async
)

async def test_fetch_profile():
    print("Testing fetch_tiktok_profile_and_videos...")
    username = "kubkhaonaikrua"
    try:
        profile, videos = await fetch_tiktok_profile_and_videos(username, limit=1)
        print(f"Successfully fetched profile for @{username}")
        print(f"Profile data: {profile}")
        if videos:
            print(f"Found {len(videos)} videos")
            print(f"First video URL: {videos[0]['url']}")
            return videos[0]['url']
        return None
    except Exception as e:
        print(f"Error fetching profile: {e}")
        return None

async def test_download_audio(video_url):
    if not video_url:
        print("Skipping download test - no video URL provided")
        return None
        
    print("\nTesting download_audio...")
    try:
        audio_file = await download_audio(video_url, "test_audio.mp3")
        print(f"Successfully downloaded audio to {audio_file}")
        return audio_file
    except Exception as e:
        print(f"Error downloading audio: {e}")
        return None

async def test_transcription(audio_file):
    if not audio_file or not os.path.exists(audio_file):
        print("Skipping transcription test - no audio file")
        return None
        
    print("\nTesting transcribe_audio...")
    try:
        transcription = await transcribe_audio(audio_file)
        print("Transcription successful!")
        print(f"First 100 chars: {transcription[:100]}...")
        return transcription
    except Exception as e:
        print(f"Error in transcription: {e}")
        return None

async def test_summary(text):
    if not text:
        print("Skipping summary test - no text provided")
        return None
        
    print("\nTesting summarize_text...")
    try:
        summary = await summarize_text(text)
        print("Summary generated successfully!")
        print(f"Summary: {summary}")
        return summary
    except Exception as e:
        print(f"Error generating summary: {e}")
        return None

async def test_full_pipeline():
    print("\n=== Testing Full Pipeline ===")
    username = "kubkhaonaikrua"
    try:
        print(f"Processing TikTok user: @{username}")
        result = await process_tiktok_user_async(username, limit=1)
        print("\nPipeline completed successfully!")
        print(f"Username: {result['username']}")
        print(f"Videos processed: {result['videos_processed']}")
        if result['videos']:
            video = result['videos'][0]
            print(f"\nFirst video summary:")
            print(f"URL: {video['url']}")
            print(f"Caption: {video['caption']}")
            print(f"Transcription length: {len(video['transcription'] or '')} chars")
            print(f"Summary: {video['summary']}")
    except Exception as e:
        print(f"Error in full pipeline: {e}")

async def main():
    # Test individual components
    video_url = await test_fetch_profile()
    audio_file = await test_download_audio(video_url)
    transcription = await test_transcription(audio_file)
    if transcription:
        await test_summary(transcription)
    
    # Clean up
    if audio_file and os.path.exists(audio_file):
        try:
            os.remove(audio_file)
            print(f"\nCleaned up: Removed {audio_file}")
        except Exception as e:
            print(f"Error cleaning up: {e}")
    
    # Test full pipeline
    await test_full_pipeline()

if __name__ == "__main__":
    asyncio.run(main())
