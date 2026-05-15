"""
SCRIPT RESTORE DỮ LIỆU TEST TỪ BACKUP
======================================

Restore lại data từ các file JSON backup

Usage:
    python backend/scripts/restore_test_data.py

    Hoặc restore 1 collection cụ thể:
    python backend/scripts/restore_test_data.py --collection payments --file payments_20260515_143022.json
"""

import sys
import os
import json
import argparse
from pathlib import Path
from datetime import datetime

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.mongodb import db
from bson import ObjectId


def convert_ids(obj):
    """Convert string IDs back to ObjectId"""
    if isinstance(obj, dict):
        result = {}
        for key, value in obj.items():
            if key == "_id" or key.endswith("_id"):
                # Convert string to ObjectId if valid
                if isinstance(value, str) and len(value) == 24:
                    try:
                        result[key] = ObjectId(value)
                    except:
                        result[key] = value
                else:
                    result[key] = value
            elif isinstance(value, dict):
                result[key] = convert_ids(value)
            elif isinstance(value, list):
                result[key] = [convert_ids(item) if isinstance(item, dict) else item for item in value]
            else:
                result[key] = value
        return result
    return obj


def restore_collection(collection_name, backup_file):
    """Restore 1 collection từ backup file"""
    print(f"\n📥 Restoring {collection_name} from {backup_file}...")

    if not backup_file.exists():
        print(f"   ❌ File not found: {backup_file}")
        return 0

    with open(backup_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if not data:
        print(f"   ⚠️  No data in backup file")
        return 0

    # Convert string IDs back to ObjectId
    converted_data = [convert_ids(doc) for doc in data]

    collection = db[collection_name]

    # Insert documents
    result = collection.insert_many(converted_data)
    count = len(result.inserted_ids)

    print(f"   ✅ Restored {count} documents")
    return count


def list_backups(backup_dir):
    """List tất cả backup files theo timestamp"""
    backups = {}

    for file in backup_dir.glob("*.json"):
        # Extract timestamp from filename: payments_20260515_143022.json
        parts = file.stem.split('_')
        if len(parts) >= 3:
            collection = parts[0]
            timestamp = '_'.join(parts[1:])

            if timestamp not in backups:
                backups[timestamp] = []

            backups[timestamp].append({
                'collection': collection,
                'file': file
            })

    return backups


def restore_by_timestamp(backup_dir, timestamp):
    """Restore tất cả collections của 1 timestamp"""
    print(f"\n🔄 Restoring backup from {timestamp}...")

    pattern = f"*_{timestamp}.json"
    files = list(backup_dir.glob(pattern))

    if not files:
        print(f"❌ No backup files found for timestamp: {timestamp}")
        return

    total = 0
    for file in sorted(files):
        collection = file.stem.rsplit('_', 2)[0]
        count = restore_collection(collection, file)
        total += count

    print(f"\n✅ Total restored: {total} documents")


def main():
    parser = argparse.ArgumentParser(description="Restore test data from backup")
    parser.add_argument('--collection', help='Collection name to restore')
    parser.add_argument('--file', help='Specific backup file to restore')
    parser.add_argument('--timestamp', help='Restore all collections from specific timestamp')
    parser.add_argument('--list', action='store_true', help='List available backups')

    args = parser.parse_args()

    backup_dir = Path("backend/backups")

    if not backup_dir.exists():
        print("❌ No backup directory found!")
        return

    # List backups
    if args.list:
        print("\n📦 Available backups:\n")
        backups = list_backups(backup_dir)

        if not backups:
            print("⚠️  No backups found")
            return

        for timestamp, files in sorted(backups.items(), reverse=True):
            print(f"📅 {timestamp}")
            for item in files:
                print(f"   - {item['collection']:<20} ({item['file'].name})")
            print()

        print("💡 To restore, use:")
        print(f"   python backend/scripts/restore_test_data.py --timestamp {list(backups.keys())[0]}")
        return

    # Restore specific collection
    if args.collection and args.file:
        file_path = backup_dir / args.file
        restore_collection(args.collection, file_path)
        return

    # Restore by timestamp
    if args.timestamp:
        restore_by_timestamp(backup_dir, args.timestamp)
        return

    # Interactive mode
    print("\n" + "="*60)
    print("📥 RESTORE TEST DATA")
    print("="*60)

    backups = list_backups(backup_dir)

    if not backups:
        print("\n⚠️  No backups found!")
        print(f"Backup directory: {backup_dir.absolute()}")
        return

    print("\n📦 Available backup timestamps:\n")
    timestamps = sorted(backups.keys(), reverse=True)

    for i, timestamp in enumerate(timestamps, 1):
        count = len(backups[timestamp])
        print(f"  {i}. {timestamp} ({count} collections)")

    print("\n" + "⚠️ "*20)
    print("⚠️  WARNING: Restore sẽ INSERT data mới vào DB")
    print("⚠️  Nếu data đã tồn tại, có thể bị DUPLICATE!")
    print("⚠️ "*20)

    choice = input("\nChọn backup number (hoặc Enter để cancel): ").strip()

    if not choice.isdigit() or int(choice) < 1 or int(choice) > len(timestamps):
        print("\n❌ Cancelled")
        return

    selected_timestamp = timestamps[int(choice) - 1]

    confirm = input(f"\nRestore backup {selected_timestamp}? (yes/no): ").strip().lower()

    if confirm != 'yes':
        print("\n❌ Cancelled")
        return

    restore_by_timestamp(backup_dir, selected_timestamp)


if __name__ == "__main__":
    main()
