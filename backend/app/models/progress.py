from sqlalchemy import Column, Integer, Boolean, ForeignKey, DateTime, UniqueConstraint
from app.database import Base


class Progress(Base):
    __tablename__ = "progress"
    __table_args__ = (UniqueConstraint("user_id", "content_block_id"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    content_block_id = Column(
        Integer, ForeignKey("content_blocks.id", ondelete="CASCADE"), nullable=False
    )
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True))
