# Chính sách Xóa Khóa Học - EduSync Platform

## Database Schema

```javascript
// courses collection
{
  _id: ObjectId("..."),
  title: "Khóa học React",
  
  // Deletion fields
  is_deleted: false,        // Soft delete by instructor
  is_archived: false,       // Archive - ẩn khỏi marketplace nhưng learner cũ vẫn học được
  archived_at: null,        // Thời điểm archive
  archived_by: null,        // User ID người archive
  archived_reason: null,    // Lý do: "instructor_request", "policy_violation", "legal"
  
  deletion_scheduled_at: null,  // Thời điểm sẽ hard delete (nếu có)
  
  // Audit trail
  deleted_at: null,
  deleted_by: null,
  deletion_reason: null
}
```

## Quy tắc nghiệp vụ

### 1. INSTRUCTOR DELETE (Soft Delete)

**Điều kiện:**
- Instructor là chủ sở hữu
- Khóa học chưa có học viên HOẶC
- Khóa học chưa có doanh thu (payments.success = 0)

**Hành động:**
```python
# Nếu chưa có học viên & chưa có doanh thu
→ Set is_deleted = True
→ Ẩn khỏi tất cả danh sách
→ Có thể restore trong 30 ngày

# Nếu đã có học viên hoặc doanh thu
→ KHÔNG CHO XÓA
→ Suggest: "Archive" thay vì "Delete"
→ Message: "Khóa học đã có học viên đăng ký. Bạn có thể Archive để ẩn khỏi marketplace."
```

### 2. INSTRUCTOR ARCHIVE

**Điều kiện:**
- Instructor là chủ sở hữu
- Khóa học có học viên/doanh thu

**Hành động:**
```python
→ Set is_archived = True
→ Ẩn khỏi marketplace (người mới không mua được)
→ Học viên cũ VẪN truy cập và học bình thường
→ Instructor vẫn thấy trong dashboard (tab "Archived")
```

### 3. ADMIN SUSPEND (Khóa khóa học)

**Điều kiện:**
- Admin phát hiện vi phạm
- Báo cáo từ users

**Hành động:**
```python
→ Set status = "BLOCKED"
→ Ẩn khỏi marketplace ngay lập tức
→ Học viên cũ KHÔNG truy cập được
→ Thông báo cho instructor & học viên
→ Có thể restore sau khi instructor sửa
```

### 4. ADMIN PERMANENT DELETE

**Điều kiện:**
- Yêu cầu pháp lý (GDPR)
- Vi phạm nghiêm trọng không thể khắc phục
- Khóa học cũ > 10 năm và không hoạt động

**Hành động:**
```python
# CẢNH BÁO: Hành động không thể hoàn tác!

→ Tạo backup trong archived_courses collection
→ Anonymize user data (giữ thống kê)
→ Soft delete trước 90 ngày (grace period)
→ Sau 90 ngày: Hard delete
→ Log đầy đủ audit trail
```

## Data Retention

| Loại data | Retention | Lý do |
|---|---|---|
| Deleted courses (soft) | 30 ngày | Cho phép restore |
| Archived courses | Vĩnh viễn | Học viên cũ vẫn học |
| Blocked courses | 1 năm | Investigation |
| Payment records | 7 năm | Luật thuế, kế toán |
| Anonymized stats | Vĩnh viễn | Business analytics |

## Quy trình Restore

### Instructor Restore (trong 30 ngày)
```
1. Instructor vào "Deleted Courses"
2. Click "Restore"
3. is_deleted = False
4. Khóa học xuất hiện lại
```

### Admin Restore (Blocked course)
```
1. Admin review
2. Instructor fix nội dung
3. Admin approve
4. status = "APPROVED"
```

## Thông báo cho Users

### Khi khóa học bị Archive:
**Tin nhắn cho học viên cũ:**
> "Khóa học [Tên] không còn được bán mới, nhưng bạn vẫn có thể tiếp tục học với đầy đủ nội dung."

### Khi khóa học bị Block:
**Tin nhắn cho học viên:**
> "Khóa học tạm thời không khả dụng do vi phạm chính sách. Chúng tôi sẽ hoàn tiền trong 7-14 ngày."

**Tin nhắng cho instructor:**
> "Khóa học của bạn đã bị tạm khóa do [lý do]. Vui lòng liên hệ support để khắc phục."

## Migration Plan

```sql
-- Thêm các field mới vào courses collection
db.courses.updateMany(
  {},
  {
    $set: {
      is_archived: false,
      archived_at: null,
      archived_by: null,
      archived_reason: null,
      deletion_scheduled_at: null
    }
  }
)
```
