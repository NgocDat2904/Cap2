import os
import shutil
import subprocess
import tempfile
import urllib.request
from typing import Any, Dict, List, Tuple

from faster_whisper import WhisperModel


_MODEL: WhisperModel | None = None


def _get_model() -> WhisperModel:
    global _MODEL
    if _MODEL is None:
        model_name = os.getenv("WHISPER_MODEL", "turbo").strip() or "turbo"
        compute_type = os.getenv("WHISPER_COMPUTE_TYPE", "int8").strip() or "int8"
        _MODEL = WhisperModel(
            model_name,
            device="cpu",
            compute_type=compute_type,
        )
    return _MODEL


def _ensure_ffmpeg() -> None:
    if shutil.which("ffmpeg"):
        return
    raise RuntimeError("ffmpeg chưa được cài hoặc chưa có trong PATH")


def _download_file(url: str, out_path: str) -> None:
    try:
        with urllib.request.urlopen(url) as resp, open(out_path, "wb") as f:
            f.write(resp.read())
    except Exception as e:
        raise RuntimeError(f"Không tải được video/audio từ URL: {e}") from e


def _extract_audio(video_path: str, audio_path: str) -> None:
    _ensure_ffmpeg()
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        video_path,
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-f",
        "wav",
        audio_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        err = (result.stderr or "").strip()
        raise RuntimeError(f"ffmpeg tách audio thất bại: {err[:300]}")


def transcribe_from_video_url(video_url: str, language: str = "vi") -> Tuple[str, List[Dict[str, Any]]]:
    if not video_url:
        raise RuntimeError("video_url trống, không thể tạo transcript")

    with tempfile.TemporaryDirectory(prefix="edusync-stt-") as tmp_dir:
        video_path = os.path.join(tmp_dir, "input_video")
        audio_path = os.path.join(tmp_dir, "audio.wav")

        _download_file(video_url, video_path)
        _extract_audio(video_path, audio_path)

        model = _get_model()
        segments, _info = model.transcribe(
            audio_path,
            language=language or "vi",
            vad_filter=True,
            beam_size=1,
        )

        text_parts: List[str] = []
        seg_items: List[Dict[str, Any]] = []
        for seg in segments:
            chunk = (seg.text or "").strip()
            if not chunk:
                continue
            text_parts.append(chunk)
            seg_items.append(
                {
                    "start": round(float(seg.start), 2),
                    "end": round(float(seg.end), 2),
                    "text": chunk,
                }
            )

        transcript = " ".join(text_parts).strip()
        if not transcript:
            raise RuntimeError("Không nhận diện được nội dung giọng nói")

        return transcript, seg_items
