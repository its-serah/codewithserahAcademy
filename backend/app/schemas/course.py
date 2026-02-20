from datetime import datetime

from pydantic import BaseModel, Field


class CourseBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    thumbnail_url: str | None = None


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    thumbnail_url: str | None = None
    is_published: bool | None = None


class ModuleSummary(BaseModel):
    id: int
    title: str
    description: str | None
    order_index: int

    model_config = {"from_attributes": True}


class CourseListItem(BaseModel):
    id: int
    title: str
    slug: str
    description: str | None
    thumbnail_url: str | None
    is_published: bool
    created_at: datetime
    module_count: int = 0

    model_config = {"from_attributes": True}


class CourseDetail(CourseListItem):
    modules: list[ModuleSummary] = []
