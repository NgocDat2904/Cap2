from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
load_dotenv()

from app.modules.auth.auth_controller import router as auth_router
from app.modules.user.user_controller import router as user_router
from app.modules.instructor.instructor_controller import router as instructor_router
from app.modules.course.course_controller import router as course_router
from app.modules.video.video_controller import router as video_router
from app.modules.course_content.content_controller import router as content_router
from app.modules.ai.ai_controller import router as ai_router
from app.modules.learning.learning_controller import router as learning_router
from app.modules.dashboard.dashboard_controller import router as dashboard_router
from app.modules.payment.payment_controller import (
    router as payment_router
)
from app.modules.questions.question_controller import router as question_router


# =========================
# CREATE FASTAPI APP
# =========================
app = FastAPI(
    title="EduSync API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


# =========================
# CORS CONFIG
# =========================
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# =========================
# ROUTERS
# =========================
app.include_router(auth_router, prefix="")
app.include_router(user_router, prefix="")
app.include_router(instructor_router, prefix="")
app.include_router(course_router, prefix="")
app.include_router(video_router, prefix="")
app.include_router(content_router, prefix="")
app.include_router(ai_router, prefix="")
app.include_router(learning_router, prefix="")
app.include_router(dashboard_router)
app.include_router(payment_router)
app.include_router(question_router)


# =========================
# HEALTH CHECK
# =========================
@app.get("/")
def root():
    return {
        "status": "success",
        "message": "EduSync Backend Running"
    }


@app.get("/ping")
def ping():
    return {"message": "pong"}