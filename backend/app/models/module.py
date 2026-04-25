from sqlalchemy import (
    Boolean,
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.database import Base


class Module(Base):
    __tablename__ = "modules"
    __table_args__ = (UniqueConstraint("course_id", "order_index"),)

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(
        Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    title = Column(String, nullable=False)
    description = Column(Text)
    order_index = Column(Integer, nullable=False)
    is_locked = Column(Boolean, nullable=False, default=False, server_default="false")

    course = relationship("Course", back_populates="modules")
    content_blocks = relationship(
        "ContentBlock",
        back_populates="module",
        order_by="ContentBlock.order_index",
        cascade="all, delete-orphan",
    )
