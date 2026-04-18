from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=True, index=True)
    certificate_name = Column(String, nullable=True)
    role = Column(String, nullable=False, default="student")
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False, nullable=False, server_default="false")
    avatar_emoji = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
