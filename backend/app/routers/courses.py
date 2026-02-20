from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.dependencies import get_db
from app.models.course import Course
from app.schemas.course import CourseListItem, CourseDetail

router = APIRouter(prefix="/api/courses", tags=["courses"])


@router.get("", response_model=list[CourseListItem])
def list_courses(db: Session = Depends(get_db)):
    """List all published courses."""
    courses = (
        db.query(Course)
        .options(joinedload(Course.modules))
        .filter(Course.is_published == True)
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


@router.get("/{slug}", response_model=CourseDetail)
def get_course(slug: str, db: Session = Depends(get_db)):
    """Get a published course by slug, including its module list."""
    course = (
        db.query(Course)
        .options(joinedload(Course.modules))
        .filter(Course.slug == slug, Course.is_published == True)
        .first()
    )
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Course not found"
        )
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
