"""Email sending utilities using fastapi-mail.

If MAIL_USERNAME is not configured, emails are logged instead of sent so that
local/dev environments work out of the box.
"""

import logging
from typing import Optional

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from app.config import settings

logger = logging.getLogger("academy.email")

BRAND_COLOR = "#6f3096"
BRAND_NAME = "CodewithSerah Academy"


def _is_configured() -> bool:
    return bool(settings.MAIL_USERNAME)


def _get_fastmail() -> Optional[FastMail]:
    if not _is_configured():
        return None
    conf = ConnectionConfig(
        MAIL_USERNAME=settings.MAIL_USERNAME,
        MAIL_PASSWORD=settings.MAIL_PASSWORD,
        MAIL_FROM=settings.MAIL_FROM,
        MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
        MAIL_SERVER=settings.MAIL_SERVER,
        MAIL_PORT=settings.MAIL_PORT,
        MAIL_STARTTLS=settings.MAIL_STARTTLS,
        MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True,
    )
    return FastMail(conf)


def _wrap_html(title: str, inner_html: str) -> str:
    return f"""\
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#f6f4fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#2b2340;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f4fa;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(111,48,150,0.08);">
          <tr>
            <td style="background:{BRAND_COLOR};padding:24px 32px;color:#ffffff;">
              <h1 style="margin:0;font-size:22px;font-weight:700;letter-spacing:-0.2px;">{BRAND_NAME}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;font-size:15px;line-height:1.6;color:#2b2340;">
              {inner_html}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#faf7fd;font-size:12px;color:#7a6f90;text-align:center;">
              &copy; {BRAND_NAME}. If you didn't expect this email, you can safely ignore it.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def _button(href: str, label: str) -> str:
    return (
        f'<a href="{href}" '
        f'style="display:inline-block;background:{BRAND_COLOR};color:#ffffff;'
        f'padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">'
        f"{label}</a>"
    )


async def _send(email: str, subject: str, html: str) -> None:
    fm = _get_fastmail()
    if fm is None:
        logger.info(
            "Email not configured; would send to %s with subject %r", email, subject
        )
        logger.debug("Email body:\n%s", html)
        return
    message = MessageSchema(
        subject=subject,
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )
    try:
        await fm.send_message(message)
    except Exception as exc:
        # Log but do not re-raise: email sending runs in BackgroundTasks and a
        # raised exception would be swallowed silently by FastAPI, making it
        # harder to diagnose than a logged error.
        logger.error("Failed to send email to %s: %s", email, exc, exc_info=True)


async def send_welcome_email(email: str, name: str) -> None:
    subject = f"Welcome to {BRAND_NAME}!"
    inner = f"""
    <h2 style="margin:0 0 16px;color:{BRAND_COLOR};font-size:20px;">Welcome, {name}!</h2>
    <p>We're thrilled to have you join {BRAND_NAME}. You've just taken a big step toward
    leveling up your skills.</p>
    <p>Head over to your dashboard to browse courses, track your progress, and start
    learning at your own pace.</p>
    <p style="margin:24px 0;">
      {_button(settings.FRONTEND_URL, "Go to dashboard")}
    </p>
    <p style="color:#7a6f90;">Happy learning,<br/>The {BRAND_NAME} team</p>
    """
    await _send(email, subject, _wrap_html(subject, inner))


async def send_verification_email(email: str, name: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    subject = "Verify your email"
    inner = f"""
    <h2 style="margin:0 0 16px;color:{BRAND_COLOR};font-size:20px;">Verify your email</h2>
    <p>Hi {name},</p>
    <p>Please confirm your email address so we can keep your account secure and send you
    important updates about your courses.</p>
    <p style="margin:24px 0;">
      {_button(link, "Verify email")}
    </p>
    <p style="color:#7a6f90;font-size:13px;">Or paste this link into your browser:<br/>
    <a href="{link}" style="color:{BRAND_COLOR};word-break:break-all;">{link}</a></p>
    <p style="color:#7a6f90;">This link expires in 48 hours.</p>
    """
    await _send(email, subject, _wrap_html(subject, inner))


async def send_password_reset_email(email: str, name: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    subject = "Reset your password"
    inner = f"""
    <h2 style="margin:0 0 16px;color:{BRAND_COLOR};font-size:20px;">Reset your password</h2>
    <p>Hi {name},</p>
    <p>We received a request to reset your password. Click the button below to choose a
    new one.</p>
    <p style="margin:24px 0;">
      {_button(link, "Reset password")}
    </p>
    <p style="color:#7a6f90;font-size:13px;">Or paste this link into your browser:<br/>
    <a href="{link}" style="color:{BRAND_COLOR};word-break:break-all;">{link}</a></p>
    <p style="color:#7a6f90;">This link expires in 24 hours. If you didn't request a
    reset, you can safely ignore this email.</p>
    """
    await _send(email, subject, _wrap_html(subject, inner))
