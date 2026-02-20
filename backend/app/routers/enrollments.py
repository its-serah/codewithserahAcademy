from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.module import Module
from app.models.content_block import ContentBlock
from app.models.progress import Progress
from app.schemas.enrollment import EnrollmentOut

router = APIRouter(prefix="/api", tags=["enrollments"])


@router.post("/courses/{slug}/enroll", status_code=201)
def enroll(
    slug: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    """Enroll the current user in a course."""
    course = (
        db.query(Course)
        .filter(Course.slug == slug, Course.is_published == True)
        .first()
    )
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Course not found"
        )

    existing = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user.id, Enrollment.course_id == course.id)
        .first()
    )
    if existing:
        return {"detail": "Already enrolled"}

    db.add(Enrollment(user_id=user.id, course_id=course.id))
    db.commit()
    return {"detail": "Enrolled successfully"}


@router.get("/enrollments", response_model=list[EnrollmentOut])
def my_enrollments(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    """List all courses the current user is enrolled in, with progress."""
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == user.id).all()
    result = []
    for e in enrollments:
        course = db.query(Course).filter(Course.id == e.course_id).first()
        if not course:
            continue
        total_blocks = (
            db.query(ContentBlock)
            .join(Module)
            .filter(Module.course_id == course.id)
            .count()
        )
        completed_blocks = (
            db.query(Progress)
            .join(ContentBlock)
            .join(Module)
            .filter(
                Module.course_id == course.id,
                Progress.user_id == user.id,
                Progress.is_completed == True,
            )
            .count()
        )
        pct = (completed_blocks / total_blocks * 100) if total_blocks > 0 else 0
        result.append(
            EnrollmentOut(
                id=e.id,
                course_id=course.id,
                course_title=course.title,
                course_slug=course.slug,
                enrolled_at=e.enrolled_at,
                progress_percent=round(pct, 1),
            )
        )
    return result
