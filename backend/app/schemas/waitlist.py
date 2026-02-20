from datetime import datetime
from pydantic import BaseModel, EmailStr


class WaitlistAdd(BaseModel):
    email: EmailStr


class WaitlistOut(BaseModel):
    id: int
    email: str
    approved_at: datetime | None

    model_config = {"from_attributes": True}
