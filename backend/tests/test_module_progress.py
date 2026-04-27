"""Tests for the module progress query logic used by GET /api/progress/module/{module_id}."""

from datetime import datetime, timezone

import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.content_block import ContentBlock
from app.models.course import Course
from app.models.module import Module
from app.models.progress import Progress
from app.models.user import User


@pytest.fixture
def db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(conn, _):
        conn.execute("PRAGMA foreign_keys=ON")

    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()
    Base.metadata.drop_all(engine)


def _make_user(db, email="student@example.com"):
    user = User(
        name="Test User",
        email=email,
        hashed_password="x",
        role="student",
        is_active=True,
    )
    db.add(user)
    db.flush()
    return user


def _make_course_with_module(db, slug="test-course"):
    course = Course(title="Test Course", slug=slug)
    db.add(course)
    db.flush()
    module = Module(course_id=course.id, title="Module 1", order_index=1)
    db.add(module)
    db.flush()
    blocks = [
        ContentBlock(module_id=module.id, type="reading", order_index=i)
        for i in range(1, 4)
    ]
    for b in blocks:
        db.add(b)
    db.flush()
    return course, module, blocks


def _query_module_progress(db, user_id: int, module_id: int):
    """Mirrors the logic in GET /api/progress/module/{module_id}."""
    block_ids = [
        b.id
        for b in db.query(ContentBlock.id)
        .filter(ContentBlock.module_id == module_id)
        .all()
    ]
    if not block_ids:
        return []
    return (
        db.query(Progress)
        .filter(
            Progress.user_id == user_id,
            Progress.content_block_id.in_(block_ids),
            Progress.is_completed == True,
        )
        .all()
    )


def test_returns_empty_when_no_completions(db):
    user = _make_user(db)
    _, module, _ = _make_course_with_module(db)
    db.commit()

    result = _query_module_progress(db, user.id, module.id)
    assert result == []


def test_returns_only_completed_blocks(db):
    user = _make_user(db)
    _, module, blocks = _make_course_with_module(db)
    now = datetime.now(timezone.utc)
    db.add(
        Progress(
            user_id=user.id,
            content_block_id=blocks[0].id,
            is_completed=True,
            completed_at=now,
        )
    )
    db.add(
        Progress(
            user_id=user.id,
            content_block_id=blocks[1].id,
            is_completed=True,
            completed_at=now,
        )
    )
    db.commit()

    result = _query_module_progress(db, user.id, module.id)

    assert len(result) == 2
    returned_ids = {r.content_block_id for r in result}
    assert returned_ids == {blocks[0].id, blocks[1].id}
    assert all(r.is_completed for r in result)


def test_does_not_include_incomplete_block(db):
    user = _make_user(db)
    _, module, blocks = _make_course_with_module(db)
    now = datetime.now(timezone.utc)
    db.add(
        Progress(
            user_id=user.id,
            content_block_id=blocks[0].id,
            is_completed=True,
            completed_at=now,
        )
    )
    db.add(
        Progress(
            user_id=user.id,
            content_block_id=blocks[1].id,
            is_completed=False,
            completed_at=None,
        )
    )
    db.commit()

    result = _query_module_progress(db, user.id, module.id)

    assert len(result) == 1
    assert result[0].content_block_id == blocks[0].id


def test_does_not_return_other_users_completions(db):
    user_a = _make_user(db, email="a@example.com")
    user_b = _make_user(db, email="b@example.com")
    _, module, blocks = _make_course_with_module(db)
    now = datetime.now(timezone.utc)
    db.add(
        Progress(
            user_id=user_a.id,
            content_block_id=blocks[0].id,
            is_completed=True,
            completed_at=now,
        )
    )
    db.commit()

    result = _query_module_progress(db, user_b.id, module.id)
    assert result == []


def test_returns_empty_for_unknown_module(db):
    user = _make_user(db)
    db.commit()

    result = _query_module_progress(db, user.id, module_id=99999)
    assert result == []


def test_returns_all_blocks_when_fully_completed(db):
    user = _make_user(db)
    _, module, blocks = _make_course_with_module(db)
    now = datetime.now(timezone.utc)
    for b in blocks:
        db.add(
            Progress(
                user_id=user.id,
                content_block_id=b.id,
                is_completed=True,
                completed_at=now,
            )
        )
    db.commit()

    result = _query_module_progress(db, user.id, module.id)

    assert len(result) == len(blocks)
    assert {r.content_block_id for r in result} == {b.id for b in blocks}
