"""add username and certificate_name to users

Revision ID: a4f8e2b1c3d9
Revises: 94b55e65103d
Create Date: 2026-04-18 00:00:00.000000
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "a4f8e2b1c3d9"
down_revision: Union[str, None] = "94b55e65103d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("username", sa.String(), nullable=True))
    op.add_column("users", sa.Column("certificate_name", sa.String(), nullable=True))
    op.create_unique_constraint("uq_users_username", "users", ["username"])
    op.create_index("ix_users_username", "users", ["username"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_users_username", table_name="users")
    op.drop_constraint("uq_users_username", "users", type_="unique")
    op.drop_column("users", "certificate_name")
    op.drop_column("users", "username")
