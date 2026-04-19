from sqlalchemy import (
    Column,
    Integer,
    Text,
    ForeignKey,
    DateTime,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship
from app.database import Base


class ModuleFeedback(Base):
    __tablename__ = "module_feedback"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(
        Integer, ForeignKey("modules.id", ondelete="CASCADE"), nullable=False
    )
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    rating = Column(Integer, nullable=False)  # 1–5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User")

    __table_args__ = (
        UniqueConstraint("module_id", "user_id", name="uq_module_feedback_module_user"),
    )
