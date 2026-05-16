import os
import sys

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from bson import ObjectId
from app.database.mongodb import db
from app.modules.ai.timeline_service import build_timeline_from_segments
from app.modules.ai.gemini_service import enhance_timeline_labels_sync
from app.modules.ai.timeline_service import strip_raw_text

def main():
    vid_str = "6a07f9cb7db8bc336252208c"
    print(f"Connecting to DB to fix video {vid_str}...", flush=True)
    v = db.videos.find_one({"_id": ObjectId(vid_str)})
    
    if not v:
        print("Video not found!")
        return
        
    segs = v.get("transcript_segments", [])
    if not segs:
        print("No transcript segments found!")
        return
        
    print(f"Found {len(segs)} segments. Rebuilding timeline...", flush=True)
    timeline_raw = build_timeline_from_segments(segs, include_raw=True)
    
    print(f"Generated {len(timeline_raw)} chapters from segments. Enhancing with AI...", flush=True)
    try:
        timeline_items = enhance_timeline_labels_sync(timeline_raw, language="vi")
    except Exception as e:
        print("Enhance error:", e, flush=True)
        timeline_items = strip_raw_text(timeline_raw)
        
    db.videos.update_one(
        {"_id": v["_id"]},
        {"$set": {"ai_cache.timeline.vi": timeline_items}}
    )
    
    print(f"Updated DB successfully with {len(timeline_items)} chapters!")

if __name__ == "__main__":
    main()
