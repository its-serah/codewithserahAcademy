from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.content_block import ContentBlock
from app.models.module import Module
from app.models.enrollment import Enrollment
from app.models.progress import Progress
from app.models.module_completion import ModuleCompletion
from app.schemas.progress import ProgressOut, CourseProgressOut

router = APIRouter(prefix="/api/progress", tags=["progress"])


def _require_enrollment_for_block(user_id: int, block: ContentBlock, db: Session):
    """Verify the user is enrolled in the course that owns this content block."""
    module = db.query(Module).filter(Module.id == block.module_id).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Module not found"
        )
    enrolled = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user_id, Enrollment.course_id == module.course_id)
        .first()
    )
    if not enrolled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enrolled in this course"
        )


@router.post("/{block_id}/complete", response_model=ProgressOut)
def complete_block(
    block_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Mark a content block as completed. Auto-completes the module when all blocks are done."""
    block = db.query(ContentBlock).filter(ContentBlock.id == block_id).first()
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Block not found"
        )

    _require_enrollment_for_block(user.id, block, db)

    prog = (
        db.query(Progress)
        .filter(Progress.user_id == user.id, Progress.content_block_id == block_id)
        .first()
    )
    if prog and prog.is_completed:
        return prog

    now = datetime.now(timezone.utc)
    if prog:
        prog.is_completed = True
        prog.completed_at = now
    else:
        prog = Progress(
            user_id=user.id,
            content_block_id=block_id,
            is_completed=True,
            completed_at=now,
        )
        db.add(prog)

    db.flush()

    # Auto-check module completion
    module = db.query(Module).filter(Module.id == block.module_id).first()
    all_block_ids = [
        b.id
        for b in db.query(ContentBlock.id)
        .filter(ContentBlock.module_id == module.id)
        .all()
    ]
    completed_count = (
        db.query(Progress)
        .filter(
            Progress.user_id == user.id,
            Progress.content_block_id.in_(all_block_ids),
            Progress.is_completed == True,
        )
        .count()
    )

    if completed_count == len(all_block_ids):
        existing = (
            db.query(ModuleCompletion)
            .filter(
                ModuleCompletion.user_id == user.id,
                ModuleCompletion.module_id == module.id,
            )
            .first()
        )
        if not existing:
            db.add(ModuleCompletion(user_id=user.id, module_id=module.id))

    db.commit()
    db.refresh(prog)
    return prog


@router.get("/course/{course_id}", response_model=CourseProgressOut)
def course_progress(
    course_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get the current user's progress for all content blocks in a course."""
    all_block_ids = [
        b.id
        for b in db.query(ContentBlock.id)
        .join(Module)
        .filter(Module.course_id == course_id)
        .all()
    ]
    total_blocks = len(all_block_ids)

    if not all_block_ids:
        return CourseProgressOut(total_blocks=0, completed_blocks=0, progress=[])

    progress_rows = (
        db.query(Progress)
        .filter(
            Progress.user_id == user.id,
            Progress.content_block_id.in_(all_block_ids),
        )
        .all()
    )
    completed = sum(1 for p in progress_rows if p.is_completed)

    return CourseProgressOut(
        total_blocks=total_blocks,
        completed_blocks=completed,
        progress=[
            ProgressOut(
                content_block_id=p.content_block_id,
                is_completed=p.is_completed,
                completed_at=p.completed_at,
            )
            for p in progress_rows
        ],
    )
