"""add is_coming_soon and seed pocket agents course

Revision ID: e2f3a4b5c6d7
Revises: d1e2f3a4b5c6
Create Date: 2026-04-22 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "e2f3a4b5c6d7"
down_revision: Union[str, None] = "d1e2f3a4b5c6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "courses",
        sa.Column(
            "is_coming_soon", sa.Boolean(), nullable=False, server_default="false"
        ),
    )

    op.execute(
        """
        INSERT INTO courses (title, slug, description, is_published, is_coming_soon, created_at)
        VALUES (
            'Pocket Agents',
            'pocket-agents',
            'Build powerful AI agents that run anywhere — from your phone to your browser. Learn how to design, deploy, and orchestrate lightweight agents using modern AI tools.',
            false,
            true,
            now()
        )
        ON CONFLICT (slug) DO NOTHING
        """
    )


def downgrade() -> None:
    op.execute("DELETE FROM courses WHERE slug = 'pocket-agents'")
    op.drop_column("courses", "is_coming_soon")
