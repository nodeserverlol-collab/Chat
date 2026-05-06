# schemes.py
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    role: Optional[str] = "user"  # Добавлено поле role с значением по умолчанию

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    role: Optional[str] = "user"

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    is_active: bool
    role: Optional[str] = None  # Добавлено\

class UserLogin(BaseModel):
    email: str
    password: str
    class Config:
        from_attributes = True