# 🧪 RESET & RESTORE TEST DATA

## 📋 Tổng quan

Scripts để reset dữ liệu test về trạng thái ban đầu. **CHỈ DÙNG CHO MÔI TRƯỜNG TEST/DEV.**

---

## 🗑️ RESET DATA

### Script: `reset_test_data.py`

**Xóa gì:**
- ❌ Payments (lịch sử thanh toán)
- ❌ Enrollments (đăng ký khóa học)
- ❌ Lesson Progress (tiến độ học)
- ❌ Video Views (lượt xem)
- ❌ Notifications (thông báo)
- ❌ Questions/Replies (Q&A)
- ❌ Reset video view count về 0

**Giữ nguyên:**
- ✅ Users (tài khoản)
- ✅ Courses (khóa học)
- ✅ Lessons (bài học)
- ✅ Videos (video content)

### Cách dùng:

```bash
# Chạy từ project root
python backend/scripts/reset_test_data.py
```

### Output:

1. **Backup:** Tự động backup tất cả data vào `backend/backups/`
2. **Delete:** Xóa các collection đã chọn
3. **Report:** In báo cáo chi tiết

### Ví dụ output:

```
📦 BACKUP:
   - Payments:        125 documents
   - Enrollments:      87 documents
   - Lesson Progress: 456 documents
   ...

🗑️  DELETED:
   - Payments:        125 records
   - Enrollments:      87 records
   ...

✅ PRESERVED:
   - Users:            50 users
   - Courses:          15 courses
   - Lessons:         120 lessons
   - Videos:          250 videos
```

---

## 📥 RESTORE DATA

### Script: `restore_test_data.py`

Restore lại data từ backup files.

### Cách dùng:

#### 1. List các backup có sẵn:

```bash
python backend/scripts/restore_test_data.py --list
```

Output:
```
📦 Available backups:

📅 20260515_143022
   - payments              (payments_20260515_143022.json)
   - enrollments           (enrollments_20260515_143022.json)
   - lesson_progress       (lesson_progress_20260515_143022.json)
   ...
```

#### 2. Restore toàn bộ từ 1 timestamp:

```bash
python backend/scripts/restore_test_data.py --timestamp 20260515_143022
```

#### 3. Restore 1 collection cụ thể:

```bash
python backend/scripts/restore_test_data.py \
  --collection payments \
  --file payments_20260515_143022.json
```

#### 4. Interactive mode:

```bash
python backend/scripts/restore_test_data.py
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 🚨 PRODUCTION
**KHÔNG BAO GIỜ** chạy scripts này trên production database!

### 🔄 Restore behavior
Restore sẽ **INSERT** data mới vào DB. Nếu data đã tồn tại → **DUPLICATE**.

**Best practice:**
1. Reset trước (xóa data cũ)
2. Restore sau (insert data mới)

### 📁 Backup location
```
backend/backups/
├── payments_20260515_143022.json
├── enrollments_20260515_143022.json
├── lesson_progress_20260515_143022.json
├── video_views_20260515_143022.json
├── notifications_20260515_143022.json
└── questions_20260515_143022.json
```

---

## 📝 Use Cases

### Case 1: Reset toàn bộ để test từ đầu

```bash
# Bước 1: Reset (tự động backup)
python backend/scripts/reset_test_data.py

# Bước 2: Test lại tính năng từ đầu
# - Đăng ký khóa học
# - Thanh toán
# - Học bài
# ...
```

### Case 2: Backup trước khi test tính năng mới

```bash
# Backup hiện tại
python backend/scripts/reset_test_data.py
# Chọn NO khi confirm xóa → Chỉ backup không xóa

# Hoặc dùng mongodump
mongodump --db edusync --out backup_before_feature_X
```

### Case 3: Restore lại trạng thái cũ

```bash
# List backups
python backend/scripts/restore_test_data.py --list

# Restore timestamp cụ thể
python backend/scripts/restore_test_data.py --timestamp 20260515_143022
```

---

## 🛠️ Troubleshooting

### Lỗi: "No module named 'app'"

```bash
# Đảm bảo chạy từ project root
cd /path/to/Cap2
python backend/scripts/reset_test_data.py
```

### Lỗi: "Connection refused" (MongoDB)

```bash
# Kiểm tra MongoDB đang chạy
mongosh

# Hoặc check trong .env
cat backend/.env | grep MONGO
```

### Lỗi: "Permission denied"

```bash
# Trên Linux/Mac
chmod +x backend/scripts/reset_test_data.py
chmod +x backend/scripts/restore_test_data.py
```

---

## 🔐 Security

⚠️ **KHÔNG COMMIT BACKUP FILES LÊN GIT!**

File `.gitignore` đã có:
```
backend/backups/
*.json
```

Nếu backup chứa data nhạy cảm → **XÓA SAU KHI DÙNG XONG**

---

## 📊 Advanced: Selective Reset

Nếu muốn custom (chỉ xóa 1 số collection):

```python
# Edit reset_test_data.py, comment out các dòng không muốn xóa:

# self.reset_payments()       # ← Comment nếu muốn giữ payments
self.reset_enrollments()
self.reset_lesson_progress()
# self.reset_video_views()    # ← Comment nếu muốn giữ views
self.reset_notifications()
self.reset_questions()
```

---

## 📞 Support

Có vấn đề? Ping team:
- Database issues: @backend-team
- Script bugs: Check `backend/scripts/` source code
- MongoDB queries: `mongosh` để debug manual

---

**Happy Testing! 🚀**
