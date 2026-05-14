# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EduSync is a full-stack e-learning platform with AI-powered features for course management, video learning, and interactive content generation. The system consists of:

- **Backend**: FastAPI (Python) with MongoDB database
- **Frontend**: React + Vite with React Router and Tailwind CSS
- **Cloud Services**: Google Cloud Storage (GCS) for video storage, Gemini AI for content generation

## Development Commands

### Backend (FastAPI)

```bash
# From project root
cd backend

# Activate virtual environment
source .venv/Scripts/activate  # Windows Git Bash
# or: .venv\Scripts\activate.bat  # Windows CMD

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload

# Server runs at: http://localhost:8000
# API docs available at: http://localhost:8000/docs
```

### Frontend (React + Vite)

```bash
# From project root
cd FE_EduSync

# Install dependencies
npm install

# Run development server
npm run dev

# Server runs at: http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Architecture

### Backend Architecture (FastAPI)

**Entry Point**: `backend/main.py` imports from `backend/app/main.py`

**Structure**:
- `app/main.py` - FastAPI application initialization, CORS config, router registration
- `app/modules/` - Feature modules organized by domain (auth, course, instructor, learner, ai, etc.)
- `app/database/mongodb.py` - MongoDB client initialization
- `app/storage/gcs_client.py` - Google Cloud Storage client for video uploads
- `app/middleware/` - Authentication and authorization middleware
- `app/utils/` - Shared utilities

**Module Pattern**: Each module follows a layered architecture:
- `*_controller.py` - API routes (FastAPI routers)
- `*_service.py` - Business logic
- `*_repository.py` - Database access layer
- `*_model.py` or `*_schema.py` - Data models and validation (Pydantic)

**Key Modules**:
- `auth/` - Login, registration, JWT token management
- `instructor/` - Instructor profile, course management for instructors
- `course/` - Public course listings, course CRUD
- `learner/` or `learning/` - Student enrollment, progress tracking
- `ai/` - Gemini AI integration for summaries, quizzes, mindmaps, chat
- `video/` - Video upload (GCS signed URLs), transcript generation (STT)
- `admin/` - Course approval queue, user management, system settings
- `payment/` - Payment processing
- `notifications/` - Notification system
- `questions/` - Q&A for courses

### Frontend Architecture (React)

**Entry Point**: `FE_EduSync/src/main.jsx` → `App.jsx` → `routes/AppRoutes.jsx`

**Structure**:
- `src/routes/` - Route configuration (AppRoutes, InstructorRoutes, LearnerRoutes, AdminRoutes, ProtectedRoute)
- `src/pages/` - Page components organized by role:
  - `Instructor/` - Instructor dashboard, course management, profile
  - `Learner/` - Student dashboard, course catalog, video player
  - `Admin/` - Admin dashboard, approval queue, user management
- `src/services/` - API client modules (axios-based):
  - `instructorAPI.js` - Instructor endpoints
  - `courseAPI.js` - Public course endpoints
  - `learnerCourseAPI.js` - Learner course endpoints
  - `aiAPI.js` - AI feature endpoints
  - `authService.js` - Authentication
  - `userAPI.js` - User management
  - `adminCourseAPI.js` - Admin course management
- `src/components/` - Reusable UI components
- `src/layouts/` - Layout wrappers
- `src/api/` - Additional API utilities

**Routing**:
- `/` - Public landing page
- `/instructor/*` - Instructor dashboard and course management
- `/admin/*` - Admin panel
- `/*` - Learner pages (default catch-all)

**Authentication**: JWT tokens stored in `localStorage` with key `"token"`. Protected routes use `ProtectedRoute` component that checks for valid token.

## Key Features & Implementation Details

### Video Upload & Storage (GCS)

Videos are uploaded directly to Google Cloud Storage using signed URLs:

1. Frontend requests upload URL from `/instructor/videos/upload-url`
2. Backend generates signed URL via `GCSClient.generate_signed_url()`
3. Frontend uploads video directly to GCS using the signed URL
4. Frontend calls `/instructor/videos` with video metadata
5. Backend saves video document to MongoDB with GCS storage path

**Video Playback**: Use `GCSClient.generate_read_signed_url()` to generate temporary signed URLs for video streaming (expires in 168 hours by default).

### AI Features (Gemini Integration)

**Module**: `backend/app/modules/ai/`

AI features use Google Gemini API (`google-genai` package) with caching to reduce API calls:

- **Chat**: Context-aware Q&A about video lessons (`/learner/ai/chat-by-video`)
- **Summary**: Lesson summaries in Vietnamese or English (`/learner/ai/summary-by-video`)
- **Quiz**: Auto-generated multiple-choice questions (`/learner/ai/quiz-by-video`)
- **Mindmap**: Markmap-formatted mindmaps (`/learner/ai/mindmap-by-video`)
- **Timeline**: Timeline visualization of lesson content (`/learner/ai/timeline-by-video`)

**Caching Strategy**:
- AI responses cached in `videos.ai_cache` field in MongoDB
- Mindmaps and summaries have dedicated collections (`ai_mindmaps`, `ai_summaries`) for faster retrieval
- Cache keys use language and parameters to support multilingual content
- Fast GET endpoints (`/learner/ai/mindmap/{video_id}`, `/learner/ai/summary/{video_id}`) return cached data without AI calls

**Transcript Requirement**: All AI features require video transcript. Generate via `/instructor/videos/{video_id}/transcript` which uses STT service (`faster-whisper`).

### Course Status Workflow

Courses follow an approval workflow:

1. **DRAFT** - Instructor creates course, not visible to learners
2. **PENDING** - Instructor submits for review (`/instructor/courses/{courseId}/submit`)
3. **APPROVED** - Admin approves, course becomes "Published" to learners
4. **REJECTED** - Admin rejects, instructor can revise

**Status Mapping**: Backend stores `DRAFT/PENDING/APPROVED/REJECTED` but frontend displays as `Draft/Pending/Published/Rejected`.

### User Roles & Authentication

Three role types with separate authentication flows:

- **learner** - Students who enroll in courses
- **instructor** - Content creators who manage courses
- **admin** - Platform administrators who approve courses and manage users

**Middleware**: `app/middleware/auth_middleware.py` provides `require_role()` dependency for FastAPI routes to enforce role-based access control.

**Token Storage**: Frontend stores JWT in `localStorage.getItem("token")` and includes in `Authorization: Bearer {token}` header for all authenticated requests.

## Database Schema (MongoDB)

**Collections**:
- `users` - User accounts (learners, instructors, admins)
- `courses` - Course metadata, sections, pricing
- `videos` - Video metadata, GCS paths, transcripts, ai_cache
- `lessons` - Individual lessons within courses
- `enrollments` - Student course enrollments
- `ai_mindmaps` - Pre-generated mindmaps for fast retrieval
- `ai_summaries` - Pre-generated summaries for fast retrieval
- `payments` - Payment transactions
- `notifications` - User notifications
- `questions` - Q&A threads for courses

**ObjectId**: MongoDB uses BSON ObjectIds. Backend validates with `ObjectId.is_valid()` and converts strings to `ObjectId()` when querying.

## Environment Configuration

### Backend `.env` (backend/.env)

Required variables:
```
MONGO_URL=mongodb+srv://...
GCS_KEY_PATH=key.json
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
JWT_SECRET=your_jwt_secret
```

**GCS Credentials**: Place service account key at `backend/key.json` (path specified in `GCS_KEY_PATH`).

### Frontend

Base URL hardcoded in service files:
- `instructorAPI.js`: `http://localhost:8000/instructor`
- `courseAPI.js`: `http://localhost:8000/courses`
- Other services follow similar pattern

**CORS**: Backend allows `http://localhost:5173`, `http://localhost:5174`, and `127.0.0.1` variants.

## Testing

### Manual Testing

Reference `API_INTEGRATION_GUIDE.md` and `TEST_CASES.md` for:
- API endpoint documentation
- Frontend integration test scenarios
- Search/filter functionality verification
- Error handling validation

### API Testing (cURL)

```bash
# Get instructor courses
curl -X GET http://localhost:8000/instructor/courses \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get course detail
curl -X GET http://localhost:8000/instructor/courses/{courseId} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### API Documentation

Interactive API docs available at `http://localhost:8000/docs` (Swagger UI) when backend is running.

## Common Development Patterns

### Adding a New Endpoint

1. Define Pydantic schema in `*_schema.py`
2. Add business logic to `*_service.py`
3. Add database queries to `*_repository.py` (if needed)
4. Add route handler to `*_controller.py`
5. Register router in `app/main.py` if new module
6. Create frontend API function in appropriate `src/services/*.js` file
7. Use API function in React component with error handling

### Role-Based Route Protection (Backend)

```python
from app.middleware.auth_middleware import require_role

@router.get("/instructor/courses")
async def get_courses(user=Depends(require_role(["instructor"]))):
    # user dict contains: {"id": "...", "role": "instructor", "email": "..."}
    return ...
```

### Frontend API Calls with Authentication

```javascript
import { getInstructorCoursesAPI } from "../../services/instructorAPI";

const token = localStorage.getItem("token");
const courses = await getInstructorCoursesAPI(token);
```

### Error Handling Pattern

Backend uses FastAPI `HTTPException`:
```python
from fastapi import HTTPException

if not video:
    raise HTTPException(404, "Video not found")
```

Frontend catches in try/catch:
```javascript
try {
  const data = await someAPI(token);
} catch (error) {
  setError(error.response?.data?.detail || "Failed to load");
}
```

## Important Notes

- **Video Storage**: Videos stored in GCS bucket `edusync-videos-c2se-01`, not MongoDB
- **Lazy MongoDB Connection**: Client uses `connect=False` for lazy connection (see `app/database/mongodb.py`)
- **AI Fallbacks**: `gemini_service.py` includes fallback responses if `GEMINI_API_KEY` not set
- **Transcript Required for AI**: All AI features require video transcript - generate via STT endpoint first
- **Frontend Build**: Vite uses ES modules (`"type": "module"` in package.json)
- **Status Mapping**: Backend status values differ from frontend display labels (see API_INTEGRATION_GUIDE.md)

## Git Workflow

Current branch: `devNTMen`
Main branch: `main`

Modified files in working directory:
- `FE_EduSync/src/pages/Admin/UserManagement.jsx`
- `FE_EduSync/src/pages/Instructor/EditCourse.jsx`
- `FE_EduSync/src/services/userAPI.js`
