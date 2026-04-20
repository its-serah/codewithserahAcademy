"""Verify that deleting a Course cascades to modules, content blocks, and enrollments."""

import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.course import Course
from app.models.module import Module
from app.models.content_block import ContentBlock
from app.models.enrollment import Enrollment
from app.models.user import User


@pytest.fixture
def db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )

    # Enable FK enforcement for SQLite (off by default)
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(conn, _):
        conn.execute("PRAGMA foreign_keys=ON")

    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()
    Base.metadata.drop_all(engine)


def _make_user(db, role="student"):
    user = User(
        name="Test User",
        email=f"test_{role}@example.com",
        hashed_password="x",
        role=role,
        is_active=True,
    )
    db.add(user)
    db.flush()
    return user


def test_delete_course_cascades_to_modules_and_blocks(db):
    course = Course(title="Python 101", slug="python-101")
    db.add(course)
    db.flush()

    module = Module(course_id=course.id, title="Intro", order_index=1)
    db.add(module)
    db.flush()

    block = ContentBlock(module_id=module.id, type="reading", order_index=1)
    db.add(block)
    db.commit()

    assert db.query(Module).count() == 1
    assert db.query(ContentBlock).count() == 1

    db.delete(course)
    db.commit()

    assert db.query(Course).count() == 0
    assert db.query(Module).count() == 0
    assert db.query(ContentBlock).count() == 0


def test_delete_course_cascades_to_enrollments(db):
    student = _make_user(db)
    course = Course(title="Python 101", slug="python-101b")
    db.add(course)
    db.flush()

    enrollment = Enrollment(user_id=student.id, course_id=course.id)
    db.add(enrollment)
    db.commit()

    assert db.query(Enrollment).count() == 1

    db.delete(course)
    db.commit()

    assert db.query(Enrollment).count() == 0
