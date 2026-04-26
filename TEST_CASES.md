# 🧪 API Integration Test Cases

## Quick Test Commands

### 1. Test Backend API with cURL

```bash
# Get token first (login)
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor@example.com",
    "password": "password123"
  }'

# Set token variable
TOKEN="your_token_here"

# Test: Get instructor courses
curl -X GET http://localhost:8000/instructor/courses \
  -H "Authorization: Bearer $TOKEN"

# Test: Get specific course detail
curl -X GET http://localhost:8000/instructor/courses/{courseId} \
  -H "Authorization: Bearer $TOKEN"
```

---

## Frontend Test Scenarios

### Scenario 1: Browse Courses
**Steps:**
1. Login as instructor
2. Navigate to `/instructor/courses`
3. Wait for courses to load
4. Verify course cards display with:
   - Course title
   - Category badge
   - Student count
   - Lesson count
   - Price
   - Status badge (Published/Draft/Pending)

**Expected Result:** ✅ Courses load from API and display properly

---

### Scenario 2: Search Functionality
**Steps:**
1. On `/instructor/courses` page
2. Type "React" in search box
3. Verify only courses with "React" in title appear
4. Clear search box
5. Verify all courses reappear

**Expected Result:** ✅ Search filters courses in real-time

---

### Scenario 3: Filter by Status
**Steps:**
1. On `/instructor/courses` page
2. Click "Published" button
3. Verify only published courses show
4. Click "Draft" button
5. Verify only draft courses show
6. Click "All" button
7. Verify all courses reappear

**Expected Result:** ✅ Status filter works correctly

---

### Scenario 4: View Course Detail
**Steps:**
1. On `/instructor/courses` page
2. Click "View Details" on any course
3. Wait for page to load
4. Verify URL changed to `/instructor/courses/{courseId}`
5. Verify course header shows:
   - Course title
   - Category
   - Status
   - Student count
   - Duration
   - Thumbnail image
   - Price

**Expected Result:** ✅ Course detail loads and displays all information

---

### Scenario 5: View Lessons/Curriculum
**Steps:**
1. On course detail page
2. Click on "Curriculum" tab (should be selected by default)
3. Wait for lessons to load
4. Verify lesson list shows:
   - Lesson number
   - Lesson title
   - Duration
   - Video icon
5. Click on a lesson to expand
6. Verify accordion shows lesson details

**Expected Result:** ✅ Lessons load and display correctly

---

### Scenario 6: Error Handling - No Token
**Steps:**
1. Clear localStorage (browser console: `localStorage.clear()`)
2. Navigate to `/instructor/courses`
3. Wait for page to render

**Expected Result:** ✅ Error message displays: "Token not found. Please log in again."

---

### Scenario 7: Error Handling - Invalid Course ID
**Steps:**
1. Manually navigate to `/instructor/courses/invalid-id-12345`
2. Wait for page to load

**Expected Result:** ✅ Error message displays: "Failed to load course details"

---

### Scenario 8: Empty State
**Steps:**
1. Create a new instructor account with no courses
2. Login and navigate to `/instructor/courses`
3. Wait for page to load

**Expected Result:** ✅ Empty state message shows: "No courses found" with create course button

---

### Scenario 9: Search + Filter Combined
**Steps:**
1. On `/instructor/courses` page
2. Type "Python" in search
3. Click "Published" filter
4. Verify only published courses with "Python" in title show
5. Click "Draft"
6. Verify only draft courses with "Python" in title show

**Expected Result:** ✅ Both filters work together correctly

---

### Scenario 10: Navigation Test
**Steps:**
1. On `/instructor/courses` page, click "View Details"
2. On detail page, click "Quay lại" (back button)
3. Verify returned to `/instructor/courses`
4. Click "Chỉnh sửa Khóa học" (edit button)
5. Verify navigates to `/instructor/courses/{courseId}/edit`

**Expected Result:** ✅ All navigation works correctly

---

## Performance Test

**Objectives:**
- [ ] Courses load in < 2 seconds
- [ ] Search filters in < 500ms
- [ ] Course detail loads in < 2 seconds
- [ ] No console errors

**Steps:**
1. Open DevTools → Network tab
2. Navigate to `/instructor/courses`
3. Check network response time
4. Perform search
5. Check response time
6. Click course detail
7. Verify load time

---

## Data Consistency Test

**Objectives:**
- [ ] API returns correct data types
- [ ] Numbers are formatted correctly
- [ ] Dates display properly
- [ ] Status mapping is correct

**Verification:**
- Check API response in Network tab
- Verify:
  - `students` is a number
  - `price` is a number with 2 decimals
  - `status` is one of: Draft, Published, Pending, Rejected
  - `duration` is formatted as "Xh Ym"
  - URLs are valid and accessible

---

## Browser Compatibility Test

Test on these browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Mobile Responsiveness Test

- [ ] Test on mobile device (or browser dev tools)
- [ ] Verify course grid is responsive
- [ ] Verify search/filter buttons are accessible
- [ ] Verify course detail page layout
- [ ] Check all buttons are tappable (minimum 44x44px)

---

## Sample Test Data

For testing, use these sample instructor accounts:

```
Email: instructor1@edusync.com
Password: password123
Courses: 5 (mix of Published, Draft, Pending)

Email: instructor2@edusync.com
Password: password123
Courses: 0 (test empty state)
```

---

## Checklist for QA

### Frontend
- [ ] MyCourse.jsx loads and renders
- [ ] MyCourseView.jsx loads and renders
- [ ] No console errors
- [ ] No network errors
- [ ] Loading states work
- [ ] Error states work
- [ ] Search functionality works
- [ ] Filter functionality works
- [ ] Navigation works
- [ ] Responsive design works

### Backend
- [ ] GET /instructor/courses returns correct data
- [ ] GET /instructor/courses/{id} returns correct data
- [ ] Data includes sections and lessons
- [ ] Status mapping is correct
- [ ] Authorization is enforced
- [ ] Error handling works

---

**Test Date:** _____________
**Tester Name:** _____________
**Environment:** Development / Staging / Production
**Result:** ✅ PASS / ❌ FAIL

**Notes:**
_____________________________________________________________________
_____________________________________________________________________
