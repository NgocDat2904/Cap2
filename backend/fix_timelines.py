import os
import sys

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.mongodb import db
from app.modules.ai.timeline_service import build_timeline_from_segments
from app.modules.ai.gemini_service import enhance_timeline_labels_sync
from app.modules.ai.timeline_service import strip_raw_text

def main():
    print("Connecting to DB...", flush=True)
    videos = list(db.videos.find({"transcript_segments": {"$exists": True}}))
    count = 0
    print(f"Found {len(videos)} videos with transcript_segments", flush=True)
    for v in videos:
        cached = v.get("ai_cache", {}).get("timeline", {}).get("vi", [])
        segs = v.get("transcript_segments", [])
        last_seg_end = segs[-1]["end"] if segs else 0
        last_cache_time = cached[-1]["seconds"] if cached else 0
        vid = str(v.get("_id"))
        print(f"Video {vid}: last_seg_end={last_seg_end:.1f}s, last_cache={last_cache_time}s, num_cached={len(cached)}", flush=True)
        
        if last_cache_time > last_seg_end + 30 or True:
            print(f"  -> Rebuilding timeline for {vid}...", flush=True)
            timeline_raw = build_timeline_from_segments(segs, include_raw=True)
            try:
                timeline_items = enhance_timeline_labels_sync(timeline_raw, language="vi")
            except Exception as e:
                print("  -> Enhance error:", e, flush=True)
                timeline_items = strip_raw_text(timeline_raw)
                
            db.videos.update_one(
                {"_id": v["_id"]},
                {"$set": {"ai_cache.timeline.vi": timeline_items}}
            )
            count += 1
            print("  -> Updated DB", flush=True)
            
    print(f"Done updating {count} videos.", flush=True)

if __name__ == "__main__":
    main()
