from datetime import datetime
from pydantic import BaseModel, Field


class FeedbackSubmit(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = Field(None, max_length=1000)


class FeedbackOut(BaseModel):
    id: int
    module_id: int
    user_id: int
    user_name: str
    rating: int
    comment: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
