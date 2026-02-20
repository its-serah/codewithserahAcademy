from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint, func
from app.database import Base


class ModuleCompletion(Base):
    __tablename__ = "module_completions"
    __table_args__ = (UniqueConstraint("user_id", "module_id"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    module_id = Column(
        Integer, ForeignKey("modules.id", ondelete="CASCADE"), nullable=False
    )
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
