import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt
from app.core.config import settings

PASSWORD_SALT = "intelligence_fusion_salt_2026"

def get_password_hash(password: str) -> str:
    """
    Computes secure PBKDF2 HMAC SHA-256 password hash (100,000 iterations).
    """
    if not password:
        return ""
    return hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        PASSWORD_SALT.encode("utf-8"),
        100000
    ).hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Strict constant-time cryptographic verification of submitted password
    against the stored PBKDF2 hash.
    """
    if not plain_password or not hashed_password:
        return False
    computed_hash = get_password_hash(plain_password)
    return hmac.compare_digest(computed_hash, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except Exception:
        return None
