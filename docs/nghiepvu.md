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


 CÁC CÂU HỎI PHẢN BIỆN VỀ NGHIỆP VỤ KÈM CÂU TRẢ LỜI

  ---
  1. QUẢN LÝ TRẠNG THÁI KHÓA HỌC

  ❓ Câu hỏi: Khi khóa học đã APPROVED (đã duyệt), instructor cập nhật nội dung thì có cờ has_pending_update=True. Vậy
  trong lúc chờ admin duyệt lại, học viên đã mua có nhìn thấy nội dung mới chưa được duyệt không? Hay vẫn thấy bản cũ?

  ✅ Trả lời:
  - Học viên VẪN THẤY BẢN CŨ đã được duyệt trước đó
  - Chỉ khi admin phê duyệt cập nhật (set has_pending_update=False), nội dung mới mới được hiển thị
  - Code trong course_service.py:871-874 cho thấy khi status=APPROVED mà có update thì chỉ đánh dấu cờ, không thay đổi
  status
  - Đây là cơ chế Two-layer State Management để bảo vệ chất lượng khóa học đã public

  ---
  2. XÓA KHÓA HỌC & HỌC VIÊN ĐÃ MUA

  ❓ Câu hỏi: Admin có thể xóa khóa học đã có học viên mua không? Nếu xóa thì học viên có mất quyền truy cập không? Điều
   này có vi phạm cam kết "Học trọn đời" không?

  ✅ Trả lời:
  - HIỆN TẠI Ở CHẾ ĐỘ TEST: Admin CÓ THỂ xóa khóa đã có học viên (code line 1034-1046 đang bị comment)
  - KHI PRODUCTION: Code có logic kiểm tra successful_payments > 0 → KHÔNG CHO XÓA, bắt buộc dùng ARCHIVE thay thế
  - Archive (line 1073-1113):
    - Khóa học biến mất khỏi marketplace (không bán nữa)
    - Nhưng học viên đã mua VẪN TRUY CẬP ĐƯỢC (giữ cam kết "Học trọn đời")
    - Filter is_archived: {$ne: True} loại khóa archive khỏi danh sách public
  - Đây là thiết kế tốt để cân bằng giữa quản lý nội dung và quyền lợi học viên

  ---
  3. THANH TOÁN & ĐĂNG KÝ KHÓA HỌC

  ❓ Câu hỏi: Nếu học viên tạo payment nhưng không hoàn tất thanh toán (status=pending), sau đó quay lại thanh toán lại
  có bị tạo payment trùng không? Có cơ chế nào ngăn học viên tạo nhiều giao dịch pending cho cùng 1 khóa?

  ✅ Trả lời:
  - CHƯA CÓ CƠ CHẾ NGĂN CHẶN giao dịch pending trùng lặp
  - Code payment_service.py:44-54 chỉ kiểm tra enrolled (đã đăng ký thành công)
  - Nếu có payment pending, vẫn có thể tạo payment mới → Dẫn đến nhiều transaction_id cho 1 khóa
  - Giải pháp nên có:
    - Kiểm tra db.payments.find_one({"user_id": X, "course_id": Y, "status": "pending"})
    - Nếu có pending < 15 phút → trả về URL cũ thay vì tạo mới
    - Hoặc hủy pending cũ khi tạo mới

  ---
  4. PROGRESS TRACKING & HOÀN THÀNH KHÓA HỌC

  ❓ Câu hỏi: Học viên được tính hoàn thành bài học (is_completed=True) khi progress_percent >= 90% (line 365). Nếu học
  viên tua nhanh video đến 90% rồi thoát ra thì có được tính hoàn thành không? Có rủi ro gian lận không?

  ✅ Trả lời:
  - CÓ RỦI RO GIAN LẬN vì chỉ dựa vào progress_seconds / duration
  - Không có cơ chế kiểm tra:
    - Học viên có thực sự xem video không (có thể chỉ tua)
    - Tốc độ xem có bất thường không (xem 10 phút trong 2 phút)
    - Có tương tác với nội dung không
  - Code video_service.py:401-509 tracking views chỉ yêu cầu xem >= 10 giây để đếm lượt xem đầu tiên
  - Giải pháp nên có:
    - Track các segment đã xem (không liên tục)
    - Yêu cầu xem tối thiểu X% theo thứ tự
    - Kết hợp quiz/bài tập để xác nhận hiểu bài

  ---
  5. NOTIFICATION SPAM

  ❓ Câu hỏi: Mỗi khi học viên đặt câu hỏi, giảng viên nhận notification (line 68-89 question_service.py). Nếu có 100
  học viên cùng hỏi trong 1 giờ thì giảng viên có nhận 100 thông báo không? Có cơ chế gộp notification không?

  ✅ Trả lời:
  - HIỆN TẠI CHƯA CÓ CƠ CHẾ GỘP, mỗi câu hỏi = 1 notification riêng
  - Instructor có thể bị spam nếu khóa học có nhiều học viên active
  - Vấn đề tương tự với:
    - Enrollment notification (mỗi học viên đăng ký = 1 thông báo)
    - Reply notification (mỗi reply = 1 thông báo)
  - Giải pháp nên có:
    - Gộp notification theo khoảng thời gian (VD: "5 học viên mới trong 1 giờ qua")
    - Notification digest hàng ngày cho instructor
    - Setting cho phép tắt một số loại notification
    - Real-time notification chỉ cho câu hỏi "urgent" hoặc từ VIP student

  ---
  6. REVENUE CALCULATION

  ❓ Câu hỏi: Trong revenue_service.py, doanh thu được tính từ payments với status="success". Vậy nếu có chính sách hoàn
   tiền (refund) thì có được trừ vào doanh thu không? Hiện tại có hỗ trợ refund không?

  ✅ Trả lời:
  - CHƯA CÓ TÍNH NĂNG REFUND trong code hiện tại
  - Doanh thu chỉ cộng dồn từ $sum: "$amount" (line 24 revenue_service.py)
  - Không có trạng thái "refunded" trong payment status
  - Không có bảng/collection lưu lịch sử refund
  - Rủi ro: Nếu sau này có refund mà không update logic này → BÁO CÁO SAI
  - Giải pháp nên có:
    - Thêm status "refunded" vào payment
    - Field refunded_at, refund_amount, refund_reason
    - Revenue = SUM(success) - SUM(refunded)
    - Hoặc dùng bảng riêng refunds để audit trail

  ---
  7. INSTRUCTOR STUDENTS STATISTICS

  ❓ Câu hỏi: Trong instructor_service.py:506-513, hệ thống đếm total_students bằng cách lấy unique user_id từ
  enrollments của TẤT CẢ khóa học. Vậy nếu 1 học viên mua 3 khóa của cùng 1 instructor thì chỉ đếm là 1 student phải
  không? Điều này có hợp lý không?

  ✅ Trả lời:
  - ĐÚNG, 1 học viên mua nhiều khóa chỉ đếm 1 lần (line 67: unique_students = set(...))
  - HỢP LÝ nếu mục đích là đếm "Số học viên duy nhất tiếp cận được"
  - KHÔNG HỢP LÝ nếu muốn đếm "Tổng lượt đăng ký khóa học"
  - Nên có 2 metrics:
    - unique_students: Số học viên duy nhất (hiện tại)
    - total_enrollments: Tổng lượt đăng ký (chưa có)
  - Code dashboard (line 142-148) cho thấy enrolled_students đếm theo enrollment → KHÁC với total_students trong profile
  - → Có sự mâu thuẫn giữa 2 cách tính

  ---
  8. ACTIVE LEARNERS DEFINITION

  ❓ Câu hỏi: "Active learners" được định nghĩa là học viên có lesson_progress trong 30 ngày (line 519-551
  instructor_service.py). Nhưng nếu học viên chỉ login vào xem thông tin khóa học mà không xem video thì có được tính
  không?

  ✅ Trả lời:
  - KHÔNG ĐƯỢC TÍNH vì chỉ check lesson_progress collection
  - Login hoặc xem course detail không tạo progress record
  - Ý nghĩa: Active learners = "Học viên thực sự học" (xem video, làm bài)
  - Vấn đề:
    - Enrollment có last_accessed_at (line 439-450) dựa trên thời gian truy cập
    - Nhưng không đồng bộ với updated_at của lesson_progress
    - Nếu học viên vào course page nhưng không xem video → last_accessed_at update nhưng không tạo progress
  - Status logic (line 434-450):
    - active: last_accessed <= 7 ngày
    - idle: 7-30 ngày
    - inactive: > 30 ngày
  - → 2 định nghĩa "active" khác nhau: enrollment-based vs progress-based

  ---
  9. VIDEO TRANSCRIPT & AI FEATURES

  ❓ Câu hỏi: Khi upload video, hệ thống tự động tạo transcript (STT), mindmap, summary, timeline (line 119-271
  video_service.py). Nếu quá trình này thất bại hoặc Gemini API hết quota thì video có bị block không? Học viên có xem
  được video không?

  ✅ Trả lời:
  - VIDEO VẪN XEM ĐƯỢC BÌNH THƯỜNG vì AI features chạy background (line 123-135)
  - ai_status có 3 trạng thái: pending, processing, ready, failed
  - Nếu STT thất bại → set ai_status="failed" và ai_error (line 275-284)
  - Nhưng KHÔNG ẢNH HƯỞNG đến video playback
  - Mindmap/Summary/Timeline thất bại chỉ in log warning (line 221, 247, 269) → KHÔNG BREAK VIDEO
  - Tốt: Separate concerns, AI là enhancement không phải requirement
  - Vấn đề:
    - Không có retry mechanism cho failed transcript
    - Không có notification cho instructor khi AI failed
    - Không có dashboard để xem AI processing status

  ---
  10. COURSE APPROVAL WORKFLOW

  ❓ Câu hỏi: Khi instructor submit khóa học (status DRAFT → PENDING), field is_locked=True (line 838). Vậy instructor
  có thể rút lại submission để chỉnh sửa không? Hay phải chờ admin reject mới được sửa?

  ✅ Trả lời:
  - KHÔNG CÓ CHỨC NĂNG RÚT LẠI submission trong code hiện tại
  - is_locked=True có nghĩa instructor KHÔNG THỂ EDIT khóa học khi đang pending
  - Các trường hợp unlock:
    - Admin approve → is_locked=False (line 1360)
    - Admin reject → is_locked=False (line 1371)
  - Vấn đề:
    - Nếu instructor nhận ra lỗi sau khi submit → phải chờ admin reject
    - Không linh hoạt, tốn thời gian
  - Giải pháp nên có:
    - Thêm endpoint /courses/{id}/withdraw để instructor tự rút về DRAFT
    - Chỉ cho phép withdraw khi status=PENDING (chưa được admin xem)
    - Track số lần withdraw để phát hiện abuse

  ---
  11. PAYMENT & ENROLLMENT RACE CONDITION

  ❓ Câu hỏi: Trong payment_service.py:136-150, khi payment success, hệ thống auto enroll. Nhưng nếu 2 request VNPay
  return cùng lúc (network retry) thì có tạo 2 enrollment không?

  ✅ Trả lời:
  - CÓ RỦI RO RACE CONDITION nhưng đã có phần check:
    - Line 134: Kiểm tra payment.status == "success" → return early nếu đã process
  - NHƯNG VẪN CÓ GAP giữa check và update:
    - T1: Request A check status=pending → OK
    - T2: Request B check status=pending → OK
    - T3: Request A update status=success, insert enrollment
    - T4: Request B update status=success, insert enrollment
    - → Tạo 2 enrollment records
  - Giải pháp nên có:
    - Dùng MongoDB transaction (session)
    - Hoặc unique index trên (user_id, course_id) trong enrollments collection
    - Update payment status bằng findOneAndUpdate với filter status=pending

  ---
  12. LESSON ORDER & VIDEO MAPPING

  ❓ Câu hỏi: Khóa học có lessons collection và videos collection. Mỗi lesson có field order_index, mỗi video cũng có
  order_index. Nếu instructor xóa 1 lesson ở giữa thì các lesson sau có tự động update order_index không?

  ✅ Trả lời:
  - KHÔNG TỰ ĐỘNG UPDATE ORDER trong code hiện tại
  - Code chỉ sort theo order_index khi query (line 359, 386)
  - Nếu xóa lesson order=2, các lesson còn lại vẫn giữ order cũ (1, 3, 4, 5...)
  - Không ảnh hưởng logic vì sort vẫn đúng
  - NHƯNG CÓ VẤN ĐỀ:
    - Order_index không liên tục → khó maintain
    - Frontend reorder (drag-drop) cần update order cho tất cả lessons
  - Vấn đề thực tế:
    - Không thấy code DELETE lesson/video trong các file đã đọc
    - Chỉ có delete course (soft delete)
    - → Có thể chưa implement delete lesson/video

  ---
  13. COMPLETION RATE CALCULATION

  ❓ Câu hỏi: avg_completion_rate trong instructor dashboard (line 564-570) được tính bằng trung bình progress của TẤT
  CẢ enrollments. Nếu có học viên mới đăng ký (0% progress) thì sẽ kéo thấp completion rate. Điều này có công bằng
  không?

  ✅ Trả lời:
  - KHÔNG HOÀN TOÀN CÔNG BẰNG nhưng phản ánh thực tế:
    - Khóa học tốt → học viên hoàn thành nhiều → rate cao
    - Khóa học kém → học viên bỏ học sớm → rate thấp
  - Vấn đề:
    - Học viên mới đăng ký < 24h chưa kịp học → kéo rate xuống
    - Học viên đăng ký nhầm hoặc không có thời gian → 0% vĩnh viễn
  - Giải pháp nên có:
    - avg_completion_rate CHỈ tính học viên đã học >= 1 tuần
    - Thêm metric completion_rate_active (chỉ tính active learners)
    - Thêm dropout_rate (% học viên bỏ học ở mỗi milestone)

  ---
  14. NOTIFICATION TYPE & ROUTING

  ❓ Câu hỏi: Notification có nhiều type: qa, question_reply, course_approved, new_enroll, payment_success... Nhưng code
   notification_service.py:66-145 dùng nhiều if-else để generate title/message. Nếu thêm 10 notification types nữa thì
  code có bị phình to không?

  ✅ Trả lời:
  - ĐÚNG, CODE SẼ BỊ PHÌNH TO và khó maintain
  - Hiện tại đã có 16+ types trong dict (line 98-116)
  - Vấn đề thiết kế:
    - Mixing business logic (generate message) với data formatting
    - Mỗi type có logic riêng nhưng viết trong 1 function
  - Giải pháp nên có:
    - Strategy Pattern: Mỗi notification type = 1 class xử lý riêng
    - Template System: Dùng template string với placeholders
    - Database-driven: Lưu template trong DB, render động
  - Ví dụ template:
  templates = {
    "qa": "{student_name} vừa đặt câu hỏi trong {course_name} tại {lesson_name}",
    "new_enroll": "{student_name} vừa đăng ký {course_name}"
  }

  ---
  15. SOFT DELETE & DATA CONSISTENCY

  ❓ Câu hỏi: Hệ thống dùng soft delete (is_deleted=True) cho course. Vậy khi xóa course, các lesson, video, enrollment,
   payment có được đánh dấu xóa theo không? Hay vẫn tồn tại orphan records?

  ✅ Trả lời:
  - KHÔNG CASCADE DELETE trong code hiện tại
  - Khi delete course (line 991-1001), chỉ update course document
  - Lessons, videos, enrollments, payments VẪN TỒN TẠI
  - Ưu điểm:
    - Giữ lại data để audit, report
    - Có thể restore course sau này
  - Nhược điểm:
    - Orphan records làm DB phình to
    - Query phải filter is_deleted ở nhiều nơi → dễ quên
    - Enrollment của khóa đã xóa vẫn active → học viên có học được không?
  - Giải pháp:
    - Cascade soft delete: lesson, video cũng set is_deleted=True
    - Hoặc dùng reference check: course.is_deleted=True → block access
    - Hard delete chỉ dùng cho permanent deletion (line 1115-1136)
