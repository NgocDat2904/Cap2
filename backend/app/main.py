from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.modules.auth.auth_controller import router as auth_router

app = FastAPI()

# Cấu hình CORS hỗ trợ phát triển (có thể cấu hình bằng biến môi trường khi cần)
from os import getenv
frontend_origins = getenv(
    "FRONTEND_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký các route sau khi đã cấu hình Middleware
app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "EduSync Backend Running"}