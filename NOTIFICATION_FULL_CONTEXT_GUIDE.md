# 📋 Hướng dẫn Notification với Context Đầy đủ

## ✅ Đã hoàn thành

### 1. Backend: Fetch đầy đủ thông tin (notification_service.py)

**Thay đổi**: Backend giờ fetch và trả về:
- `course_name` - Tên khóa học từ collection `courses`
- `lesson_name` / `lesson_title` - Tên bài học từ collection `lessons` hoặc `videos`
- `lesson_id` - ID bài học để điều hướng
- `instructor_name` - Tên giảng viên từ collection `users`
- `student_name` - Tên học viên từ collection `users`
- `rejection_reason` - Lý do từ chối (cho course_rejected)

**Code mới**:
```python
for n in notifications:
    # Fetch course info
    if n.get("course_id"):
        course = db.courses.find_one({"_id": n["course_id"]})
        if course:
            course_name = course.get("title") or course.get("name")
            
            # Fetch instructor from course
            if course.get("instructor_id"):
                instructor = db.users.find_one({"_id": course["instructor_id"]})
                instructor_name = instructor.get("name") or instructor.get("full_name")
    
    # Fetch lesson info
    if n.get("lesson_id"):
        lesson = db.lessons.find_one({"_id": n["lesson_id"]})
        lesson_name = lesson.get("title") or lesson.get("name")
        lesson_id = str(n["lesson_id"])
    elif n.get("video_id"):
        video = db.videos.find_one({"_id": n["video_id"]})
        lesson_name = video.get("title")
        lesson_id = str(n["video_id"])
    
    # Fetch student info (for new_enroll)
    if n.get("student_id"):
        student = db.users.find_one({"_id": n["student_id"]})
        student_name = student.get("name") or student.get("full_name")
    
    result.append({
        # ... existing fields ...
        "course_name": course_name,
        "lesson_name": lesson_name,
        "instructor_name": instructor_name,
        "student_name": student_name,
        "lesson_id": lesson_id,
        # ...
    })
```

---

### 2. Frontend: Nội dung chi tiết và chuyên nghiệp (NotificationBell.jsx)

#### Question Reply (question_reply):
```
Title: "💬 Phản hồi mới từ Giảng viên"
Message: "Nguyễn Văn A đã trả lời câu hỏi của bạn trong bài học 
         'Bài 5: React Hooks và Custom Hooks' của khóa học 
         'React Advanced - Khóa học nâng cao'. Nhấn để xem chi tiết 
         và tiếp tục thảo luận."
```

**Điều hướng**:
- Click → `/courses/{course_id}/lessons/{lesson_id}`
- State: `{ activeLeftTab: "q&a", scrollToQuestionId: question_id, highlightQuestion: true }`

#### New Question (qa, qna):
```
Title: "💬 Có câu hỏi mới từ học viên"
Message: "Trần Thị Bích Ngọc vừa đặt câu hỏi trong bài học 
         'Bài 5: React Hooks và Custom Hooks' của khóa học 
         'React Advanced - Khóa học nâng cao'. Hãy phản hồi 
         để hỗ trợ học viên kịp thời."
```

**Điều hướng** (Instructor):
- Click → `/instructor/courses/{course_id}`
- State: `{ activeTab: "qa", scrollToQuestionId: question_id, lessonId: lesson_id }`

#### Course Approved:
```
Title: "✅ Khóa học đã được phê duyệt!"
Message: "Chúc mừng! Khóa học 'React Advanced - Khóa học nâng cao' 
         đã được phê duyệt và xuất bản trên hệ thống. Học viên giờ 
         có thể tìm thấy và đăng ký khóa học của bạn."
```

**Điều hướng** (Instructor):
- Click → `/instructor/courses/{course_id}`
- State: `{ notificationType: "approved" }`

#### Course Rejected:
```
Title: "❌ Khóa học cần chỉnh sửa"
Message: "Khóa học 'React Advanced - Khóa học nâng cao' Nội dung 
         chưa đầy đủ, cần bổ sung thêm ví dụ thực tế. Vui lòng 
         xem chi tiết phản hồi từ quản trị viên và chỉnh sửa lại 
         để gửi phê duyệt."
```

**Điều hướng** (Instructor):
- Click → `/instructor/courses/{course_id}/edit`
- State: `{ notificationType: "rejected", showRejectionReason: true, rejectionReason: "..." }`

#### New Enrollment:
```
Title: "🎊 Có học viên mới ghi danh"
Message: "Phạm Văn Hùng vừa đăng ký học khóa học 'React Advanced - 
         Khóa học nâng cao'. Hãy chào đón và hỗ trợ học viên trong 
         hành trình học tập của họ."
```

**Điều hướng** (Instructor):
- Click → `/instructor/courses/{course_id}`
- State: `{ activeTab: "students", highlightNewStudent: student_id }`

---

## 🧪 Testing

### Test Case 1: Question Reply với đầy đủ context

**Backend tạo notification**:
```python
notification_data = {
    "user_id": ObjectId(learner_id),
    "type": "question_reply",
    "course_id": ObjectId(course_id),
    "lesson_id": ObjectId(lesson_id),  # QUAN TRỌNG: Phải có lesson_id
    "question_id": ObjectId(question_id),
    "instructor_id": ObjectId(instructor_id),  # Optional, để fetch name
    "created_at": datetime.utcnow(),
    "is_read": False
}
db.notifications.insert_one(notification_data)
```

**API Response (sau khi service fetch)**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "type": "question_reply",
  "course_id": "507f1f77bcf86cd799439012",
  "lesson_id": "507f1f77bcf86cd799439013",
  "question_id": "507f1f77bcf86cd799439014",
  "course_name": "React Advanced - Khóa học nâng cao",
  "lesson_name": "Bài 5: React Hooks và Custom Hooks",
  "instructor_name": "Nguyễn Văn A",
  "is_read": false,
  "created_at": "2026-05-14T10:30:00Z"
}
```

**Frontend hiển thị**:
```
[🔵] 💬 Phản hồi mới từ Giảng viên
     Nguyễn Văn A đã trả lời câu hỏi của bạn trong bài học 
     "Bài 5: React Hooks và Custom Hooks" của khóa học 
     "React Advanced - Khóa học nâng cao". Nhấn để xem chi tiết 
     và tiếp tục thảo luận.
     10 phút trước
```

**Click action**:
```javascript
navigate("/courses/507f1f77bcf86cd799439012/lessons/507f1f77bcf86cd799439013", {
  state: {
    activeLeftTab: "q&a",
    scrollToQuestionId: "507f1f77bcf86cd799439014",
    highlightQuestion: true
  }
});
```

**Expected result**:
1. ✅ Chuyển đến trang PlayVideo của lesson
2. ✅ Tab Q&A được active
3. ✅ Auto-scroll đến comment có ID `507f1f77bcf86cd799439014`
4. ✅ Comment được highlight với animation
5. ✅ Badge unreadCount giảm đi 1

---

### Test Case 2: Question Reply thiếu lesson_name

**API Response**:
```json
{
  "type": "question_reply",
  "course_name": "React Advanced",
  "lesson_name": null,
  "instructor_name": "Nguyễn Văn A"
}
```

**Frontend hiển thị** (Fallback mượt mà):
```
Nguyễn Văn A đã trả lời câu hỏi của bạn trong một bài học 
của khóa học "React Advanced". Nhấn để xem chi tiết và tiếp tục thảo luận.
```

---

### Test Case 3: New Enrollment với đầy đủ context

**Backend tạo notification**:
```python
notification_data = {
    "user_id": ObjectId(instructor_id),
    "type": "new_enroll",
    "course_id": ObjectId(course_id),
    "student_id": ObjectId(student_id),
    "created_at": datetime.utcnow(),
    "is_read": False
}
```

**API Response**:
```json
{
  "type": "new_enroll",
  "course_name": "React Advanced",
  "student_name": "Phạm Văn Hùng",
  "student_id": "507f1f77bcf86cd799439023"
}
```

**Frontend hiển thị**:
```
🎊 Có học viên mới ghi danh
Phạm Văn Hùng vừa đăng ký học khóa học "React Advanced". 
Hãy chào đón và hỗ trợ học viên trong hành trình học tập của họ.
```

**Click action**:
```javascript
navigate("/instructor/courses/507f1f77bcf86cd799439012", {
  state: {
    activeTab: "students",
    highlightNewStudent: "507f1f77bcf86cd799439023"
  }
});
```

---

## 📊 Bảng so sánh Trước/Sau

| Aspect | Trước (❌) | Sau (✅) |
|--------|-----------|---------|
| **Course name** | "khóa học của bạn" | "React Advanced - Khóa học nâng cao" |
| **Lesson name** | "bài học" | "Bài 5: React Hooks và Custom Hooks" |
| **Instructor name** | "Giảng viên" | "Nguyễn Văn A" |
| **Student name** | "Một học viên" | "Phạm Văn Hùng" |
| **Navigation** | Chỉ đến course detail | Đến đúng lesson + auto-scroll + highlight |
| **Message tone** | Generic | Cá nhân hóa, chuyên nghiệp |

---

## 🎯 Cách tạo Notification từ Backend

### Example 1: Question Reply

```python
from datetime import datetime
from bson import ObjectId
from app.database.mongodb import db

def notify_question_reply(question_id, reply_id):
    # Lấy thông tin question
    question = db.questions.find_one({"_id": ObjectId(question_id)})
    if not question:
        return
    
    # Lấy thông tin reply
    reply = db.replies.find_one({"_id": ObjectId(reply_id)})
    if not reply:
        return
    
    # Tạo notification cho người hỏi
    notification_data = {
        "user_id": question["user_id"],  # Người nhận notification
        "type": "question_reply",
        "course_id": question.get("course_id"),
        "lesson_id": question.get("lesson_id"),  # QUAN TRỌNG
        "question_id": ObjectId(question_id),
        "created_at": datetime.utcnow(),
        "is_read": False,
        
        # Optional: Có thể thêm instructor_id để service fetch name
        "instructor_id": reply.get("author_id")
    }
    
    db.notifications.insert_one(notification_data)
```

### Example 2: New Enrollment

```python
def notify_new_enrollment(course_id, student_id):
    # Lấy instructor_id từ course
    course = db.courses.find_one({"_id": ObjectId(course_id)})
    if not course or not course.get("instructor_id"):
        return
    
    # Tạo notification cho instructor
    notification_data = {
        "user_id": course["instructor_id"],  # Instructor nhận notification
        "type": "new_enroll",
        "course_id": ObjectId(course_id),
        "student_id": ObjectId(student_id),  # Để fetch student name
        "created_at": datetime.utcnow(),
        "is_read": False
    }
    
    db.notifications.insert_one(notification_data)
```

---

## 🔧 Frontend Destination Pages TODO

### 1. PlayVideo.jsx - Auto-scroll to question

```javascript
import { useLocation } from "react-router-dom";

const PlayVideo = () => {
  const location = useLocation();
  const { scrollToQuestionId, highlightQuestion, activeLeftTab } = location.state || {};

  useEffect(() => {
    // Set active tab
    if (activeLeftTab === "q&a") {
      setLeftTab("q&a");
    }

    // Auto-scroll to question
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
  0%, 100% { 
    background-color: transparent; 
    transform: scale(1);
  }
  50% { 
    background-color: rgba(59, 130, 246, 0.1); 
    transform: scale(1.02);
  }
}
```

### 2. InstructorCourseView.jsx - Highlight new student

```javascript
const InstructorCourseView = () => {
  const location = useLocation();
  const { activeTab, highlightNewStudent } = location.state || {};

  useEffect(() => {
    if (activeTab === "students") {
      setCurrentTab("students");
      
      // Highlight new student
      if (highlightNewStudent) {
        setTimeout(() => {
          const element = document.getElementById(`student-${highlightNewStudent}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            element.classList.add("highlight-new-student");
            setTimeout(() => element.classList.remove("highlight-new-student"), 3000);
          }
        }, 500);
      }
    }
  }, [activeTab, highlightNewStudent]);
};
```

---

## 📝 Checklist Implementation

### Backend ✅
- [x] Update `notification_service.py` để fetch course_name
- [x] Update `notification_service.py` để fetch lesson_name/lesson_id
- [x] Update `notification_service.py` để fetch instructor_name
- [x] Update `notification_service.py` để fetch student_name
- [x] Đảm bảo notification document có đầy đủ IDs khi tạo

### Frontend ✅
- [x] Update `formatNotificationText()` với nội dung chi tiết
- [x] Sử dụng tên thật (course_name, lesson_name, instructor_name)
- [x] Fallback mượt mà khi thiếu data
- [x] Message chuyên nghiệp, cá nhân hóa
- [x] Deep linking với state metadata

### Frontend TODO ⏳
- [ ] PlayVideo.jsx - Implement auto-scroll to question
- [ ] InstructorCourseView.jsx - Implement highlight new student
- [ ] EditCourse.jsx - Show rejection reason modal
- [ ] Add CSS animations cho highlight effects

---

## 🚀 Summary

### Improvements:
1. ✅ **Backend fetch đầy đủ context** - course_name, lesson_name, instructor_name, student_name
2. ✅ **Message cá nhân hóa** - "Nguyễn Văn A đã trả lời..." thay vì "Giảng viên đã trả lời..."
3. ✅ **Tên thật của khóa học/bài học** - "React Advanced" thay vì "khóa học của bạn"
4. ✅ **Điều hướng chính xác** - Đến đúng lesson với lesson_id, không chỉ course
5. ✅ **Deep linking** - Truyền metadata để auto-scroll và highlight
6. ✅ **Fallback mượt mà** - Không còn text kỳ quặc khi thiếu data

### Next Steps:
1. Test notification creation từ backend
2. Verify API response có đầy đủ fields
3. Implement auto-scroll logic ở destination pages
4. Add CSS animations
5. Test end-to-end flow: Create notification → Click → Navigate → Scroll → Highlight

**Notification system giờ professional và user-friendly!** 🎉
