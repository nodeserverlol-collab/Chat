import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from db import Base

DATABASE_URL = "sqlite+aiosqlite:///payment.db"


async def init_db():
    # Удаляем старую базу данных
    if os.path.exists("payment.db"):
        os.remove("payment.db")
        print("🗑️ Old database removed")

    engine = create_async_engine(DATABASE_URL, echo=True)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Tables created successfully!")

        # Проверяем созданные таблицы
        result = await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
        tables = result.fetchall()
        print("📋 Tables in database:", [t[0] for t in tables])

    await engine.dispose()
    print("🎉 Database initialization complete!")


if __name__ == "__main__":
    asyncio.run(init_db())