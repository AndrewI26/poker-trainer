"""simplify preflop responses

Revision ID: bed9a10be08d
Revises: 4053315f1521
Create Date: 2026-07-15 22:30:45.322190

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "bed9a10be08d"
down_revision: str | Sequence[str] | None = "4053315f1521"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_index(
        op.f("ix_preflop_response_actions_response_id"),
        table_name="preflop_response_actions",
    )
    op.drop_table("preflop_response_actions")

    postgresql.ENUM(
        "UTG",
        "UTG+1",
        "UTG+2",
        "LJ",
        "HJ",
        "CO",
        "BTN",
        "SB",
        "BB",
        name="table_position",
    ).create(op.get_bind())
    op.execute(
        "ALTER TABLE preflop_responses ALTER COLUMN hero_position TYPE table_position USING hero_position::text::table_position"
    )
    op.execute("DROP TYPE poker_position")

    postgresql.ENUM("correct", "acceptable", "incorrect", name="move_verdict").create(
        op.get_bind()
    )
    op.execute(
        "ALTER TABLE preflop_responses ALTER COLUMN verdict TYPE move_verdict USING verdict::text::move_verdict"
    )
    op.execute("ALTER TABLE preflop_responses ALTER COLUMN verdict DROP NOT NULL")
    op.execute("DROP TYPE preflop_verdict")

    op.drop_column("preflop_responses", "seed")
    op.drop_column("preflop_responses", "raise_size_bb")
    op.drop_column("preflop_responses", "ante_bb")
    op.drop_column("preflop_responses", "big_blind_bb")
    op.drop_column("preflop_responses", "small_blind_bb")
    op.drop_column("preflop_responses", "hero_stack_bb")
    op.drop_column("preflop_responses", "recommended_raise_size_bb")


def downgrade() -> None:
    op.add_column(
        "preflop_responses",
        sa.Column(
            "recommended_raise_size_bb",
            sa.NUMERIC(precision=6, scale=2),
            autoincrement=False,
            nullable=True,
        ),
    )
    op.add_column(
        "preflop_responses",
        sa.Column(
            "hero_stack_bb",
            sa.NUMERIC(precision=6, scale=2),
            autoincrement=False,
            nullable=False,
        ),
    )
    op.add_column(
        "preflop_responses",
        sa.Column(
            "small_blind_bb",
            sa.NUMERIC(precision=6, scale=2),
            autoincrement=False,
            nullable=False,
        ),
    )
    op.add_column(
        "preflop_responses",
        sa.Column(
            "big_blind_bb",
            sa.NUMERIC(precision=6, scale=2),
            autoincrement=False,
            nullable=False,
        ),
    )
    op.add_column(
        "preflop_responses",
        sa.Column(
            "ante_bb",
            sa.NUMERIC(precision=6, scale=2),
            server_default=sa.text("'0'::numeric"),
            autoincrement=False,
            nullable=False,
        ),
    )
    op.add_column(
        "preflop_responses",
        sa.Column(
            "raise_size_bb",
            sa.NUMERIC(precision=6, scale=2),
            autoincrement=False,
            nullable=True,
        ),
    )
    op.add_column(
        "preflop_responses",
        sa.Column("seed", sa.INTEGER(), autoincrement=False, nullable=False),
    )

    postgresql.ENUM(
        "correct", "acceptable", "incorrect", name="preflop_verdict"
    ).create(op.get_bind())
    op.execute(
        "ALTER TABLE preflop_responses ALTER COLUMN verdict TYPE preflop_verdict USING verdict::text::preflop_verdict"
    )
    op.execute("ALTER TABLE preflop_responses ALTER COLUMN verdict SET NOT NULL")
    op.execute("DROP TYPE move_verdict")

    postgresql.ENUM(
        "UTG",
        "UTG+1",
        "UTG+2",
        "LJ",
        "HJ",
        "CO",
        "BTN",
        "SB",
        "BB",
        name="poker_position",
    ).create(op.get_bind())
    op.execute(
        "ALTER TABLE preflop_responses ALTER COLUMN hero_position TYPE poker_position USING hero_position::text::poker_position"
    )
    op.execute("DROP TYPE table_position")

    op.create_table(
        "preflop_response_actions",
        sa.Column("id", sa.UUID(), autoincrement=False, nullable=False),
        sa.Column("response_id", sa.UUID(), autoincrement=False, nullable=False),
        sa.Column("sequence", sa.SMALLINT(), autoincrement=False, nullable=False),
        sa.Column(
            "position",
            postgresql.ENUM(
                "UTG",
                "UTG+1",
                "UTG+2",
                "LJ",
                "HJ",
                "CO",
                "BTN",
                "SB",
                "BB",
                name="poker_position",
            ),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "action_type",
            postgresql.ENUM(
                "fold", "limp", "raise", "reraise", "allin", name="preflop_action_type"
            ),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "size_bb",
            sa.NUMERIC(precision=6, scale=2),
            autoincrement=False,
            nullable=True,
        ),
        sa.Column(
            "created_at",
            postgresql.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            postgresql.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            autoincrement=False,
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["response_id"],
            ["preflop_responses.id"],
            name=op.f("preflop_response_actions_response_id_fkey"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("preflop_response_actions_pkey")),
        sa.UniqueConstraint(
            "response_id",
            "sequence",
            name=op.f("preflop_response_actions_response_id_sequence_key"),
            postgresql_include=[],
            postgresql_nulls_not_distinct=False,
        ),
    )
    op.create_index(
        op.f("ix_preflop_response_actions_response_id"),
        "preflop_response_actions",
        ["response_id"],
        unique=False,
    )
