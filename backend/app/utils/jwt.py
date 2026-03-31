from datetime import datetime, timedelta
from jose import jwt, JWTError
from uuid import uuid4

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

blacklist = set()

#  tạo token
def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    jti = str(uuid4()) 

    to_encode.update({
        "exp": expire,
        "jti": jti,
        "iat": datetime.utcnow()  # 🔥 thêm issued at

    })

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


#  decode token
def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # ❗ kiểm tra token đã logout chưa (THÊM MỚI)
        if payload.get("jti") in blacklist:
            return None

        # kiểm tra dữ liệu bắt buộc (GIỮ NGUYÊN)
        if "email" not in payload:
            return None

        return payload

    except JWTError:
        return None
    

#  Logout (revoke token)
def revoke_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        jti = payload.get("jti")
        blacklist.add(jti)
    except JWTError:
        pass