# 🔍 DIAGNOSIS: Tại sao xóa video trên web nhưng database không mất?

## ✅ KIỂM TRA ĐÃ THỰC HIỆN:

### 1. Backend Endpoint
```bash
✅ DELETE endpoint có trong video_controller.py (line 61)
   @router.delete("/instructor/videos/{video_id}")

✅ Video router đã được register trong main.py (line 69)
   app.include_router(video_router, prefix="")

✅ Service method delete_video() đã implement (line 512 video_service.py)
```

### 2. Frontend API
```bash
✅ deleteVideoAPI() function có trong adminCourseAPI.js (line 208)

✅ Function đã được import vào EditCourse.jsx
   import { deleteVideoAPI } from "../../services/adminCourseAPI"

✅ removeVideo() gọi deleteVideoAPI() (line 188 EditCourse.jsx)
   await deleteVideoAPI(videoId, token);
```

---

## ❓ VẬY TẠI SAO VIDEO KHÔNG BỊ XÓA?

### 🔍 GỢI Ý DEBUG:

#### A. BACKEND SERVER CHƯA RESTART
```bash
❌ Backend đã sửa code nhưng chưa restart server
   → Endpoint mới chưa được load

✅ FIX:
   1. Stop backend: Ctrl+C
   2. Restart: python -m uvicorn app.main:app --reload
   3. Thử xóa lại
```

#### B. TOKEN AUTHENTICATION FAILED
```bash
❌ Token hết hạn hoặc không hợp lệ
   → Backend return 401/403 nhưng frontend không log rõ

✅ CHECK:
   1. Mở Browser DevTools (F12)
   2. Tab Network
   3. Xóa video → Check request
   4. Response code: 401/403 → Token issue
```

#### C. VIDEO ID KHÔNG ĐÚNG
```bash
❌ Frontend gửi ID không đúng format
   → Backend không tìm thấy video

✅ CHECK:
   1. Console.log videoId trước khi gọi API
   2. Check ID có đúng là MongoDB ObjectId? (24 hex chars)
   3. Video có tồn tại trong DB không?
```

#### D. BACKEND THROW EXCEPTION NHƯNG KHÔNG LOG
```bash
❌ Code có lỗi trong delete_video() service
   → Exception bị catch nhưng không xóa được

✅ CHECK Backend logs:
   - Permission check failed?
   - MongoDB connection issue?
   - ObjectId invalid?
```

---

## 🧪 TESTING STEPS:

### Step 1: Check Backend Server Running
```bash
# Backend phải đang chạy
curl http://localhost:8000/docs

# Nếu không response → Start backend
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 2: Test DELETE Endpoint Trực Tiếp
```bash
# Lấy 1 video ID từ database
# Gọi API trực tiếp bằng curl

curl -X DELETE "http://localhost:8000/instructor/videos/6a0554c4f984db573959ec12" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Expected response:
# {"message": "Video deleted successfully", "video_id": "..."}

# Nếu 401/403 → Token issue
# Nếu 404 → Video không tồn tại hoặc ID sai
# Nếu 500 → Backend error
```

### Step 3: Check Frontend Request
```bash
# Mở Browser DevTools (F12)
# Tab: Network
# Xóa video
# Check request:

DELETE http://localhost:8000/instructor/videos/{id}

Headers:
  Authorization: Bearer xxx...

Response:
  - 200 OK → Success (nhưng vẫn chưa xóa? → Check Step 4)
  - 404 → Endpoint không tồn tại hoặc ID sai
  - 401/403 → Token expired/invalid
  - 500 → Backend error
```

### Step 4: Check Database Thực Tế
```bash
# Connect MongoDB
mongosh

use edusync  # hoặc tên DB của bạn

# Check video trước khi xóa
db.videos.findOne({_id: ObjectId("6a0554c4f984db573959ec12")})

# Xóa từ frontend

# Check lại
db.videos.findOne({_id: ObjectId("6a0554c4f984db573959ec12")})

# Nếu vẫn còn → Backend không xóa được
```

---

## 🔥 MOST LIKELY CAUSES (Theo thứ tự khả năng):

### 1. ⭐⭐⭐⭐⭐ Backend Server Chưa Restart (90%)
```
Bạn vừa sửa code backend nhưng quên restart server
→ Code mới chưa được load
→ Endpoint DELETE vẫn chưa có

FIX: Restart backend server
```

### 2. ⭐⭐⭐⭐ Token Expired (70%)
```
Admin token hết hạn
→ Backend return 401/403
→ Frontend catch error nhưng vẫn xóa khỏi UI

FIX: Logout → Login lại
```

### 3. ⭐⭐⭐ Video ID Không Hợp Lệ (50%)
```
ID trong uploadedVideos không phải là video ID thực
→ Backend không tìm thấy video với ID đó
→ Return 404

FIX: Console.log videoId để check
```

### 4. ⭐⭐ Permission Check Failed (30%)
```
Admin role không được phép xóa video
→ Backend return 403

FIX: Check backend logs
```

### 5. ⭐ CORS/Network Issue (10%)
```
Browser block request
→ Request không đến backend

FIX: Check browser console for CORS errors
```

---

## 🎯 QUICK FIX CHECKLIST:

```bash
□ Backend server đang chạy?
□ Backend đã restart sau khi sửa code?
□ Browser không có lỗi CORS?
□ Token còn hạn? (Logout → Login lại)
□ Video ID đúng format? (24 hex chars)
□ Network tab có request DELETE video?
□ Response code là gì? (200/404/401/403/500)
□ Backend logs có error không?
□ Video còn trong database sau khi xóa?
```

---

## 🧪 DEBUG SCRIPT:

### Check Video Còn Trong DB Không:
```bash
python backend/scripts/debug_delete_video.py <video_id>
```

### List All Videos In Course:
```bash
python backend/scripts/debug_delete_video.py --course <course_id>
```

---

## 📝 NEXT STEPS:

1. **RESTART BACKEND SERVER** ← Làm điều này trước tiên!
   ```bash
   cd backend
   # Stop (Ctrl+C)
   python -m uvicorn app.main:app --reload
   ```

2. **Clear Browser Cache & Logout/Login**
   ```bash
   F12 → Application → Clear Storage → Clear site data
   Logout → Login lại
   ```

3. **Test Xóa Video Lại**
   - Mở DevTools Network tab
   - Xóa 1 video
   - Check request & response

4. **Check Database**
   ```bash
   mongosh
   use edusync
   db.videos.find().count()  # Before
   # Xóa video
   db.videos.find().count()  # After (phải giảm đi 1)
   ```

5. **Nếu vẫn không được → Check Backend Logs**
   ```bash
   # Terminal đang chạy backend sẽ có logs
   # Tìm error messages
   ```

---

## 💡 TIP:

**Cách nhanh nhất để verify:**

```bash
# Terminal 1: Backend logs
cd backend
python -m uvicorn app.main:app --reload

# Terminal 2: Watch MongoDB
mongosh
use edusync
db.videos.watch()  # Real-time log changes

# Browser: Xóa video
# → Terminal 2 sẽ show nếu video bị xóa
```

---

**GHI CHÚ:** Nếu sau khi restart backend mà vẫn không xóa được, chạy script debug và report kết quả:

```bash
python backend/scripts/debug_delete_video.py <video_id_bị_lỗi>
```
