"""add module_feedback table

Revision ID: d1e2f3a4b5c6
Revises: c5d6e7f8a9b0
Create Date: 2026-04-20 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "d1e2f3a4b5c6"
down_revision: Union[str, None] = "c5d6e7f8a9b0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "module_feedback",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column(
            "module_id",
            sa.Integer(),
            sa.ForeignKey("modules.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.UniqueConstraint(
            "module_id", "user_id", name="uq_module_feedback_module_user"
        ),
    )
    op.create_index("ix_module_feedback_module_id", "module_feedback", ["module_id"])
    op.create_index("ix_module_feedback_user_id", "module_feedback", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_module_feedback_user_id", table_name="module_feedback")
    op.drop_index("ix_module_feedback_module_id", table_name="module_feedback")
    op.drop_table("module_feedback")
