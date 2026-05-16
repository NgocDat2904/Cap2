"""
test_timeline.py
================
Test hàm build_timeline_from_segments từ timeline_service.py
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.modules.ai.timeline_service import build_timeline_from_segments


def _print_timeline(label: str, timeline: list):
    print(f"\n{'='*50}")
    print(f"  {label}")
    print(f"{'='*50}")
    for entry in timeline:
        print(f"  [{entry['time']}] ({entry['seconds']:>5}s)  {entry['label']}")
    print(f"  → Tổng: {len(timeline)} chapters")


def test_normal_video():
    """Video bình thường, có gap rõ ràng giữa các phần."""
    segments = [
        {"start": 0.5,   "end": 5.2,   "text": "Xin chào các bạn, chào mừng đến với khóa học React."},
        {"start": 5.3,   "end": 10.1,  "text": "Hôm nay chúng ta sẽ tìm hiểu về React Hook."},
        {"start": 65.0,  "end": 70.0,  "text": "Phần đầu tiên là useState, nó giúp lưu trạng thái."},
        {"start": 71.0,  "end": 78.0,  "text": "Ví dụ về useState: const [count, setCount] = useState(0)."},
        {"start": 130.5, "end": 140.0, "text": "Tiếp theo là useEffect, dùng để gọi API hoặc side effect."},
        {"start": 141.0, "end": 150.0, "text": "useEffect chạy sau mỗi lần render, hoặc khi dependency thay đổi."},
        {"start": 220.0, "end": 230.0, "text": "useCallback và useMemo giúp tối ưu hiệu năng."},
        {"start": 231.0, "end": 240.0, "text": "Kết luận: React Hook giúp code gọn hơn, dễ đọc hơn."},
    ]
    result = build_timeline_from_segments(segments)
    _print_timeline("TEST 1 - Video bình thường", result)
    assert len(result) >= 1
    assert result[0]["seconds"] == 0 or result[0]["time"] == "00:00"
    assert all("time" in e and "seconds" in e and "label" in e for e in result)
    print("  ✅ PASS")


def test_no_gap_video():
    """Video liên tục không có gap lớn → ít chapter."""
    segments = [
        {"start": 0.0, "end": 4.0,  "text": "Bắt đầu bài học."},
        {"start": 4.1, "end": 8.0,  "text": "Nội dung tiếp theo."},
        {"start": 8.2, "end": 12.0, "text": "Phần thứ ba."},
        {"start": 12.1,"end": 16.0, "text": "Và phần cuối."},
    ]
    result = build_timeline_from_segments(segments)
    _print_timeline("TEST 2 - Video liên tục không có gap", result)
    assert len(result) >= 1
    print("  ✅ PASS")


def test_empty_segments():
    """Segments rỗng → fallback entry."""
    result = build_timeline_from_segments([])
    _print_timeline("TEST 3 - Segments rỗng", result)
    assert len(result) == 1
    assert result[0]["seconds"] == 0
    print("  ✅ PASS")


def test_many_segments():
    """Video rất nhiều segments → không vượt max_chapters."""
    import random
    random.seed(42)
    segs = []
    t = 0.0
    for i in range(100):
        duration = random.uniform(3, 8)
        gap = random.uniform(0, 30)
        segs.append({"start": round(t, 1), "end": round(t + duration, 1), "text": f"Nội dung segment {i+1}."})
        t += duration + gap

    result = build_timeline_from_segments(segs, max_chapters=20)
    _print_timeline("TEST 4 - Nhiều segments (100 → max 20 chapters)", result)
    assert len(result) <= 20
    assert len(result) >= 1
    print("  ✅ PASS")


def test_long_text_truncated():
    """Label dài phải được cắt ngắn."""
    segments = [
        {"start": 0.0, "end": 5.0, "text": "Đây là một đoạn văn bản rất rất rất rất rất rất rất rất rất rất dài, dùng để kiểm tra việc cắt ngắn label."},
    ]
    result = build_timeline_from_segments(segments)
    _print_timeline("TEST 5 - Label dài bị cắt", result)
    for entry in result:
        assert len(entry["label"]) <= 65, f"Label quá dài: {entry['label']}"
    print("  ✅ PASS")


def test_seconds_accuracy():
    """Kiểm tra seconds khớp với time string."""
    segments = [
        {"start": 0.0,   "end": 10.0, "text": "Phần 1."},
        {"start": 90.7,  "end": 100.0,"text": "Phần 2."},
        {"start": 185.3, "end": 200.0,"text": "Phần 3."},
    ]
    result = build_timeline_from_segments(segments, min_gap_sec=5.0, min_chapter_sec=5.0)
    _print_timeline("TEST 6 - Kiểm tra seconds chính xác", result)
    for entry in result:
        m, s = map(int, entry["time"].split(":"))
        expected_sec = m * 60 + s
        assert entry["seconds"] == expected_sec, (
            f"Mismatch: time={entry['time']} nhưng seconds={entry['seconds']} (expected {expected_sec})"
        )
    print("  PASS")


if __name__ == "__main__":
    print("\nChay test timeline_service...\n")
    test_normal_video()
    test_no_gap_video()
    test_empty_segments()
    test_many_segments()
    test_long_text_truncated()
    test_seconds_accuracy()
    print("\nTat ca tests PASS!\n")
