import os
import asyncio
import json
import subprocess
from datetime import datetime
from openai import AsyncOpenAI

# Initialize OpenAI client
openai_client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# --- ดึง profile + videos ด้วย yt-dlp ---
async def fetch_tiktok_profile_and_videos(username, limit=3):
    def _run():
        return subprocess.run(
            ["yt-dlp", f"https://www.tiktok.com/@{username}", "-J", "--flat-playlist", "--max-downloads", str(limit)],
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
        likes = vid.get("like_count", 0)
        comments = vid.get("comment_count", 0)
        shares = vid.get("share_count", 0)
        views = vid.get("view_count", 0)
        engagement = likes + comments + shares
        engagement_rate = engagement / views if views else 0
        video_url = f"https://www.tiktok.com/@{username}/video/{vid['id']}"
        videos.append({
            "url": video_url,
            "video_id": vid["id"],
            "caption": vid.get("title", ""),
            "likes": likes,
            "comments": comments,
            "shares": shares,
            "views": views,
            "post_date": datetime.fromtimestamp(vid.get("upload_date", 0)).isoformat() if vid.get("upload_date") else None,
            "engagement_rate": engagement_rate,
            "transcription": None,
            "summary": None
        })
    return profile_data, videos

# --- ดาวน์โหลดเสียง ---
async def download_audio(video_url, output_path="temp_audio.mp3"):
    if os.path.exists(output_path):
        os.remove(output_path)

    def _run():
        subprocess.run([
            "yt-dlp", "-x", "--audio-format", "mp3", "-o", output_path, video_url
        ], check=True)

    await asyncio.to_thread(_run)

    if not os.path.exists(output_path):
        raise FileNotFoundError(f"ไม่พบไฟล์หลัง download: {output_path}")
    return output_path

# --- ASR Whisper ---
async def transcribe_audio(audio_file):
    try:
        with open(audio_file, "rb") as f:
            result = await openai_client.audio.transcriptions.create(
                file=f, model="whisper-1"
            )
        return result.text
    except Exception as e:
        print(f"Error in transcribe_audio: {str(e)}")
        return ""

# --- สรุปด้วย GPT ---
async def summarize_text(text):
    try:
        response = await openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "คุณเป็นผู้ช่วยสร้างสรุปเนื้อหา video สั้น ๆ"},
                {"role": "user", "content": f"สรุปวิดีโอนี้ให้สั้นกระชับ 1-2 ประโยค ถ้าเป็นโฆษณาก็วิเคราะว่าขายอะไร: {text}"}
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
    processed_count = 0

    for vid in videos:
        print(f"Processing: {vid['url']}")
        try:
            audio_file = await download_audio(vid["url"])
            transcription = await transcribe_audio(audio_file)
            summary = await summarize_text(transcription)

            vid["transcription"] = transcription
            vid["summary"] = summary

            os.remove(audio_file)
            processed_count += 1
        except Exception as e:
            print(f"Error processing video {vid['video_id']}: {e}")

    profile["videos_processed"] = processed_count
    return {
        "username": username,
        "profile": profile,
        "videos_processed": processed_count,
        "videos": videos
    }