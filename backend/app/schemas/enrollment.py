from datetime import datetime
from pydantic import BaseModel


class EnrollmentOut(BaseModel):
    id: int
    course_id: int
    course_title: str
    course_slug: str
    enrolled_at: datetime
    progress_percent: float = 0.0

    model_config = {"from_attributes": True}
