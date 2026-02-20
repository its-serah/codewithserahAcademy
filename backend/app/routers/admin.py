from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session, joinedload

from app.dependencies import get_db, require_admin
from app.models.user import User
from app.models.waitlist import WaitlistEmail
from app.models.course import Course
from app.models.module import Module
from app.models.content_block import ContentBlock
from app.schemas.waitlist import WaitlistAdd, WaitlistOut
from app.schemas.course import CourseCreate, CourseUpdate, CourseListItem, CourseDetail
from app.schemas.module import (
    ModuleCreate,
    ModuleUpdate,
    ModuleReorder,
    ModuleDetail,
    ContentBlockCreate,
    ContentBlockUpdate,
    ContentBlockOut,
)
from app.utils.slug import slugify

router = APIRouter(prefix="/api/admin", tags=["admin"])

# ── Waitlist ──


@router.get("/waitlist", response_model=list[WaitlistOut])
def list_waitlist(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """List all emails on the waitlist."""
    return db.query(WaitlistEmail).order_by(WaitlistEmail.id).all()


@router.post("/waitlist", response_model=WaitlistOut, status_code=201)
def add_to_waitlist(
    req: WaitlistAdd, db: Session = Depends(get_db), _: User = Depends(require_admin)
):
    """Add an email to the waitlist. Returns 409 if already present."""
    existing = db.query(WaitlistEmail).filter(WaitlistEmail.email == req.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already on waitlist")
    entry = WaitlistEmail(email=req.email, approved_at=datetime.now(timezone.utc))
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/waitlist/{waitlist_id}", status_code=204)
def remove_from_waitlist(
    waitlist_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Remove an email from the waitlist by ID."""
    entry = db.query(WaitlistEmail).filter(WaitlistEmail.id == waitlist_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(entry)
    db.commit()


# ── Courses ──


@router.get("/courses", response_model=list[CourseListItem])
def admin_list_courses(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """List all courses (published and unpublished) for admin management."""
    courses = (
        db.query(Course)
        .options(joinedload(Course.modules))
        .order_by(Course.created_at.desc())
        .all()
    )
    return [
        CourseListItem(
            id=c.id,
            title=c.title,
            slug=c.slug,
            description=c.description,
            thumbnail_url=c.thumbnail_url,
            is_published=c.is_published,
            created_at=c.created_at,
            module_count=len(c.modules),
        )
        for c in courses
    ]


@router.get("/courses/{course_id}", response_model=CourseDetail)
def admin_get_course(
    course_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Get a course by ID with its modules for admin editing."""
    course = (
        db.query(Course)
        .options(joinedload(Course.modules))
        .filter(Course.id == course_id)
        .first()
    )
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return CourseDetail(
        id=course.id,
        title=course.title,
        slug=course.slug,
        description=course.description,
        thumbnail_url=course.thumbnail_url,
        is_published=course.is_published,
        created_at=course.created_at,
        module_count=len(course.modules),
        modules=course.modules,
    )


@router.post("/courses", response_model=CourseListItem, status_code=201)
def create_course(
    req: CourseCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
):
    """Create a new course. Returns 409 if a course with a similar title already exists."""
    slug = slugify(req.title)
    if db.query(Course).filter(Course.slug == slug).first():
        raise HTTPException(status_code=409, detail="Course with similar title exists")
    course = Course(
        title=req.title,
        slug=slug,
        description=req.description,
        thumbnail_url=req.thumbnail_url,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return CourseListItem(
        id=course.id,
        title=course.title,
        slug=course.slug,
        description=course.description,
        thumbnail_url=course.thumbnail_url,
        is_published=course.is_published,
        created_at=course.created_at,
        module_count=0,
    )


@router.put("/courses/{course_id}", response_model=CourseListItem)
def update_course(
    course_id: int = Path(gt=0),
    *,
    req: CourseUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Update a course's title, description, thumbnail, or publish status."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if req.title is not None:
        course.title = req.title
        course.slug = slugify(req.title)
    if req.description is not None:
        course.description = req.description
    if req.thumbnail_url is not None:
        course.thumbnail_url = req.thumbnail_url
    if req.is_published is not None:
        course.is_published = req.is_published
    db.commit()
    db.refresh(course)
    module_count = db.query(Module).filter(Module.course_id == course.id).count()
    return CourseListItem(
        id=course.id,
        title=course.title,
        slug=course.slug,
        description=course.description,
        thumbnail_url=course.thumbnail_url,
        is_published=course.is_published,
        created_at=course.created_at,
        module_count=module_count,
    )


@router.delete("/courses/{course_id}", status_code=204)
def delete_course(
    course_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Delete a course and all its associated modules and content."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()


# ── Modules ──


@router.get("/modules/{module_id}", response_model=ModuleDetail)
def admin_get_module(
    module_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Get a module with its content blocks for admin editing."""
    module = (
        db.query(Module)
        .options(joinedload(Module.content_blocks))
        .filter(Module.id == module_id)
        .first()
    )
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module


@router.post("/modules", response_model=ModuleDetail, status_code=201)
def create_module(
    req: ModuleCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
):
    """Create a new module in a course. Automatically assigned the next order index."""
    max_order = (
        db.query(Module.order_index)
        .filter(Module.course_id == req.course_id)
        .order_by(Module.order_index.desc())
        .first()
    )
    next_order = (max_order[0] + 1) if max_order else 1
    module = Module(
        course_id=req.course_id,
        title=req.title,
        description=req.description,
        order_index=next_order,
    )
    db.add(module)
    db.commit()
    db.refresh(module)
    return ModuleDetail(
        id=module.id,
        title=module.title,
        description=module.description,
        order_index=module.order_index,
        content_blocks=[],
    )


@router.put("/modules/{module_id}", response_model=ModuleDetail)
def update_module(
    module_id: int = Path(gt=0),
    *,
    req: ModuleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Update a module's title or description."""
    module = (
        db.query(Module)
        .options(joinedload(Module.content_blocks))
        .filter(Module.id == module_id)
        .first()
    )
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    if req.title is not None:
        module.title = req.title
    if req.description is not None:
        module.description = req.description
    db.commit()
    db.refresh(module)
    return module


@router.delete("/modules/{module_id}", status_code=204)
def delete_module(
    module_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Delete a module and all its content blocks."""
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    db.delete(module)
    db.commit()


@router.post("/modules/reorder", status_code=200)
def reorder_modules(
    req: ModuleReorder, db: Session = Depends(get_db), _: User = Depends(require_admin)
):
    """Reorder modules by providing an ordered list of module IDs."""
    for idx, module_id in enumerate(req.module_ids, start=1):
        module = db.query(Module).filter(Module.id == module_id).first()
        if module:
            module.order_index = idx
    db.commit()
    return {"detail": "Reordered"}


# ── Content Blocks ──


@router.post("/content-blocks", response_model=ContentBlockOut, status_code=201)
def create_content_block(
    req: ContentBlockCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Create a new content block (reading or video) in a module."""
    max_order = (
        db.query(ContentBlock.order_index)
        .filter(ContentBlock.module_id == req.module_id)
        .order_by(ContentBlock.order_index.desc())
        .first()
    )
    next_order = (max_order[0] + 1) if max_order else 1
    block = ContentBlock(
        module_id=req.module_id,
        type=req.type,
        title=req.title,
        order_index=next_order,
        markdown_content=req.markdown_content,
        youtube_video_id=req.youtube_video_id,
    )
    db.add(block)
    db.commit()
    db.refresh(block)
    return block


@router.put("/content-blocks/{block_id}", response_model=ContentBlockOut)
def update_content_block(
    block_id: int = Path(gt=0),
    *,
    req: ContentBlockUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Update a content block's title, markdown content, or YouTube video ID."""
    block = db.query(ContentBlock).filter(ContentBlock.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    if req.title is not None:
        block.title = req.title
    if req.markdown_content is not None:
        block.markdown_content = req.markdown_content
    if req.youtube_video_id is not None:
        block.youtube_video_id = req.youtube_video_id
    db.commit()
    db.refresh(block)
    return block


@router.delete("/content-blocks/{block_id}", status_code=204)
def delete_content_block(
    block_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Delete a content block by ID."""
    block = db.query(ContentBlock).filter(ContentBlock.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    db.delete(block)
    db.commit()
