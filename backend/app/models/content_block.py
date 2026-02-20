from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class ContentBlock(Base):
    __tablename__ = "content_blocks"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(
        Integer, ForeignKey("modules.id", ondelete="CASCADE"), nullable=False
    )
    type = Column(String, nullable=False)  # "reading" | "video"
    title = Column(String)
    order_index = Column(Integer, nullable=False)
    markdown_content = Column(Text)
    youtube_video_id = Column(String)

    module = relationship("Module", back_populates="content_blocks")
