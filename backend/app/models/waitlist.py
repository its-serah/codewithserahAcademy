from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base


class WaitlistEmail(Base):
    __tablename__ = "waitlist_emails"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    approved_at = Column(DateTime(timezone=True))
