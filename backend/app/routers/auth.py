import logging
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.waitlist import WaitlistEmail
from app.models.token import PasswordResetToken, EmailVerificationToken
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    UpdateProfileRequest,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
)
from app.utils.auth import hash_password, verify_password, create_access_token
from app.utils.email import (
    send_welcome_email,
    send_verification_email,
    send_password_reset_email,
)

logger = logging.getLogger("academy.auth")

router = APIRouter(prefix="/api/auth", tags=["auth"])

PASSWORD_RESET_TTL = timedelta(hours=24)
EMAIL_VERIFICATION_TTL = timedelta(hours=48)


def _generate_token() -> str:
    return secrets.token_urlsafe(32)


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(
    req: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Register a new user. Email must be on the waitlist."""
    waitlisted = (
        db.query(WaitlistEmail).filter(WaitlistEmail.email == req.email).first()
    )
    if not waitlisted:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not on the waitlist",
        )

    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        name=req.name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create verification token
    verification = EmailVerificationToken(
        token=_generate_token(),
        user_id=user.id,
        expires_at=datetime.now(timezone.utc) + EMAIL_VERIFICATION_TTL,
    )
    db.add(verification)
    db.commit()

    background_tasks.add_task(send_welcome_email, user.email, user.name)
    background_tasks.add_task(
        send_verification_email, user.email, user.name, verification.token
    )

    return TokenResponse(access_token=create_access_token(user.id))


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT."""
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    return TokenResponse(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    """Return the current authenticated user's profile."""
    return user


@router.patch("/profile", response_model=UserResponse)
def update_profile(
    req: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the current user's profile."""
    if req.username and req.username != current_user.username:
        taken = (
            db.query(User)
            .filter(User.username == req.username, User.id != current_user.id)
            .first()
        )
        if taken:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already taken",
            )

    current_user.name = req.name
    current_user.username = req.username or None
    current_user.certificate_name = req.certificate_name or None
    current_user.avatar_emoji = req.avatar_emoji or None
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/change-password", status_code=204)
def change_password(
    req: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Change the current user's password."""
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    current_user.hashed_password = hash_password(req.new_password)
    db.commit()


@router.post("/forgot-password", status_code=200)
def forgot_password(
    req: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Request a password reset link. Always returns 200 to avoid leaking
    whether an email is registered."""
    user = db.query(User).filter(User.email == req.email).first()
    if user:
        token_value = _generate_token()
        prt = PasswordResetToken(
            token=token_value,
            user_id=user.id,
            expires_at=datetime.now(timezone.utc) + PASSWORD_RESET_TTL,
        )
        db.add(prt)
        db.commit()
        background_tasks.add_task(
            send_password_reset_email, user.email, user.name, token_value
        )
    return {"detail": "If that email exists, a reset link has been sent."}


@router.post("/reset-password", status_code=200)
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Consume a password reset token and update the user's password."""
    now = datetime.now(timezone.utc)
    prt = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token == req.token,
            PasswordResetToken.used == False,  # noqa: E712
            PasswordResetToken.expires_at > now,
        )
        .first()
    )
    if not prt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token",
        )

    user = db.query(User).filter(User.id == prt.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token",
        )

    user.hashed_password = hash_password(req.new_password)
    prt.used = True
    db.commit()
    return {"detail": "Password updated."}


@router.post("/verify-email", status_code=200)
def verify_email(req: VerifyEmailRequest, db: Session = Depends(get_db)):
    """Consume an email verification token and mark the user verified."""
    now = datetime.now(timezone.utc)
    evt = (
        db.query(EmailVerificationToken)
        .filter(
            EmailVerificationToken.token == req.token,
            EmailVerificationToken.used == False,  # noqa: E712
            EmailVerificationToken.expires_at > now,
        )
        .first()
    )
    if not evt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token",
        )

    user = db.query(User).filter(User.id == evt.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token",
        )

    user.is_verified = True
    evt.used = True
    db.commit()
    return {"detail": "Email verified."}


@router.post("/resend-verification", status_code=200)
def resend_verification(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a fresh verification token and email it to the current user."""
    if current_user.is_verified:
        return {"detail": "Email already verified."}

    evt = EmailVerificationToken(
        token=_generate_token(),
        user_id=current_user.id,
        expires_at=datetime.now(timezone.utc) + EMAIL_VERIFICATION_TTL,
    )
    db.add(evt)
    db.commit()

    background_tasks.add_task(
        send_verification_email, current_user.email, current_user.name, evt.token
    )
    return {"detail": "Verification email sent."}
