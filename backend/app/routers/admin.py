import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload

logger = logging.getLogger("academy.admin")

from app.dependencies import get_db, require_admin
from app.models.user import User
from app.models.waitlist import WaitlistEmail
from app.models.course import Course
from app.models.module import Module
from app.models.content_block import ContentBlock
from app.models.enrollment import Enrollment
from app.models.progress import Progress
from app.models.feedback import ModuleFeedback
from app.schemas.waitlist import WaitlistAdd, WaitlistOut
from app.schemas.course import CourseCreate, CourseUpdate, CourseListItem, CourseDetail
from app.schemas.feedback import FeedbackOut
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


@router.patch("/modules/{module_id}/lock", status_code=200)
def toggle_module_lock(
    module_id: int = Path(gt=0),
    *,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Toggle the admin lock on a module. Locked modules are inaccessible to students regardless of progress."""
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    module.is_locked = not getattr(module, "is_locked", False)
    db.commit()
    db.refresh(module)
    return {"id": module.id, "is_locked": module.is_locked}


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


@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Return platform-wide analytics for the admin dashboard."""
    try:
        total_students = db.query(User).filter(User.role == "student").count()
        total_enrollments = db.query(Enrollment).count()

        courses = (
            db.query(Course)
            .options(joinedload(Course.modules))
            .order_by(Course.created_at.desc())
            .all()
        )

        course_stats = []
        total_completions = 0

        for course in courses:
            enrolled = (
                db.query(Enrollment).filter(Enrollment.course_id == course.id).count()
            )

            total_blocks = (
                db.query(ContentBlock)
                .join(Module)
                .filter(Module.course_id == course.id)
                .count()
            )

            completed_count = 0
            if total_blocks > 0:
                enrollments = (
                    db.query(Enrollment).filter(Enrollment.course_id == course.id).all()
                )
                for enr in enrollments:
                    done = (
                        db.query(Progress)
                        .join(ContentBlock)
                        .join(Module)
                        .filter(
                            Module.course_id == course.id,
                            Progress.user_id == enr.user_id,
                            Progress.is_completed == True,  # noqa: E712
                        )
                        .count()
                    )
                    if done >= total_blocks:
                        completed_count += 1

            total_completions += completed_count

            feedback_rows = (
                db.query(ModuleFeedback)
                .join(Module)
                .filter(Module.course_id == course.id)
                .all()
            )
            avg_feedback = (
                round(sum(f.rating for f in feedback_rows) / len(feedback_rows), 1)
                if feedback_rows
                else None
            )

            course_stats.append(
                {
                    "id": course.id,
                    "title": course.title,
                    "slug": course.slug,
                    "is_published": course.is_published,
                    "enrolled": enrolled,
                    "completions": completed_count,
                    "completion_rate": (
                        round(completed_count / enrolled * 100, 1) if enrolled else 0
                    ),
                    "avg_feedback": avg_feedback,
                    "feedback_count": len(feedback_rows),
                }
            )

        return {
            "totals": {
                "students": total_students,
                "enrollments": total_enrollments,
                "completions": total_completions,
                "courses": len(courses),
            },
            "courses": course_stats,
        }
    except SQLAlchemyError as e:
        logger.error("Analytics query failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to load analytics")


@router.get("/modules/{module_id}/feedback", response_model=list[FeedbackOut])
def admin_get_module_feedback(
    module_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """List all feedback submitted for a module."""
    entries = (
        db.query(ModuleFeedback)
        .filter(ModuleFeedback.module_id == module_id)
        .order_by(ModuleFeedback.created_at.desc())
        .all()
    )
    return [
        FeedbackOut(
            id=fb.id,
            module_id=fb.module_id,
            user_id=fb.user_id,
            user_name=fb.user.name,
            rating=fb.rating,
            comment=fb.comment,
            created_at=fb.created_at,
            updated_at=fb.updated_at,
        )
        for fb in entries
    ]


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
