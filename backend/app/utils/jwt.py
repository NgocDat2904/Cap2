from datetime import datetime, timedelta
from jose import jwt, JWTError

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# 🔥 tạo token
def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow()  # 🔥 thêm issued at
    })

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# 🔥 decode token
def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # kiểm tra dữ liệu bắt buộc
        if "email" not in payload:
            return None

        return payload

    except JWTError:
        return None