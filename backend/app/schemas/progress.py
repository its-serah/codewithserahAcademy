from datetime import datetime
from pydantic import BaseModel


class ProgressOut(BaseModel):
    content_block_id: int
    is_completed: bool
    completed_at: datetime | None

    model_config = {"from_attributes": True}


class CourseProgressOut(BaseModel):
    total_blocks: int
    completed_blocks: int
    progress: list[ProgressOut]
