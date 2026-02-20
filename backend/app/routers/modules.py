from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session, joinedload

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.course import Course
from app.models.module import Module
from app.models.enrollment import Enrollment
from app.models.module_completion import ModuleCompletion
from app.schemas.module import ModuleWithLock, ModuleDetail

router = APIRouter(prefix="/api", tags=["modules"])


def _get_course_or_404(slug: str, db: Session) -> Course:
    """Fetch a course by slug or raise 404."""
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Course not found"
        )
    return course


def _require_enrollment(user_id: int, course_id: int, db: Session):
    """Raise 403 if user is not enrolled in the course."""
    enrolled = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user_id, Enrollment.course_id == course_id)
        .first()
    )
    if not enrolled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enrolled"
        )


def _is_module_unlocked(user_id: int, module: Module, db: Session) -> bool:
    """Module 1 is always unlocked. Module N requires Module N-1 to be completed."""
    if module.order_index == 1:
        return True
    prev_module = (
        db.query(Module)
        .filter(
            Module.course_id == module.course_id,
            Module.order_index == module.order_index - 1,
        )
        .first()
    )
    if not prev_module:
        return True
    completion = (
        db.query(ModuleCompletion)
        .filter(
            ModuleCompletion.user_id == user_id,
            ModuleCompletion.module_id == prev_module.id,
        )
        .first()
    )
    return completion is not None


@router.get("/courses/{slug}/modules", response_model=list[ModuleWithLock])
def list_modules(
    slug: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List modules for a course with lock/unlock status. Requires enrollment."""
    course = _get_course_or_404(slug, db)
    _require_enrollment(user.id, course.id, db)

    modules = (
        db.query(Module)
        .filter(Module.course_id == course.id)
        .order_by(Module.order_index)
        .all()
    )

    return [
        ModuleWithLock(
            id=m.id,
            title=m.title,
            description=m.description,
            order_index=m.order_index,
            is_unlocked=_is_module_unlocked(user.id, m, db),
        )
        for m in modules
    ]


@router.get("/courses/{slug}/modules/{module_id}", response_model=ModuleDetail)
def get_module(
    slug: str,
    module_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get full module content. Returns 403 if the module is locked."""
    course = _get_course_or_404(slug, db)
    _require_enrollment(user.id, course.id, db)

    module = (
        db.query(Module)
        .options(joinedload(Module.content_blocks))
        .filter(Module.id == module_id, Module.course_id == course.id)
        .first()
    )
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Module not found"
        )

    if not _is_module_unlocked(user.id, module, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Module is locked. Complete the previous module first.",
        )

    return module
