import os
import asyncio
import json
import subprocess
from datetime import datetime
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables or .env file")

openai_client = AsyncOpenAI(api_key=api_key)

# --- ดึง profile + videos ด้วย yt-dlp (flat playlist) ---
async def fetch_tiktok_profile_and_videos(username, limit=3):
    def _run():
        return subprocess.run(
            ["yt-dlp", f"https://www.tiktok.com/@{username}", "-J", "--flat-playlist"],
            capture_output=True, text=True, check=True
        )
    
    result = await asyncio.to_thread(_run)
    data = json.loads(result.stdout)
    
    profile_data = {
        "username": username,
        "last_updated": datetime.now().isoformat()
    }

    videos = []
    entries = data.get("entries", [])[:limit]
    for vid in entries:
        video_url = f"https://www.tiktok.com/@{username}/video/{vid['id']}"
        videos.append({
            "url": video_url,
            "video_id": vid["id"],
            "caption": vid.get("title", ""),
            "transcription": None,  # เราไม่ดาวน์โหลด audio
            "summary": None
        })
    return profile_data, videos

# --- สรุปด้วย GPT จาก caption ---
async def summarize_text(text):
    try:
        response = await openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "คุณเป็นผู้ช่วยสร้างสรุปเนื้อหา video สั้น ๆ"},
                {"role": "user", "content": f"สรุปวิดีโอนี้ให้สั้นกระชับ 1-2 ประโยค ถ้าเป็นโฆษณาก็วิเคราะห์ว่าขายอะไร: {text}"}
            ],
            max_tokens=300
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error in summarize_text: {str(e)}")
        return "ไม่สามารถสรุปเนื้อหาได้"

# --- pipeline ---
async def process_tiktok_user(username, limit=3):
    profile, videos = await fetch_tiktok_profile_and_videos(username, limit)
    for vid in videos:
        print(f"Processing: {vid['url']}")
        vid["summary"] = await summarize_text(vid["caption"])
    profile["videos_processed"] = len(videos)
    return {
        "username": username,
        "profile": profile,
        "videos_processed": len(videos),
        "videos": videos
    }

# --- รัน script ---
if __name__ == "__main__":
    import sys
    import pprint

    if len(sys.argv) < 2:
        print("Usage: python -m brand_influencer_matcher_backend.process_tiktok <username> [limit]")
        sys.exit(1)

    username = sys.argv[1]
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 3

    result = asyncio.run(process_tiktok_user(username, limit=limit))
    pprint.pprint(result)
