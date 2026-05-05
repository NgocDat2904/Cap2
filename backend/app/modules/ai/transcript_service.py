import os
import uuid
import asyncio
import subprocess
import tempfile
import traceback
from typing import Dict

import httpx
from faster_whisper import WhisperModel

# =========================
# MODEL (load 1 lần)
# =========================
model = WhisperModel(
    "base",              # tiny / base / small / medium
    device="cpu",        # nếu có GPU → "cuda"
    compute_type="int8"  # giảm RAM + tăng tốc
)


# =========================
# DOWNLOAD VIDEO (ASYNC)
# =========================
async def _download_video(url: str, path: str):
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.get(url)
        resp.raise_for_status()

        with open(path, "wb") as f:
            f.write(resp.content)


# =========================
# EXTRACT AUDIO (FFmpeg)
# =========================
async def _extract_audio(video_path: str, audio_path: str):
    process = await asyncio.create_subprocess_exec(
        "ffmpeg",
        "-y",                # overwrite
        "-i", video_path,
        "-vn",               # bỏ video
        "-acodec", "pcm_s16le",
        "-ar", "16000",
        "-ac", "1",
        audio_path,
        stdout=asyncio.subprocess.DEVNULL,
        stderr=asyncio.subprocess.DEVNULL
    )

    await process.wait()

    if process.returncode != 0:
        raise RuntimeError("FFmpeg failed")


# =========================
# MAIN FUNCTION
# =========================
async def generate_transcript_from_video(video: Dict) -> str:
    video_url = video.get("video_url")

    if not video_url:
        return ""

    uid = str(uuid.uuid4())

    with tempfile.TemporaryDirectory() as temp_dir:
        video_path = os.path.join(temp_dir, f"{uid}.mp4")
        audio_path = os.path.join(temp_dir, f"{uid}.wav")

        try:
            # 1. download
            await _download_video(video_url, video_path)

            # 2. extract audio
            await _extract_audio(video_path, audio_path)

            # 3. speech-to-text
            segments, _ = model.transcribe(
                audio_path,
                beam_size=1,       # nhanh hơn
                vad_filter=True    # bỏ khoảng lặng
            )

            text = " ".join(seg.text.strip() for seg in segments)

            return text.strip()

        except Exception:
            print("❌ Transcript error:")
            print(traceback.format_exc())
            return ""