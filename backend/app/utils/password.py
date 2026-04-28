from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    plain = str(plain).strip()[:72]
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    plain = str(plain).strip()[:72]
    return pwd_context.verify(plain, hashed)