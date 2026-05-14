# Hướng dẫn Tính năng Điều hướng Thông báo

## Tổng quan
Component `NotificationBell` đã được nâng cấp với tính năng điều hướng thông minh và đánh dấu đã đọc.

## Các thay đổi đã thực hiện

### 1. Frontend (NotificationBell.jsx)

#### Tính năng mới:
- ✅ Click vào thông báo để điều hướng đến trang tương ứng
- ✅ Tự động đánh dấu đã đọc khi click
- ✅ Điều hướng thông minh dựa trên `type` và `role` của user
- ✅ Hiệu ứng hover/active cho UX tốt hơn
- ✅ Đã cài đặt package `jwt-decode` để decode token và lấy role

#### Logic điều hướng:

| Type thông báo | Role Instructor | Role Learner |
|----------------|----------------|--------------|
| `question_reply`, `qna_reply`, `qa`, `qna` | `/instructor/courses/{course_id}` với state `{activeTab: "qa"}` | `/courses/{course_id}/lessons/{lesson_id}` với state `{activeLeftTab: "q&a"}` |
| `course_approved`, `approval` | `/instructor/courses/{course_id}` | `/courses/{course_id}` |
| `course_rejected`, `rejection` | `/instructor/courses/{course_id}/edit` | - |
| `new_course`, `new_enroll`, `course_update` | `/instructor/courses/{course_id}` | `/courses/{course_id}` |
| `achievement`, `gamification` | - | `/profile` |
| `system` | Dùng `url` custom nếu có | Dùng `url` custom nếu có |

### 2. Backend (notifications_controller.py)

Đã thêm endpoint mới:

```python
PUT /notifications/{notification_id}/read
```

**Request:**
- Headers: `Authorization: Bearer {token}`
- Path param: `notification_id` (string ObjectId)

**Response:**
```json
{
  "status": "success",
  "message": "Notification marked as read"
}
```

## Cấu trúc Payload API

Backend trả về notification với cấu trúc:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Có câu hỏi mới",
  "message": "Học viên đã đặt câu hỏi trong khóa học React Advanced",
  "type": "question_reply",
  "is_read": false,
  "created_at": "2026-05-14T10:30:00Z",
  "course_id": "507f1f77bcf86cd799439012",
  "question_id": "507f1f77bcf86cd799439013",
  "lesson_id": "507f1f77bcf86cd799439014",  // Optional
  "url": null  // Optional custom URL
}
```

## Cách test

### Test 1: Điều hướng Q&A (Instructor)
1. Login với tài khoản Instructor
2. Tạo thông báo type `question_reply` với `course_id` hợp lệ
3. Click vào thông báo trong dropdown
4. ✅ Kiểm tra: Được chuyển đến `/instructor/courses/{course_id}` với tab Q&A active

### Test 2: Điều hướng Q&A (Learner)
1. Login với tài khoản Learner
2. Tạo thông báo type `qna_reply` với `course_id` và `lesson_id`
3. Click vào thông báo
4. ✅ Kiểm tra: Được chuyển đến `/courses/{course_id}/lessons/{lesson_id}` với tab Q&A bên trái active

### Test 3: Course Approved (Instructor)
1. Login với tài khoản Instructor
2. Tạo thông báo type `course_approved` với `course_id`
3. Click vào thông báo
4. ✅ Kiểm tra: Được chuyển đến `/instructor/courses/{course_id}`

### Test 4: Course Rejected (Instructor)
1. Login với tài khoản Instructor
2. Tạo thông báo type `course_rejected` với `course_id`
3. Click vào thông báo
4. ✅ Kiểm tra: Được chuyển đến `/instructor/courses/{course_id}/edit`

### Test 5: Mark as Read
1. Login với bất kỳ role nào
2. Mở dropdown thông báo (có thông báo chưa đọc)
3. Click vào thông báo chưa đọc
4. ✅ Kiểm tra:
   - Thông báo được đánh dấu đã đọc (không còn chấm xanh)
   - Badge số lượng chưa đọc giảm đi 1
   - API `PUT /notifications/{id}/read` được gọi

### Test 6: Mark All as Read
1. Login với bất kỳ role nào
2. Có ít nhất 2 thông báo chưa đọc
3. Mở dropdown và click "Đánh dấu đã đọc"
4. ✅ Kiểm tra:
   - Tất cả thông báo chuyển sang trạng thái đã đọc
   - Badge số lượng chưa đọc về 0
   - API được gọi cho từng thông báo chưa đọc

### Test 7: Hover/Active Effects
1. Mở dropdown thông báo
2. Di chuột qua các thông báo
3. ✅ Kiểm tra:
   - Hover: Background chuyển sang `bg-blue-50/50` với shadow
   - Active (click): Background chuyển sang `bg-blue-100/50`
   - Transition mượt mà

## API Testing với cURL

### Get notifications
```bash
curl -X GET http://localhost:8000/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mark as read
```bash
curl -X PUT http://localhost:8000/notifications/{notification_id}/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Lưu ý quan trọng

1. **JWT Token**: Component sử dụng `jwt-decode` để decode token và lấy role từ `localStorage.getItem("access_token")`
2. **State Routing**: Một số route cần state để activate tab đúng (ví dụ: Q&A tab)
3. **Lesson ID**: Nếu thông báo có `lesson_id`, learner sẽ được điều hướng trực tiếp đến workspace học tập
4. **Custom URL**: Nếu thông báo có field `url`, nó sẽ được ưu tiên trong một số trường hợp
5. **Real-time**: Để có real-time notification, cần implement WebSocket hoặc polling (hiện tại chỉ fetch khi mở dropdown)

## Files đã thay đổi

### Frontend
- ✅ `FE_EduSync/src/components/common/NotificationBell.jsx` - Thêm logic điều hướng
- ✅ `FE_EduSync/package.json` - Thêm dependency `jwt-decode`

### Backend
- ✅ `backend/app/modules/notifications/notifications_controller.py` - Thêm PUT endpoint

## Các tính năng có thể mở rộng

1. **WebSocket Real-time**: Implement Socket.IO cho notification real-time
2. **Mark All API**: Thêm endpoint `PUT /notifications/mark-all-read` để giảm số lượng request
3. **Pagination**: Thêm phân trang cho danh sách thông báo
4. **Filter by Type**: Thêm tab lọc theo loại thông báo
5. **Sound/Desktop Notification**: Thêm âm thanh hoặc browser notification
6. **Read Receipt**: Track thời điểm user đọc thông báo
