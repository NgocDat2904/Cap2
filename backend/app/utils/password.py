import bcrypt



def hash_password(plain: str) -> str:
    plain_password = str(plain).strip()[:72].encode("utf-8")
    return bcrypt.hashpw(plain_password, bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    plain_password = str(plain).strip()[:72].encode("utf-8")
    return bcrypt.checkpw(plain_password, hashed.encode("utf-8"))
