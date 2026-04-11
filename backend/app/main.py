from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.mongodb import db

from app.modules.auth.auth_controller import router as auth_router
from app.modules.user.user_controller import router as user_router
from app.modules.instructor.instructor_controller import router as instructor_router
from app.modules.course.course_controller import router as course_router  # 👈 thêm dòng này

app = FastAPI()

# CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include routers
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(instructor_router)
app.include_router(course_router)  # 👈 thêm dòng này

@app.get("/")
def root():
    return {"message": "EduSync Backend Running"}