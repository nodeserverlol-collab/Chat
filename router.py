import os
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, WebSocket, WebSocketDisconnect
from authx import AuthX, AuthXConfig, TokenPayload
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from dotenv import load_dotenv
from db import get_db, Users, Message
from schemes import UserRegister, UserLogin
from payment_scripe import create_link_stripe
from passlib.context import CryptContext
import jwt
import json

load_dotenv()

# Конфигурация AuthX
config = AuthXConfig()
config.JWT_SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
config.JWT_ACCESS_COOKIE_NAME = "access_token"
config.JWT_REFRESH_COOKIE_NAME = "refresh_token"
config.JWT_TOKEN_LOCATION = ["cookies", "headers"]
config.JWT_HEADER_NAME = "Authorization"
config.JWT_HEADER_TYPE = "Bearer"
config.JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)

# Создаем security
security = AuthX(config=config)
router = APIRouter(prefix="/api/auth", tags=["authentication"])

# Хеширование паролей
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")


def hash_password(password: str) -> str:
    if len(password) > 72:
        password = password[:72]
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if len(plain_password) > 72:
        plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)


# Функция для декодирования JWT токена (своя)
def decode_jwt_token(token: str):
    try:
        secret_key = os.getenv("SECRET_KEY", "your-secret-key-here")
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        print("Token expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"Invalid token: {e}")
        return None


# Хранилище активных подключений
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.users: dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.users[websocket] = username
        await self.broadcast_user_list()

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.users:
            del self.users[websocket]

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except:
                pass

    async def broadcast_user_list(self):
        user_list = list(self.users.values())
        await self.broadcast({
            "type": "user_list",
            "users": user_list
        })


manager = ConnectionManager()


# Функция для получения пользователя по токену
async def get_user_from_token(token: str, db: AsyncSession):
    try:
        # Используем свою функцию декодирования
        payload = decode_jwt_token(token)
        if payload and 'sub' in payload:
            user_id = int(payload['sub'])
            print(f"Looking for user with id: {user_id}")
            result = await db.execute(select(Users).where(Users.id == user_id))
            user = result.scalar_one_or_none()
            if user:
                print(f"✅ User found: {user.username}")
                return user
            else:
                print(f"❌ User not found with id: {user_id}")
        else:
            print(f"❌ Invalid payload: {payload}")
    except Exception as e:
        print(f"Token decode error: {e}")
        import traceback
        traceback.print_exc()
    return None


# ============= ЭНДПОИНТЫ =============

@router.post("/register")
async def register(
        data: UserRegister,
        response: Response,
        db: AsyncSession = Depends(get_db)
):
    # Проверка email
    result = await db.execute(select(Users).where(Users.email == data.email))
    existing_email = result.scalar_one_or_none()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    # Проверка username
    result_user = await db.execute(select(Users).where(Users.username == data.username))
    existing_username = result_user.scalar_one_or_none()

    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # Создание пользователя
    hashed_password = hash_password(data.password)
    new_user = Users(
        username=data.username,
        email=data.email,
        hashed_password=hashed_password
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Создание JWT токена
    access_token = security.create_access_token(
        uid=str(new_user.id),
        user_claims={
            "email": new_user.email,
            "username": new_user.username
        }
    )

    # Установка cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=1800,
        path="/",
        secure=False,
        httponly=False,
        samesite="lax"
    )

    return {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "access_token": access_token,
        "token_type": "bearer",
        "message": "User created successfully"
    }


@router.post("/login")
async def login(
        data: UserLogin,
        response: Response,
        db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Users).where(Users.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = security.create_access_token(
        uid=str(user.id),
        user_claims={
            "email": user.email,
            "username": user.username
        }
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=1800,
        path="/",
        secure=False,
        httponly=False,
        samesite="lax"
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "username": user.username,
        "message": "Login successful"
    }


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logout successful"}


@router.get("/profile")
async def profile(
        payload: TokenPayload = Depends(security.access_token_required),
        db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Users).where(Users.id == int(payload.sub)))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_active": user.is_active if hasattr(user, 'is_active') else True
    }


@router.get("/payment")
async def create_payment(
        payload: TokenPayload = Depends(security.access_token_required),
        db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Users).where(Users.id == int(payload.sub)))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    payment_url = create_link_stripe(
        amount=1000,
        currency="usd",
        product_name=f"Payment for {user.username}"
    )

    if payment_url:
        return {
            "success": True,
            "payment_url": payment_url,
            "amount": 10.00,
            "currency": "USD",
            "message": "Payment link created successfully"
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment link"
        )


# Добавь в конец router.py, перед WebSocket

# Модели для платежей
class PaymentRequest(BaseModel):
    plan_type: str  # 'premium' or 'basic'
    success_url: str
    cancel_url: str


@router.post("/create-payment")
async def create_payment(
        data: PaymentRequest,
        payload: TokenPayload = Depends(security.access_token_required),
        db: AsyncSession = Depends(get_db)
):
    """Создание платежа через Stripe"""

    result = await db.execute(select(Users).where(Users.id == int(payload.sub)))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Сумма в зависимости от плана
    amounts = {
        "premium": 49900,  # 499 рублей в копейках
        "basic": 19900,
    }

    amount = amounts.get(data.plan_type, 49900)

    payment_url = create_link_stripe(
        amount=amount,
        currency="rub",
        product_name=f"Premium subscription for {user.username}",
        success_url=data.success_url,
        cancel_url=data.cancel_url
    )

    if payment_url:
        return {
            "success": True,
            "payment_url": payment_url,
            "amount": amount / 100,
            "currency": "RUB",
            "message": "Payment link created successfully"
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment link"
        )


@router.get("/subscription")
async def get_subscription(
        payload: TokenPayload = Depends(security.access_token_required),
        db: AsyncSession = Depends(get_db)
):
    """Получение информации о подписке пользователя"""

    result = await db.execute(select(Users).where(Users.id == int(payload.sub)))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Здесь нужно получить данные о подписке из БД
    # Пока возвращаем заглушку
    return {
        "is_active": False,
        "plan_name": "free",
        "expires_at": None
    }


@router.post("/cancel-subscription")
async def cancel_subscription(
        payload: TokenPayload = Depends(security.access_token_required),
        db: AsyncSession = Depends(get_db)
):
    """Отмена подписки"""

    # Здесь логика отмены подписки
    return {"message": "Subscription cancelled successfully"}

# ============= WEBSOCKET ЧАТ =============

@router.websocket("/ws")
async def websocket_endpoint(
        websocket: WebSocket,
        db: AsyncSession = Depends(get_db)
):
    print("🔌 New WebSocket connection attempt")

    token = websocket.query_params.get("token")
    print(f"Token received: {token[:50]}..." if token else "No token")

    if not token:
        print("❌ No token provided")
        await websocket.close(code=1008, reason="No token provided")
        return

    user = await get_user_from_token(token, db)
    if not user:
        print("❌ Invalid token or user not found")
        await websocket.close(code=1008, reason="Invalid token")
        return

    print(f"✅ User authenticated: {user.username}")
    await manager.connect(websocket, user.username)

    # Отправляем последние сообщения
    try:
        result = await db.execute(
            select(Message)
            .order_by(Message.created_at.desc())
            .limit(50)
        )
        old_messages = result.scalars().all()

        print(f"📨 Sending {len(old_messages)} old messages")

        for msg in reversed(old_messages):
            await websocket.send_text(json.dumps({
                "type": "old_message",
                "username": msg.username,
                "content": msg.content,
                "created_at": msg.created_at.isoformat() if msg.created_at else datetime.now().isoformat()
            }))
    except Exception as e:
        print(f"Error loading messages: {e}")

    try:
        while True:
            data = await websocket.receive_text()
            print(f"📩 Received message from {user.username}: {data[:50]}...")

            try:
                message_data = json.loads(data)
                content = message_data.get("content", "")

                if content:
                    new_message = Message(
                        username=user.username,
                        user_id=user.id,
                        content=content,
                        created_at=datetime.now()
                    )
                    db.add(new_message)
                    await db.commit()

                    await manager.broadcast({
                        "type": "new_message",
                        "id": new_message.id,
                        "username": user.username,
                        "content": content,
                        "created_at": datetime.now().isoformat()
                    })
                    print(f"✅ Message broadcasted")
            except json.JSONDecodeError as e:
                print(f"Invalid JSON: {e}")

    except WebSocketDisconnect:
        print(f"User {user.username} disconnected")
        manager.disconnect(websocket)
        await manager.broadcast_user_list()
    except Exception as e:
        print(f"WebSocket error: {e}")
        import traceback
        traceback.print_exc()
