from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str):
    # 🔥 đảm bảo là string + không vượt 72 bytes (bcrypt limit)
    password = str(password).strip()[:72]
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str):
    plain = str(plain).strip()[:72]
    return pwd_context.verify(plain, hashed)