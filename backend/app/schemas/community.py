from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class PostCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    body: str = Field(min_length=10)
    course_id: Optional[int] = None


class CommentCreate(BaseModel):
    body: str = Field(min_length=1)
    parent_id: Optional[int] = None


class CommentOut(BaseModel):
    id: int
    post_id: int
    user_id: int
    body: str
    parent_id: Optional[int] = None
    created_at: datetime
    author_name: str
    author_emoji: Optional[str] = None
    replies: List["CommentOut"] = []

    model_config = {"from_attributes": True}


CommentOut.model_rebuild()


class PostOut(BaseModel):
    id: int
    user_id: int
    course_id: Optional[int] = None
    title: str
    body: str
    created_at: datetime
    updated_at: datetime
    author_name: str
    author_emoji: Optional[str] = None
    comment_count: int = 0
    like_count: int = 0
    liked_by_me: bool = False
    comments: List[CommentOut] = []

    model_config = {"from_attributes": True}


class LikeToggleResponse(BaseModel):
    liked: bool
    count: int
