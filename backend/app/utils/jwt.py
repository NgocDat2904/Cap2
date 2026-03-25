from datetime import datetime, timedelta
from jose import jwt, JWTError
from uuid import uuid4

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

#  blacklist lưu token đã logout
blacklist = set()


# Tạo token
def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    jti = str(uuid4())  # ID duy nhất

    to_encode.update({
        "exp": expire,
        "jti": jti
    })

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


#  Decode token + check blacklist
def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # check blacklist
        if payload.get("jti") in blacklist:
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