from typing import Literal

from pydantic import BaseModel, Field


class ContentBlockOut(BaseModel):
    id: int
    type: str
    title: str | None
    order_index: int
    markdown_content: str | None = None
    youtube_video_id: str | None = None

    model_config = {"from_attributes": True}


class ModuleWithLock(BaseModel):
    id: int
    title: str
    description: str | None
    order_index: int
    is_unlocked: bool

    model_config = {"from_attributes": True}


class ModuleDetail(BaseModel):
    id: int
    title: str
    description: str | None
    order_index: int
    content_blocks: list[ContentBlockOut] = []

    model_config = {"from_attributes": True}


class ModuleCreate(BaseModel):
    course_id: int = Field(gt=0)
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None


class ModuleUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None


class ModuleReorder(BaseModel):
    module_ids: list[int] = Field(min_length=1)


class ContentBlockCreate(BaseModel):
    module_id: int = Field(gt=0)
    type: Literal["reading", "video"]
    title: str | None = Field(default=None, max_length=255)
    markdown_content: str | None = None
    youtube_video_id: str | None = Field(default=None, max_length=20)


class ContentBlockUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    markdown_content: str | None = None
    youtube_video_id: str | None = Field(default=None, max_length=20)
