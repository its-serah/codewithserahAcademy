import logging

from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.feedback import ModuleFeedback
from app.models.module import Module
from app.schemas.feedback import FeedbackSubmit, FeedbackOut
from app.models.user import User

logger = logging.getLogger("academy.feedback")

router = APIRouter(prefix="/api/modules", tags=["feedback"])


def _to_out(fb: ModuleFeedback) -> FeedbackOut:
    return FeedbackOut(
        id=fb.id,
        module_id=fb.module_id,
        user_id=fb.user_id,
        user_name=fb.user.name,
        rating=fb.rating,
        comment=fb.comment,
        created_at=fb.created_at,
        updated_at=fb.updated_at,
    )


@router.post("/{module_id}/feedback", response_model=FeedbackOut)
def submit_feedback(
    req: FeedbackSubmit,
    module_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    existing = (
        db.query(ModuleFeedback)
        .filter(
            ModuleFeedback.module_id == module_id,
            ModuleFeedback.user_id == current_user.id,
        )
        .first()
    )
    try:
        if existing:
            existing.rating = req.rating
            existing.comment = req.comment
            db.commit()
            db.refresh(existing)
            return _to_out(existing)

        fb = ModuleFeedback(
            module_id=module_id,
            user_id=current_user.id,
            rating=req.rating,
            comment=req.comment,
        )
        db.add(fb)
        db.commit()
        db.refresh(fb)
        return _to_out(fb)
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("Failed to save feedback for module %d: %s", module_id, e)
        raise HTTPException(status_code=500, detail="Failed to save feedback")


@router.get("/{module_id}/feedback/mine", response_model=FeedbackOut | None)
def get_my_feedback(
    module_id: int = Path(gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fb = (
        db.query(ModuleFeedback)
        .filter(
            ModuleFeedback.module_id == module_id,
            ModuleFeedback.user_id == current_user.id,
        )
        .first()
    )
    return _to_out(fb) if fb else None
