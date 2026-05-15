# NGHIỆP VỤ XÓA KHÓA HỌC - TRUNG TÂM ĐÀO TẠO ONLINE

## 📋 Context hệ thống

- **Mô hình**: Trung tâm đào tạo online (LMS nội bộ)
- **Instructor**: Nhân viên ăn lương cố định theo hợp đồng
- **Khóa học**: Tài sản của TRUNG TÂM, không phải cá nhân instructor
- **Doanh thu**: Do Admin quản lý, instructor KHÔNG được xem
- **Learner**: Mua khóa học → **Học trọn đời** (lifetime access)
- **Kiểu khóa học**: Self-paced (tự học), không có lịch khai giảng cố định

---

## 🔓 INSTRUCTOR CÓ QUYỀN XÓA - NHƯNG CÓ GIỚI HẠN

### Quy tắc:
- ✅ **Được phép xóa:** DRAFT (Bản nháp), PENDING (Đang chờ duyệt), REJECTED (Bị từ chối)
- ❌ **Không được xóa:** APPROVED (Đã duyệt/công bố)

### Lý do:
1. **DRAFT/PENDING/REJECTED**: Khóa học chưa công bố, chưa có học viên → Instructor có quyền quản lý
2. **Cho phép xóa PENDING**: 
   - Instructor phát hiện lỗi sau khi submit → có thể rút lại để sửa ngay
   - Giống như rút đơn đang chờ duyệt, rút PR chưa merge
   - Tiết kiệm thời gian cho cả instructor và admin
   - PENDING chưa public, chưa có rủi ro
3. **APPROVED**: Khóa học là **tài sản trí tuệ của trung tâm**, không phải cá nhân
4. Giống như giáo viên có thể xóa bản nháp giáo án, nhưng không thể xóa giáo án đã công bố
5. Instructor nghỉ việc → khóa học đã duyệt vẫn thuộc về trung tâm
6. Tránh instructor xóa khóa học đã có học viên
7. Bảo vệ quyền lợi học viên đã mua

### Instructor CÓ QUYỀN:
- ✅ Tạo/chỉnh sửa nội dung (draft)
- ✅ **Xóa** DRAFT, PENDING, REJECTED (khóa chưa được duyệt)
- ✅ Submit để Admin duyệt
- ✅ Request "ngừng giảng dạy" khóa đã duyệt → Admin xét duyệt
- ❌ **KHÔNG** xóa APPROVED trực tiếp

---

## ✅ CHỈ ADMIN MỚI XÓA - CÁC TRƯỜNG HỢP

### 1️⃣ **Soft Delete (Xóa tạm thời)**

**Khi nào:**
- Khóa học mới tạo, **CHƯA có ai mua** (0 giao dịch thành công)
- Khóa draft chưa publish
- Khóa test/demo
- Nội dung sai, cần làm lại từ đầu
- Khóa miễn phí chưa có ai đăng ký

**Điều kiện kỹ thuật:**
```python
successful_payments = 0  # Chưa có giao dịch thành công
enrollments = 0          # Chưa có học viên (hoặc rất ít nếu free)
```

**Hành động:**
```python
is_deleted = True        # Ẩn khỏi tất cả danh sách
deleted_at = datetime.utcnow()
deleted_by = admin_id
```

**Ví dụ:**
> "Instructor tạo khóa 'Python cơ bản' nhưng làm sai nội dung, chưa ai mua. 
> Admin cho phép xóa (soft delete)."

---

### 2️⃣ **Archive (Lưu trữ) - Ngừng bán nhưng giữ cam kết**

**Khi nào:**
- **ĐÃ CÓ NGƯỜI MUA** (dù chỉ 1 người)
- Nội dung lỗi thời (VD: Angular 2015, React 16...)
- Muốn ngừng bán nhưng người đã mua vẫn được học
- Giữ uy tín: "Học trọn đời" như đã hứa
- Instructor nghỉ việc nhưng đã có học viên

**Điều kiện kỹ thuật:**
```python
successful_payments > 0  # ĐÃ CÓ NGƯỜI MUA
```

**Hành động:**
```python
is_archived = True
archived_at = datetime.utcnow()
archived_by = admin_id
archived_reason = "Ngừng kinh doanh - Giữ cam kết khách hàng cũ"

# Kết quả:
# → Ẩn khỏi marketplace (trang chủ, danh sách khóa học)
# → Người đã mua VẪN truy cập và học đầy đủ
# → Không bán cho người mới
```

**Ví dụ:**
> "Khóa 'Angular 2015' đã có 50 người mua (50 giao dịch thành công).
> Trung tâm làm khóa Angular 17 mới.
> → Admin Archive khóa cũ
> → 50 người vẫn học được trọn đời
> → Không bán nữa cho khách mới"

---

### 3️⃣ **Suspend/Block (Khóa khóa học)**

**Khi nào:**
- Vi phạm bản quyền
- Nội dung sai phạm pháp luật
- Chất lượng kém, nhiều khiếu nại
- Cần điều tra

**Hành động:**
```python
status = "BLOCKED"
# → Ẩn ngay lập tức
# → Học viên đã mua KHÔNG truy cập được (tạm thời)
# → Có thể hoàn tiền
# → Admin có thể restore sau khi sửa
```

**Ví dụ:**
> "Khóa học vi phạm bản quyền hình ảnh.
> → Admin Block ngay
> → Thông báo cho học viên
> → Instructor sửa nội dung
> → Admin duyệt lại → Unblock"

---

### 4️⃣ **Hard Delete (Xóa vĩnh viễn) - HIẾM KHI**

**CHỈ KHI:**
- Sau **10 năm** theo quy định lưu trữ hóa đơn (luật thuế)
- Yêu cầu pháp lý (GDPR deletion request)
- Khóa test/demo chưa bao giờ có học viên và không có giao dịch

**KHÔNG BAO GIỜ XÓA NẾU:**
- ❌ Đã có 1 giao dịch thanh toán (dù chỉ 1)
- ❌ Trong vòng 10 năm (luật kế toán)
- ❌ Có cam kết với học viên

**Hành động:**
```python
# Xóa HOÀN TOÀN khỏi database
db.courses.delete_one({"_id": course_id})
db.enrollments.delete_many({"course_id": course_id})
db.payments.delete_many({"course_id": course_id})

# ⚠️ CẢNH BÁO: Không thể hoàn tác!
```

---

## 📊 BẢNG QUYẾT ĐỊNH

| Tình huống | Giao dịch | Học viên | Hành động | Lý do |
|---|---|---|---|---|
| Khóa mới, chưa ai mua | 0 | 0 | **Soft Delete** ✅ | Chưa có cam kết |
| Khóa draft chưa publish | 0 | 0 | **Soft Delete** ✅ | Chưa bán |
| Khóa miễn phí, có học viên | 0 | 50 | **Soft Delete** ⚠️ (confirm) | Chưa có doanh thu |
| **Đã có 1 người mua** | **1+** | **1+** | **Archive** ⚠️ | **Giữ cam kết "học trọn đời"** |
| Khóa lỗi thời, 100 người mua | 100 | 100 | **Archive** ⚠️ | 100 người vẫn có quyền học |
| Instructor nghỉ việc | ? | ? | **Không xóa** | Chuyển ownership cho admin |
| Vi phạm bản quyền | ? | ? | **Block** → sửa → Restore | Tạm thời |
| Sau 10 năm, không ai học | ? | ? | **Hard Delete** (có thể) | Quy định lưu trữ |

---

## 🔑 LOGIC KỸ THUẬT CHÍNH XÁC

### Backend Service:

```python
async def delete_course(course_id: str, admin_id: str):
    """
    CHỈ ADMIN MỚI XÓA ĐƯỢC
    """
    
    # ====================================
    # BƯỚC 1: KIỂM TRA GIAO DỊCH
    # ====================================
    successful_payments = db.payments.count_documents({
        "course_id": ObjectId(course_id),
        "status": "success"  # CHỈ ĐẾM GIAO DỊCH THÀNH CÔNG
    })
    
    enrolled_count = db.enrollments.count_documents({
        "course_id": ObjectId(course_id)
    })
    
    # ====================================
    # CASE 1: ĐÃ CÓ NGƯỜI MUA → KHÔNG XÓA
    # ====================================
    if successful_payments > 0:
        raise HTTPException(
            status_code=400,
            detail=(
                f"❌ Không thể xóa khóa học đã có {successful_payments} học viên mua.\n\n"
                f"💡 Vui lòng sử dụng 'Lưu trữ' (Archive):\n"
                f"  • Ngừng bán cho khách mới\n"
                f"  • {successful_payments} học viên đã mua vẫn học được\n"
                f"  • Giữ cam kết 'Học trọn đời'\n\n"
                f"🔧 Hành động: Click nút 'Lưu trữ' thay vì 'Xóa'"
            )
        )
    
    # ====================================
    # CASE 2: CÓ ENROLL FREE → CẢNH BÁO
    # ====================================
    if enrolled_count > 0:
        # Có học viên đăng ký miễn phí
        # Frontend phải confirm:
        # "⚠️ Khóa học có {enrolled_count} học viên (miễn phí). 
        #  Họ sẽ KHÔNG truy cập được sau khi xóa. Xác nhận?"
        pass
    
    # ====================================
    # CASE 3: CHƯA CÓ AI MUA → OK XÓA
    # ====================================
    db.courses.update_one(
        {"_id": ObjectId(course_id)},
        {
            "$set": {
                "is_deleted": True,
                "deleted_at": datetime.utcnow(),
                "deleted_by": ObjectId(admin_id),
                "deletion_reason": "admin_soft_delete"
            }
        }
    )
    
    return {
        "success": True,
        "message": "✅ Khóa học đã được xóa thành công"
    }


async def archive_course(course_id: str, admin_id: str, reason: str):
    """
    Archive: Ngừng bán nhưng người đã mua vẫn học được
    """
    db.courses.update_one(
        {"_id": ObjectId(course_id)},
        {
            "$set": {
                "is_archived": True,
                "archived_at": datetime.utcnow(),
                "archived_by": ObjectId(admin_id),
                "archived_reason": reason
            }
        }
    )
    
    enrolled_count = db.enrollments.count_documents({
        "course_id": ObjectId(course_id)
    })
    
    return {
        "success": True,
        "message": "✅ Đã lưu trữ khóa học",
        "note": f"Khóa học không còn trên marketplace. {enrolled_count} học viên đã mua vẫn truy cập được."
    }
```

---

## 🔄 WORKFLOW THỰC TẾ

### Kịch bản 1: Instructor muốn xóa khóa học

```
1. Instructor vào trang "Khóa học của tôi"
2. Click nút "..." → "Yêu cầu ngừng giảng dạy"
3. Điền form:
   - Lý do: "Nội dung lỗi thời, cần làm khóa mới"
   - Ghi chú: "Khóa học Angular 2015"
4. Hệ thống tạo ticket → gửi cho Admin
5. Admin xem xét:
   - Check: Có người mua chưa?
   - Nếu CHƯA → Click "Chấp thuận xóa" → Soft delete
   - Nếu RỒI → Click "Lưu trữ" → Archive
6. Thông báo kết quả cho instructor
```

### Kịch bản 2: Admin xóa khóa học

```
1. Admin vào "Quản lý khóa học"
2. Chọn khóa cần xóa
3. Click "Xóa"
4. Hệ thống kiểm tra:
   - Nếu có giao dịch: Hiện popup
     "❌ Không thể xóa. Vui lòng dùng 'Lưu trữ'"
   - Nếu chưa có: Hiện popup confirm
     "⚠️ Xác nhận xóa khóa học?"
5. Admin confirm → Xóa thành công
```

### Kịch bản 3: Instructor nghỉ việc

```
1. HR thông báo: "Instructor A nghỉ việc"
2. Admin vào hệ thống
3. Tìm tất cả khóa học của Instructor A
4. Với mỗi khóa:
   - Option 1: Gán cho Instructor B (update instructor_id)
   - Option 2: Admin tự làm owner tạm thời
   - Option 3: Archive nếu không tìm được người thay
5. KHÔNG BAO GIỜ xóa khóa đã có học viên
```

---

## 📝 QUY TẮC VÀNG

> **"Đã bán cho khách → Không được xóa, chỉ được Archive"**

### Tương tự như:
- **Netflix**: Ngừng làm phim cũ → Người đã thuê vẫn xem được
- **Udemy**: Ngừng bán khóa → Người đã mua vẫn học được
- **Spotify**: Gỡ album khỏi thư viện → Người đã save vẫn nghe được
- **Trung tâm của bạn**: Ngừng bán khóa → Phải giữ cam kết với khách cũ!

### Lý do:
1. **Pháp lý**: Hợp đồng với khách hàng ("Học trọn đời")
2. **Uy tín**: Khách tin tưởng → Không thể phá vỡ lời hứa
3. **Thuế**: Luật kế toán yêu cầu lưu hóa đơn 10 năm
4. **Đạo đức kinh doanh**: Tôn trọng quyền lợi người tiêu dùng

---

## 🎯 CHECKLIST TRƯỚC KHI XÓA

Admin cần kiểm tra:

- [ ] Có bao nhiêu giao dịch thành công? (payments.status = "success")
- [ ] Có bao nhiêu học viên đã đăng ký?
- [ ] Tổng doanh thu từ khóa học này?
- [ ] Khóa học có đang bị khiếu nại/tranh chấp không?
- [ ] Instructor có đang làm việc hay đã nghỉ?
- [ ] Có phương án thay thế cho học viên không?

**Nếu trả lời "Có" cho bất kỳ câu nào → ARCHIVE, không xóa!**

---

## 💾 DATABASE SCHEMA

### Courses Collection:

```javascript
{
  _id: ObjectId("..."),
  title: "Khóa học React",
  instructor_id: ObjectId("..."),
  
  // Deletion & Archive fields
  is_deleted: false,           // Soft delete
  deleted_at: null,
  deleted_by: null,            // Admin ID
  deletion_reason: null,       // "admin_soft_delete", "no_students", etc.
  
  is_archived: false,          // Archive - học viên cũ vẫn học được
  archived_at: null,
  archived_by: null,
  archived_reason: null,       // "outdated_content", "instructor_left", etc.
  
  status: "APPROVED",          // "DRAFT", "PENDING", "APPROVED", "BLOCKED"
  
  // ... other fields
}
```

### Query patterns:

```javascript
// Lấy khóa học ACTIVE (hiển thị trên marketplace)
db.courses.find({
  is_deleted: false,
  is_archived: false,
  status: "APPROVED"
})

// Lấy khóa học học viên ĐÃ MUA có thể truy cập
// (Kể cả archived, miễn không bị deleted hoặc blocked)
db.courses.find({
  _id: course_id,
  is_deleted: false,
  status: { $ne: "BLOCKED" }
})
```

---

## 📊 MIGRATION PLAN

Nếu cần thêm các field mới:

```javascript
// Thêm archived fields
db.courses.updateMany(
  {},
  {
    $set: {
      is_archived: false,
      archived_at: null,
      archived_by: null,
      archived_reason: null
    }
  }
)

// Thêm audit trail cho deleted
db.courses.updateMany(
  { is_deleted: true },
  {
    $set: {
      deleted_at: new Date(),
      deletion_reason: "legacy_soft_delete"
    }
  }
)
```

---

## 🚀 IMPLEMENTATION TODO

### Backend:
- [ ] Sửa logic `delete_course`: Kiểm tra `payments.status = "success"`
- [ ] Thêm function `archive_course`
- [ ] Thêm middleware: Chỉ admin mới xóa/archive được
- [ ] Thêm API: `POST /admin/courses/{id}/archive`
- [ ] Thêm audit log cho mọi hành động xóa/archive

### Frontend:
- [ ] Admin Dashboard: Thêm nút "Lưu trữ" bên cạnh "Xóa"
- [ ] Popup confirm có giải thích rõ sự khác biệt
- [ ] Hiển thị số lượng học viên & giao dịch trước khi xóa
- [ ] Tab "Khóa học đã lưu trữ" trong admin
- [ ] Instructor: Thay "Xóa" bằng "Yêu cầu ngừng dạy"

### Testing:
- [ ] Test: Xóa khóa chưa có học viên → OK
- [ ] Test: Xóa khóa có 1 giao dịch → Error
- [ ] Test: Archive khóa có học viên → Học viên vẫn truy cập được
- [ ] Test: Khóa archived không hiện marketplace
- [ ] Test: Instructor không xóa được khóa

---

## 📖 THAM KHẢO

- **Luật Bảo vệ Người tiêu dùng**: Quyền lợi khách hàng
- **Luật Thuế**: Lưu trữ hóa đơn 10 năm
- **GDPR**: Right to be forgotten (EU)
- **Best practices**: Udemy, Coursera, LinkedIn Learning

---

**Tài liệu này được tạo ngày**: 2026-05-15  
**Áp dụng cho**: EduSync Platform - Learning Management System  
**Phiên bản**: 1.0
