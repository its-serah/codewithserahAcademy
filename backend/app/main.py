import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import (
    auth,
    courses,
    modules,
    enrollments,
    progress,
    admin,
    community,
    feedback,
)

logger = logging.getLogger("academy")

app = FastAPI(title="CodewithSerah Academy")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(modules.router)
app.include_router(enrollments.router)
app.include_router(progress.router)
app.include_router(admin.router)
app.include_router(community.router)
app.include_router(feedback.router)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Catch unexpected errors, log them, and return a safe 500 response."""
    logger.error(
        "Unhandled error on %s %s: %s",
        request.method,
        request.url.path,
        exc,
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


@app.get("/api/health")
def health():
    """Health check endpoint."""
    return {"status": "ok"}
