# 📚 API Integration Guide - EduSync Instructor Courses

## 🎯 Overview

This document explains the complete API integration for the instructor course management system in EduSync. The frontend now fetches real data from the backend API instead of using mock data.

---

## 🔄 Integrated Pages

### 1. **My Courses Page** (`/instructor/courses`)
**Component:** `MyCourse.jsx`

#### Features:
- ✅ Fetch instructor's courses from API
- ✅ Search by course title or category
- ✅ Filter by status (All, Published, Draft, Pending)
- ✅ Display loading state
- ✅ Display error messages
- ✅ Empty state when no courses exist
- ✅ Link to course detail page
- ✅ Link to edit course

#### API Calls:
```javascript
// Fetch instructor's courses
await getInstructorCoursesAPI(token)
```

#### Response Structure:
```json
[
  {
    "id": "course123",
    "title": "React.js Fundamentals",
    "category": "Frontend Web Development",
    "status": "Published",
    "students": 156,
    "lessons": 24,
    "price": 49.99,
    "image": "https://..."
  },
  ...
]
```

---

### 2. **Course Detail Page** (`/instructor/courses/:courseId`)
**Component:** `MyCourseView.jsx`

#### Features:
- ✅ Fetch course detail from API using URL parameter
- ✅ Display course header with thumbnail, title, and metadata
- ✅ Show lessons/curriculum from fetched data
- ✅ Tab navigation (Curriculum, Q&A, Settings)
- ✅ Loading state while fetching
- ✅ Error handling with fallback UI
- ✅ Empty curriculum state

#### API Calls:
```javascript
// Fetch course detail for instructor
await getInstructorCourseDetailAPI(courseId, token)
```

#### Response Structure:
```json
{
  "id": "course123",
  "title": "Master Python from basics to advanced",
  "description": "...",
  "category": "Data Science",
  "image": "https://...",
  "price": 10,
  "status": "Published",
  "students": 30,
  "duration": "8h 30m",
  "lessonCount": 24,
  "instructor": "Nguyễn Văn A",
  "sections": [
    {
      "id": "section-1",
      "title": "Nội dung khóa học",
      "lessons": [
        {
          "id": "lesson1",
          "title": "What is Python?",
          "duration": "10:30",
          "views": 132,
          "image": "https://...",
          "play_url": "signed-url-to-video"
        },
        ...
      ]
    }
  ],
  "createdAt": "2026-04-20T10:00:00",
  "updatedAt": "2026-04-25T15:30:00"
}
```

---

## 📡 API Endpoints

### Backend Endpoints (Base URL: `http://localhost:8000`)

#### Instructor Endpoints
```
GET  /instructor/courses                    - Get instructor's courses
GET  /instructor/courses/{courseId}         - Get course detail
POST /instructor/courses                    - Create new course
POST /instructor/courses/thumbnail          - Upload thumbnail
PUT  /instructor/courses/{courseId}/submit  - Submit for approval
```

#### Public Endpoints
```
GET /courses                    - Get all published courses (with pagination)
GET /courses/search            - Search courses
GET /courses/filter            - Filter courses
GET /courses/detail/{courseId} - Get course detail (for learners)
GET /courses/top               - Get top courses
```

---

## 🛠️ Frontend API Service

**File:** `src/services/instructorAPI.js`

### Available Functions:

#### Profile Management
```javascript
getInstructorProfileAPI(token)
updateInstructorProfileAPI(data, token)
```

#### Courses Management
```javascript
getInstructorCoursesAPI(token)
getInstructorCourseDetailAPI(courseId, token)
createCourseAPI(courseData, token)
uploadCourseThumbnailAPI(file, token)
submitCourseAPI(courseId, token)
```

#### Public Courses
```javascript
getCourseDetailAPI(courseId)  // No token required
```

---

## 🔐 Authentication

All instructor API calls require an **Authorization header** with JWT token:

```javascript
headers: {
  Authorization: `Bearer ${token}`,
}
```

**Token Storage:** `localStorage.getItem("token")`

---

## 🧪 Testing Checklist

### Prerequisites
1. ✅ Backend server running at `http://localhost:8000`
2. ✅ Frontend running at `http://localhost:5173`
3. ✅ Logged in as instructor with valid token

### Test Cases

#### Test 1: Load Instructor Courses
```bash
1. Go to /instructor/courses
2. Wait for loading spinner to disappear
3. Verify courses are displayed in grid
4. Check search functionality
5. Check filter buttons (All, Published, Draft, Pending)
```

#### Test 2: Course Detail Page
```bash
1. Click "View Details" on any course card
2. Verify page URL is /instructor/courses/{courseId}
3. Wait for loading state
4. Verify course header displays thumbnail and info
5. Verify lessons are displayed in curriculum tab
6. Check other tabs (Q&A, Settings)
```

#### Test 3: Error Handling
```bash
1. Logout and try to access /instructor/courses
2. Verify error message about missing token
3. Try accessing invalid course ID
4. Verify appropriate error message
```

#### Test 4: Search & Filter
```bash
1. Type in search box to filter courses by title
2. Select different status filters
3. Verify both work together
```

---

## ⚙️ Configuration

### API Base URL
- **Instructor API:** `http://localhost:8000/instructor`
- **Course API:** `http://localhost:8000/courses`

To change base URL, edit `src/services/instructorAPI.js`:
```javascript
const API_URL = "http://localhost:8000/instructor";
const COURSE_API_URL = "http://localhost:8000/courses";
```

---

## 🐛 Troubleshooting

### Issue: "Token not found" error
**Solution:** Login first at instructor login page, token should be saved to localStorage

### Issue: Courses not loading
**Solution:** 
1. Check browser console for network errors
2. Verify backend server is running
3. Check CORS settings in backend

### Issue: Course detail page shows "Failed to load"
**Solution:**
1. Verify course ID in URL
2. Make sure course belongs to logged-in instructor
3. Check backend logs for errors

### Issue: Images not loading
**Solution:**
1. Check image URL in response
2. Verify Cloudinary or GCS is configured
3. Check CORS headers

---

## 📝 Backend Response Format

### Status Mapping
The backend maps database status values to frontend display:
- `DRAFT` → `"Draft"`
- `PENDING` → `"Pending"`
- `APPROVED` → `"Published"`
- `REJECTED` → `"Rejected"`

### Date Format
Dates are returned in ISO 8601 format:
```
"2026-04-25T15:30:00"
```

---

## 🚀 Next Steps

### Features to Implement

1. **Delete Course**
   - Add DELETE endpoint
   - Add delete button with confirmation

2. **Edit Course**
   - Update course information
   - Update thumbnail

3. **Quiz Management**
   - Review AI-generated quizzes
   - Edit and publish quizzes

4. **Q&A Feature**
   - View student questions
   - Reply to questions

5. **Publish/Draft Toggle**
   - Change course status
   - Update course pricing

---

## 📚 Code Examples

### Example: Fetch Instructor Courses with Error Handling
```jsx
import { getInstructorCoursesAPI } from "../../services/instructorAPI";

useEffect(() => {
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await getInstructorCoursesAPI(token);
      setMyCourses(response);
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to load courses");
    }
  };
  
  fetchCourses();
}, []);
```

### Example: Fetch Course Detail with URL Parameter
```jsx
import { useParams } from "react-router-dom";
import { getInstructorCourseDetailAPI } from "../../services/instructorAPI";

const { courseId } = useParams();

useEffect(() => {
  const fetchDetail = async () => {
    const token = localStorage.getItem("token");
    const response = await getInstructorCourseDetailAPI(courseId, token);
    setCourseDetail(response);
    setLessonsList(response.sections[0]?.lessons || []);
  };
  
  fetchDetail();
}, [courseId]);
```

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs
3. Check browser console for errors
4. Verify API response structure

---

**Last Updated:** April 25, 2026
**Version:** 1.0
