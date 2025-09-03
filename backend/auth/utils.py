# backend/auth/utils.py

# Dummy util for future use
def hash_password(password: str) -> str:
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()
