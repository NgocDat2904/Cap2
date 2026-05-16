"""
timeline_service.py
====================
Tạo timeline (chapters) từ transcript_segments của Whisper STT.

Không dùng AI — timestamps lấy trực tiếp từ Whisper → chính xác 100%.
"""

from typing import Any, Dict, List


def _seconds_to_mmss(seconds: float) -> str:
    """Chuyển số giây sang format MM:SS."""
    total = int(round(seconds))
    m = total // 60
    s = total % 60
    return f"{m:02d}:{s:02d}"


def _truncate_label(text: str, max_len: int = 60) -> str:
    """Cắt ngắn label, thêm '…' nếu quá dài."""
    text = text.strip()
    if len(text) <= max_len:
        return text
    # cắt tại khoảng trắng gần nhất
    cut = text[:max_len].rsplit(" ", 1)[0]
    return cut.rstrip(".,;:!?") + "…"


def build_timeline_from_segments(
    segments: List[Dict[str, Any]],
    min_gap_sec: float = 15.0,
    max_chapters: int = 20,
    min_chapter_sec: float = 8.0,
    ideal_chapter_sec: float = 90.0,
    include_raw: bool = False,
) -> List[Dict[str, Any]]:
    """
    Nhóm các transcript segments thành chapters để làm timeline.

    Args:
        segments:         List[{"start": float, "end": float, "text": str}]
        min_gap_sec:      Khoảng nghỉ tối thiểu (giây) để tách chapter mới
        max_chapters:     Số chapter tối đa trả về
        min_chapter_sec:  Thời gian tối thiểu mỗi chapter (giây)
        ideal_chapter_sec: Thời gian lý tưởng mỗi chapter, ép cắt nếu vượt quá (giây)
        include_raw:      Nếu True, mỗi item có thêm field "_raw_text"
                          (dùng nội bộ cho AI enhance, không lưu DB)

    Returns:
        List[{"time": "MM:SS", "seconds": int, "label": str}]
    """
    if not segments:
        return [{"time": "00:00", "seconds": 0, "label": "Bắt đầu"}]

    # ---------- bước 1: lọc segment hợp lệ ----------
    valid = [
        s for s in segments
        if isinstance(s.get("start"), (int, float))
        and isinstance(s.get("text"), str)
        and s["text"].strip()
    ]
    if not valid:
        return [{"time": "00:00", "seconds": 0, "label": "Bắt đầu"}]

    # sắp xếp theo start time
    valid = sorted(valid, key=lambda s: s["start"])

    # ---------- bước 2: nhóm segments thành blocks ----------
    blocks: List[List[Dict]] = []
    current_block: List[Dict] = [valid[0]]

    for i in range(1, len(valid)):
        prev = valid[i - 1]
        curr = valid[i]

        gap = curr["start"] - prev.get("end", prev["start"])
        block_duration = curr["start"] - current_block[0]["start"]

        should_split = False
        
        # 1. Giảm gap xuống 3.0s nếu block_duration > 30s
        if gap >= 3.0 and block_duration >= 30.0:
            should_split = True
        # 2. Hoặc nếu gap >= min_gap_sec (15.0) và đủ độ dài tối thiểu
        elif gap >= min_gap_sec and block_duration >= min_chapter_sec:
            should_split = True
        # 3. Ép cắt nếu chapter đã vượt quá thời gian lý tưởng (90s)
        elif block_duration >= ideal_chapter_sec:
            should_split = True

        if should_split:
            blocks.append(current_block)
            current_block = [curr]
        else:
            current_block.append(curr)

    blocks.append(current_block)  # block cuối

    # ---------- bước 3: nếu quá nhiều chapter, merge bớt ----------
    if len(blocks) > max_chapters:
        blocks = _merge_blocks(blocks, max_chapters)

    # ---------- bước 4: build timeline entries ----------
    timeline: List[Dict[str, Any]] = []

    # thêm entry 00:00 nếu segment đầu không bắt đầu từ đầu
    first_start = valid[0]["start"]
    force_zero = first_start > 2.0  # nếu video bắt đầu sau 2s thì vẫn thêm 00:00

    if force_zero:
        timeline.append({
            "time": "00:00",
            "seconds": 0,
            "label": "Bắt đầu",
        })

    for block in blocks:
        start_sec = block[0]["start"]

        # tránh duplicate với entry 00:00 đã thêm
        if force_zero and int(round(start_sec)) == 0:
            continue

        raw_text = " ".join(s["text"].strip() for s in block)
        entry: Dict[str, Any] = {
            "time": _seconds_to_mmss(start_sec),
            "seconds": int(round(start_sec)),
            "label": _truncate_label(raw_text),
        }
        if include_raw:
            entry["_raw_text"] = raw_text[:300]  # giới hạn chiều dài gửi AI
        timeline.append(entry)

    # đảm bảo luôn có ít nhất 1 entry
    if not timeline:
        entry = {
            "time": "00:00",
            "seconds": 0,
            "label": _truncate_label(valid[0]["text"]) if valid else "Bắt đầu",
        }
        if include_raw:
            entry["_raw_text"] = (valid[0]["text"] if valid else "Bắt đầu")[:300]
        timeline.append(entry)

    # giới hạn max_chapters (tính cả entry 00:00 thêm vào)
    timeline = timeline[:max_chapters]

    return timeline


def strip_raw_text(timeline: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Xóa field _raw_text trước khi lưu DB."""
    return [{k: v for k, v in item.items() if k != "_raw_text"} for item in timeline]


def _merge_blocks(
    blocks: List[List[Dict]],
    target: int,
) -> List[List[Dict]]:
    """
    Merge các block liền kề cho đến khi còn đúng `target` blocks.
    Merge block ngắn nhất với block kề trước.
    """
    blocks = [list(b) for b in blocks]  # deep copy

    while len(blocks) > target:
        # tìm block ngắn nhất (theo số giây)
        min_dur = float("inf")
        min_idx = 1  # không merge block đầu tiên
        for i in range(1, len(blocks)):
            dur = blocks[i][-1].get("end", blocks[i][-1]["start"]) - blocks[i][0]["start"]
            if dur < min_dur:
                min_dur = dur
                min_idx = i

        # merge vào block trước
        blocks[min_idx - 1].extend(blocks[min_idx])
        blocks.pop(min_idx)

    return blocks
