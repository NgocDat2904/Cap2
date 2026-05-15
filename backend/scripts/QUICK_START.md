# 🚀 QUICK START - RESET TEST DATA

## TL;DR

```bash
# 1. Xem stats hiện tại
python backend/scripts/quick_stats.py

# 2. Reset toàn bộ (tự động backup)
python backend/scripts/reset_test_data.py

# 3. Xem stats sau reset
python backend/scripts/quick_stats.py

# 4. (Optional) Restore lại nếu cần
python backend/scripts/restore_test_data.py --list
python backend/scripts/restore_test_data.py --timestamp <timestamp>
```

---

## 📝 Workflow thông thường

### Scenario 1: Reset để test lại từ đầu

```bash
# Step 1: Check hiện tại
python backend/scripts/quick_stats.py
# Output: 125 payments, 87 enrollments, ...

# Step 2: Reset
python backend/scripts/reset_test_data.py
# Gõ "YES" để confirm

# Step 3: Verify
python backend/scripts/quick_stats.py
# Output: 0 payments, 0 enrollments, ... ✅

# Step 4: Test lại tính năng
# - Đăng ký khóa học
# - Thanh toán VNPay
# - Xem video, làm bài tập
# - Check notifications, Q&A
```

### Scenario 2: Backup trước khi merge code mới

```bash
# Trước khi pull code từ main
python backend/scripts/reset_test_data.py
# Chọn NO → Chỉ backup, không xóa

# Hoặc chỉ xem stats
python backend/scripts/quick_stats.py
```

### Scenario 3: Restore data cũ

```bash
# List backups
python backend/scripts/restore_test_data.py --list

# Restore 1 backup cụ thể
python backend/scripts/restore_test_data.py --timestamp 20260515_143022
```

---

## ⚠️ WARNINGS

1. **KHÔNG CHẠY TRÊN PRODUCTION** ❌
2. Backup files **KHÔNG COMMIT LÊN GIT** (đã có trong .gitignore)
3. Restore sẽ **INSERT** data → có thể bị duplicate nếu chưa reset trước

---

## 🐛 Troubleshooting

### Lỗi: "No module named 'app'"
```bash
# Phải chạy từ project root
cd /path/to/Cap2
python backend/scripts/...
```

### Lỗi: MongoDB connection
```bash
# Check MongoDB đang chạy
mongosh

# Check .env
cat backend/.env | grep MONGO
```

### Không thấy backups/
```bash
# Thư mục tự động tạo khi chạy reset lần đầu
# Hoặc tạo manual:
mkdir -p backend/backups
```

---

## 📞 Help

Đọc full docs: `backend/scripts/README_RESET.md`

---

**Let's test! 🧪**
