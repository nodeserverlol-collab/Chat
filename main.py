import uvicorn
from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from router import router
from db import engine, Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup - создаем таблицы
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Database tables created/verified")
    yield
    # Shutdown
    await engine.dispose()
    print("🔄 Database connection closed")

app = FastAPI(lifespan=lifespan)

# CORS настройки - РАСШИРЕННЫЕ
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Временно разрешаем все источники для теста
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все методы
    allow_headers=["*"],  # Разрешаем все заголовки
)

app.include_router(router)

@app.get("/")
async def root():
    return {"message": "Server is running"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8080,
        reload=True
    )