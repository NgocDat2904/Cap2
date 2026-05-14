# 🎯 Hướng dẫn Deep Linking cho NotificationBell

## Tổng quan
Component `NotificationBell.jsx` đã được nâng cấp với:
1. **Nội dung thông báo chi tiết** - Hiển thị đầy đủ context (tên khóa học, bài học, người dùng)
2. **Deep linking chính xác** - Điều hướng đến đúng vị trí cần xem với auto-scroll support

---

## 1. Nội dung Thông báo Chi tiết (Dynamic Content)

### Hàm `formatNotificationText(notification)`

Component đã được nâng cấp để hiển thị nội dung chi tiết dựa trên các field bổ sung:

#### Fields mới cần từ Backend:

```javascript
{
  "id": "...",
  "type": "question_reply",
  "is_read": false,
  "created_at": "2026-05-14T10:30:00Z",
  
  // === FIELDS CƠ BẢN (Đã có) ===
  "course_id": "507f1f77bcf86cd799439012",
  "question_id": "507f1f77bcf86cd799439013",
  "lesson_id": "507f1f77bcf86cd799439014",
  
  // === FIELDS MỚI CẦN BỔ SUNG ===
  "course_name": "React Advanced - Khóa học nâng cao",
  "lesson_name": "Bài 5: React Hooks",
  "lesson_title": "Bài 5: React Hooks", // Alias của lesson_name
  "instructor_name": "Nguyễn Văn A",
  "student_name": "Trần Thị B",
  "question_content": "Em không hiểu về useEffect...", // Optional
  "rejection_reason": "Nội dung chưa đầy đủ", // Cho course_rejected
  "achievement_id": "...", // Cho achievement notifications
  "student_id": "...", // Cho new_enroll notifications
  
  // Optional: URL custom nếu cần điều hướng đặc biệt
  "url": null
}
```

### Ví dụ Nội dung Chi tiết:

#### Type: `question_reply`
**Trước** (không có context):
```
Title: "🎯 Giảng viên đã phản hồi!"
Message: "Câu hỏi của bạn trong khóa học vừa có câu trả lời mới. Nhấn để xem ngay."
```

**Sau** (có đầy đủ context):
```
Title: "💬 Phản hồi mới từ Giảng viên"
Message: "Giảng viên Nguyễn Văn A đã trả lời bình luận của bạn tại bài học 
         'Bài 5: React Hooks' trong khóa học 'React Advanced - Khóa học nâng cao'. 
         Nhấn để xem chi tiết."
```

#### Type: `qa` (Instructor nhận notification)
```
Title: "💬 Có câu hỏi mới"
Message: "Trần Thị B vừa đặt câu hỏi tại bài học 'Bài 5: React Hooks' 
         trong khóa học 'React Advanced - Khóa học nâng cao'. 
         Hãy phản hồi để hỗ trợ họ."
```

#### Type: `course_approved`
```
Title: "✅ Khóa học đã được duyệt!"
Message: "Chúc mừng! Khóa học 'React Advanced - Khóa học nâng cao' đã được phê duyệt 
         và đang được xuất bản trên hệ thống. Học viên giờ có thể tìm thấy và 
         đăng ký khóa học của bạn."
```

#### Type: `course_rejected`
```
Title: "❌ Khóa học cần chỉnh sửa"
Message: "Khóa học 'React Advanced - Khóa học nâng cao' chưa đáp ứng yêu cầu. 
         Vui lòng xem chi tiết phản hồi và chỉnh sửa lại để gửi phê duyệt."
```

#### Type: `new_enroll`
```
Title: "🎊 Có học viên mới ghi danh"
Message: "Trần Thị B vừa đăng ký học khóa học 'React Advanced - Khóa học nâng cao'. 
         Chào đón và hỗ trợ họ trong hành trình học tập nhé!"
```

---

## 2. Deep Linking - Điều hướng Chính xác

### Hàm `handleNotificationClick(notification)`

Component sử dụng **React Router `navigate(path, { state })`** để truyền context.

### Logic điều hướng theo Type:

#### 2.1. Question Reply / Q&A (`question_reply`, `qna_reply`, `qa`, `qna`)

**Learner**:
```javascript
// Điều hướng đến workspace học tập với auto-scroll
navigate(`/courses/${course_id}/lessons/${lesson_id}`, {
  state: {
    activeLeftTab: "q&a",            // Mở tab Q&A
    scrollToQuestionId: question_id,  // ID để scroll tới
    highlightQuestion: true           // Highlight comment
  }
});
```

**Instructor**:
```javascript
// Điều hướng đến trang quản lý khóa học
navigate(`/instructor/courses/${course_id}`, {
  state: {
    activeTab: "qa",                  // Mở tab Q&A
    scrollToQuestionId: question_id,  // ID để scroll tới
    lessonId: lesson_id               // Filter theo lesson
  }
});
```

**Cách sử dụng state ở trang đích (PlayVideo.jsx / CourseDetail.jsx)**:
```javascript
import { useLocation } from "react-router-dom";

const PlayVideo = () => {
  const location = useLocation();
  const { scrollToQuestionId, highlightQuestion, activeLeftTab } = location.state || {};

  useEffect(() => {
    if (scrollToQuestionId) {
      // Scroll đến comment với ID này
      const element = document.getElementById(`question-${scrollToQuestionId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        
        // Highlight effect
        if (highlightQuestion) {
          element.classList.add("highlight-question");
          setTimeout(() => element.classList.remove("highlight-question"), 3000);
        }
      }
    }
    
    // Set active tab
    if (activeLeftTab === "q&a") {
      setActiveTab("q&a");
    }
  }, [scrollToQuestionId, highlightQuestion, activeLeftTab]);
};
```

**CSS cho highlight effect**:
```css
.highlight-question {
  animation: highlightPulse 2s ease-in-out;
  border: 2px solid #3b82f6;
  border-radius: 8px;
}

@keyframes highlightPulse {
  0%, 100% { background-color: transparent; }
  50% { background-color: rgba(59, 130, 246, 0.1); }
}
```

#### 2.2. Course Approved (`course_approved`, `approval`)

**Instructor**:
```javascript
navigate(`/instructor/courses/${course_id}`, {
  state: { notificationType: "approved" }
});
```

**Learner**:
```javascript
navigate(`/courses/${course_id}`);
```

#### 2.3. Course Rejected (`course_rejected`, `rejection`)

**Instructor** - Điều hướng đến trang edit với rejection reason:
```javascript
navigate(`/instructor/courses/${course_id}/edit`, {
  state: {
    notificationType: "rejected",
    showRejectionReason: true,
    rejectionReason: notification.rejection_reason
  }
});
```

**Sử dụng ở EditCourse.jsx**:
```javascript
const EditCourse = () => {
  const location = useLocation();
  const { showRejectionReason, rejectionReason } = location.state || {};

  useEffect(() => {
    if (showRejectionReason && rejectionReason) {
      // Hiển thị modal/alert với rejection reason
      toast.error(`Lý do từ chối: ${rejectionReason}`, { duration: 5000 });
    }
  }, [showRejectionReason, rejectionReason]);
};
```

#### 2.4. New Enrollment (`new_enroll`)

**Instructor** - Điều hướng đến tab Students với highlight học viên mới:
```javascript
navigate(`/instructor/courses/${course_id}`, {
  state: {
    activeTab: "students",
    highlightNewStudent: student_id
  }
});
```

#### 2.5. Achievement (`achievement`, `gamification`)

**Learner** - Điều hướng đến profile với tab achievements:
```javascript
navigate("/profile", {
  state: {
    activeTab: "achievements",
    highlightAchievement: achievement_id
  }
});
```

#### 2.6. Payment (`payment_success`, `payment_failed`)

**Payment Success**:
```javascript
navigate(`/courses/${course_id}`, {
  state: { showWelcomeMessage: true }
});
```

**Payment Failed**:
```javascript
navigate(`/courses/${course_id}`, {
  state: { showPaymentError: true }
});
```

---

## 3. Backend Changes Cần Thiết

### 3.1. Cập nhật `notification_service.py`

**File**: `backend/app/modules/notifications/notification_service.py`

```python
async def get_my_notifications(self, user_id):
    notifications = notification_repository.get_user_notifications(ObjectId(user_id))
    
    result = []
    for n in notifications:
        # Lấy thêm thông tin course, lesson, user names
        course_info = None
        lesson_info = None
        instructor_info = None
        student_info = None
        
        # Fetch course name nếu có course_id
        if n.get("course_id"):
            course = db.courses.find_one({"_id": n["course_id"]})
            if course:
                course_info = {
                    "name": course.get("title") or course.get("name"),
                    "instructor_id": course.get("instructor_id")
                }
                
                # Fetch instructor name
                if course.get("instructor_id"):
                    instructor = db.users.find_one({"_id": course["instructor_id"]})
                    if instructor:
                        instructor_info = instructor.get("name") or instructor.get("email")
        
        # Fetch lesson name nếu có lesson_id
        if n.get("lesson_id"):
            lesson = db.lessons.find_one({"_id": n["lesson_id"]})
            if lesson:
                lesson_info = lesson.get("title") or lesson.get("name")
        
        # Fetch student name nếu có student_id (cho new_enroll)
        if n.get("student_id"):
            student = db.users.find_one({"_id": n["student_id"]})
            if student:
                student_info = student.get("name") or student.get("email")
        
        result.append({
            "id": str(n["_id"]),
            "title": n.get("title"),
            "message": n.get("message"),
            "type": n.get("type"),
            "is_read": n.get("is_read", False),
            "created_at": n.get("created_at"),
            
            # IDs
            "course_id": str(n["course_id"]) if n.get("course_id") else None,
            "question_id": str(n["question_id"]) if n.get("question_id") else None,
            "lesson_id": str(n["lesson_id"]) if n.get("lesson_id") else None,
            "achievement_id": str(n["achievement_id"]) if n.get("achievement_id") else None,
            "student_id": str(n["student_id"]) if n.get("student_id") else None,
            
            # NEW: Context information
            "course_name": course_info["name"] if course_info else None,
            "lesson_name": lesson_info if lesson_info else None,
            "lesson_title": lesson_info if lesson_info else None,  # Alias
            "instructor_name": instructor_info if instructor_info else None,
            "student_name": student_info if student_info else None,
            "rejection_reason": n.get("rejection_reason"),
            "url": n.get("url")
        })
    
    return result
```

### 3.2. Cập nhật Notification Creation

Khi tạo notification mới, thêm các field bổ sung:

```python
# Ví dụ: Tạo notification cho question_reply
def create_question_reply_notification(question, reply, course, lesson):
    notification_data = {
        "user_id": ObjectId(question["user_id"]),
        "type": "question_reply",
        "title": None,  # Để frontend tự generate
        "message": None,
        "is_read": False,
        "created_at": datetime.utcnow(),
        
        # IDs
        "course_id": ObjectId(course["_id"]),
        "lesson_id": ObjectId(lesson["_id"]),
        "question_id": ObjectId(question["_id"]),
        
        # NEW: Context (optional - frontend có thể tự generate nếu không có)
        "course_name": course.get("title"),
        "lesson_name": lesson.get("title"),
        "instructor_name": reply.get("author_name"),  # Từ user collection
        "url": None
    }
    
    notification_repository.create(notification_data)
```

---

## 4. Testing Guide

### Test Case 1: Question Reply Deep Link

**Setup**:
1. User A (Learner) đặt câu hỏi trong lesson "Bài 5: React Hooks"
2. Instructor B trả lời câu hỏi
3. Backend tạo notification cho User A

**Expected Notification**:
```json
{
  "type": "question_reply",
  "course_id": "abc123",
  "lesson_id": "xyz789",
  "question_id": "qst456",
  "course_name": "React Advanced",
  "lesson_name": "Bài 5: React Hooks",
  "instructor_name": "Nguyễn Văn B"
}
```

**Test Steps**:
1. Login as User A (Learner)
2. Click vào notification bell → Thấy notification:
   ```
   💬 Phản hồi mới từ Giảng viên
   Giảng viên Nguyễn Văn B đã trả lời bình luận của bạn tại bài học 
   "Bài 5: React Hooks" trong khóa học "React Advanced". Nhấn để xem chi tiết.
   ```
3. Click vào notification
4. ✅ **Expected**: 
   - Chuyển đến `/courses/abc123/lessons/xyz789`
   - Tab Q&A được active
   - Auto-scroll đến comment có ID `qst456`
   - Comment được highlight (border xanh)
   - Badge unreadCount giảm đi 1

### Test Case 2: Course Rejected Deep Link

**Setup**:
1. Instructor submit course
2. Admin reject với lý do "Nội dung chưa đầy đủ"
3. Backend tạo notification

**Expected Notification**:
```json
{
  "type": "course_rejected",
  "course_id": "abc123",
  "course_name": "React Advanced",
  "rejection_reason": "Nội dung chưa đầy đủ, cần bổ sung ví dụ thực tế"
}
```

**Test Steps**:
1. Login as Instructor
2. Click notification
3. ✅ **Expected**:
   - Chuyển đến `/instructor/courses/abc123/edit`
   - Hiển thị modal/toast với rejection reason
   - Focus vào phần cần chỉnh sửa

### Test Case 3: New Enrollment

**Setup**:
1. Learner "Trần Thị C" đăng ký khóa học
2. Backend tạo notification cho Instructor

**Expected Notification**:
```json
{
  "type": "new_enroll",
  "course_id": "abc123",
  "student_id": "std789",
  "course_name": "React Advanced",
  "student_name": "Trần Thị C"
}
```

**Test Steps**:
1. Login as Instructor
2. Click notification
3. ✅ **Expected**:
   - Chuyển đến `/instructor/courses/abc123`
   - Tab Students được active
   - Học viên "Trần Thị C" được highlight

---

## 5. Frontend Pages Cần Cập nhật

### 5.1. PlayVideo.jsx (Learner workspace)

```javascript
import { useLocation } from "react-router-dom";

const PlayVideo = () => {
  const location = useLocation();
  const { scrollToQuestionId, highlightQuestion, activeLeftTab } = location.state || {};

  useEffect(() => {
    // Set active tab
    if (activeLeftTab) {
      setLeftTab(activeLeftTab);
    }

    // Scroll to question (delay để đảm bảo DOM đã render)
    if (scrollToQuestionId) {
      setTimeout(() => {
        const element = document.getElementById(`question-${scrollToQuestionId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          
          if (highlightQuestion) {
            element.classList.add("highlight-question");
            setTimeout(() => element.classList.remove("highlight-question"), 3000);
          }
        }
      }, 500);
    }
  }, [scrollToQuestionId, highlightQuestion, activeLeftTab]);
};
```

**CSS cần thêm**:
```css
.highlight-question {
  animation: highlightPulse 2s ease-in-out;
  border: 2px solid #3b82f6 !important;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

@keyframes highlightPulse {
  0%, 100% { background-color: transparent; }
  50% { background-color: rgba(59, 130, 246, 0.1); }
}
```

### 5.2. EditCourse.jsx (Instructor)

```javascript
const EditCourse = () => {
  const location = useLocation();
  const { showRejectionReason, rejectionReason, notificationType } = location.state || {};

  useEffect(() => {
    if (showRejectionReason && rejectionReason) {
      // Hiển thị rejection reason
      Swal.fire({
        icon: "warning",
        title: "Khóa học cần chỉnh sửa",
        html: `
          <p>Khóa học của bạn chưa được phê duyệt vì:</p>
          <div style="background: #fee; padding: 12px; border-radius: 8px; margin-top: 12px;">
            <strong>${rejectionReason}</strong>
          </div>
          <p style="margin-top: 12px;">Vui lòng chỉnh sửa và gửi lại để được xét duyệt.</p>
        `,
        confirmButtonText: "OK, tôi hiểu"
      });
    }
  }, [showRejectionReason, rejectionReason]);
};
```

### 5.3. InstructorCourseView.jsx

```javascript
const InstructorCourseView = () => {
  const location = useLocation();
  const {
    activeTab,
    scrollToQuestionId,
    lessonId,
    highlightNewStudent,
    notificationType
  } = location.state || {};

  useEffect(() => {
    // Set active tab
    if (activeTab) {
      setCurrentTab(activeTab);
    }

    // Highlight new student
    if (highlightNewStudent && activeTab === "students") {
      setTimeout(() => {
        const element = document.getElementById(`student-${highlightNewStudent}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          element.classList.add("highlight-new-student");
          setTimeout(() => element.classList.remove("highlight-new-student"), 3000);
        }
      }, 500);
    }

    // Show approval success message
    if (notificationType === "approved") {
      toast.success("🎉 Khóa học của bạn đã được phê duyệt và xuất bản!");
    }
  }, [activeTab, highlightNewStudent, notificationType]);
};
```

---

## 6. MongoDB Schema Update

Cập nhật collection `notifications`:

```javascript
{
  "_id": ObjectId("..."),
  "user_id": ObjectId("..."),
  "type": "question_reply",
  "title": null,  // Optional - để frontend generate nếu null
  "message": null,
  "is_read": false,
  "created_at": ISODate("2026-05-14T10:30:00Z"),
  
  // Reference IDs
  "course_id": ObjectId("..."),
  "lesson_id": ObjectId("..."),
  "question_id": ObjectId("..."),
  "achievement_id": ObjectId("..."),  // Optional
  "student_id": ObjectId("..."),      // Optional
  
  // NEW: Context information (denormalized for performance)
  "course_name": "React Advanced",
  "lesson_name": "Bài 5: React Hooks",
  "instructor_name": "Nguyễn Văn A",
  "student_name": "Trần Thị B",
  "rejection_reason": "Nội dung chưa đầy đủ",  // For course_rejected
  "question_content": "Em không hiểu về useEffect...",  // Optional
  
  // Optional custom URL
  "url": null
}
```

---

## 7. Performance Considerations

### 7.1. Denormalization Trade-off

**Pros**:
- ✅ Giảm số lượng query khi fetch notifications
- ✅ Frontend nhận ngay đầy đủ context
- ✅ Response time nhanh hơn

**Cons**:
- ❌ Dữ liệu có thể outdate (nếu course/lesson name thay đổi)
- ❌ Tăng kích thước document

**Giải pháp**:
- Notification là dữ liệu snapshot tại thời điểm tạo
- Không cần update khi source data thay đổi
- Acceptable trade-off cho UX tốt hơn

### 7.2. Caching Strategy

Frontend có thể cache notifications:
```javascript
// Cache trong 60 giây
const CACHE_DURATION = 60000;
let notificationCache = {
  data: null,
  timestamp: null
};

const fetchNotifications = async () => {
  const now = Date.now();
  if (notificationCache.data && (now - notificationCache.timestamp < CACHE_DURATION)) {
    return notificationCache.data;
  }
  
  const data = await getNotificationsAPI(token);
  notificationCache = { data, timestamp: now };
  return data;
};
```

---

## 8. Summary

### Frontend Changes: ✅ COMPLETED
- ✅ `formatNotificationText()` - Nội dung chi tiết với context
- ✅ `handleNotificationClick()` - Deep linking với state
- ✅ Support các field mới từ backend

### Backend Changes: 🔄 TODO
- ⏳ Update `notification_service.py` để fetch và trả về:
  - `course_name`
  - `lesson_name` / `lesson_title`
  - `instructor_name`
  - `student_name`
  - `rejection_reason`
  - `achievement_id`
  - `student_id`

### Destination Pages: 🔄 TODO
- ⏳ `PlayVideo.jsx` - Implement scroll to question logic
- ⏳ `EditCourse.jsx` - Show rejection reason modal
- ⏳ `InstructorCourseView.jsx` - Highlight new student
- ⏳ `ProfilePage.jsx` - Highlight achievement

### CSS: 🔄 TODO
- ⏳ Add `.highlight-question` animation
- ⏳ Add `.highlight-new-student` animation

---

**Component NotificationBell.jsx đã sẵn sàng để nhận dữ liệu chi tiết từ backend!** 🚀
