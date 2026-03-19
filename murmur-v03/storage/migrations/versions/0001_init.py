"""init"""
from alembic import op
import sqlalchemy as sa

revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("events",
        sa.Column("event_id", sa.String(64), primary_key=True),
        sa.Column("job_id", sa.String(64), index=True),
        sa.Column("run_id", sa.String(64), index=True),
        sa.Column("seq", sa.Integer(), index=True),
        sa.Column("type", sa.String(64)),
        sa.Column("timestamp", sa.DateTime(timezone=True)),
        sa.Column("version", sa.String(16)),
        sa.Column("actor", sa.String(64)),
        sa.Column("payload_json", sa.JSON()),
        sa.Column("meta_json", sa.JSON()),
    )
    op.create_table("job_projection",
        sa.Column("job_id", sa.String(64), primary_key=True),
        sa.Column("latest_run_id", sa.String(64)),
        sa.Column("status", sa.String(32)),
        sa.Column("task", sa.Text()),
        sa.Column("context_json", sa.JSON()),
        sa.Column("strategy_id", sa.String(64)),
        sa.Column("council_id", sa.String(64)),
        sa.Column("decision", sa.Text()),
        sa.Column("next_tasks_json", sa.JSON()),
        sa.Column("parking_lot_json", sa.JSON()),
        sa.Column("score", sa.Float()),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )
    op.create_table("agent_output_projection",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("job_id", sa.String(64)),
        sa.Column("run_id", sa.String(64)),
        sa.Column("agent_id", sa.String(64)),
        sa.Column("role", sa.String(64)),
        sa.Column("output_text", sa.Text()),
        sa.Column("latency_ms", sa.Integer()),
        sa.Column("created_at", sa.DateTime(timezone=True)),
    )
    op.create_table("snapshot_projection",
        sa.Column("snapshot_id", sa.String(64), primary_key=True),
        sa.Column("job_id", sa.String(64)),
        sa.Column("run_id", sa.String(64)),
        sa.Column("state_version", sa.Integer()),
        sa.Column("state_json", sa.JSON()),
        sa.Column("created_at", sa.DateTime(timezone=True)),
    )
    op.create_table("bandit_arms",
        sa.Column("arm_id", sa.String(64), primary_key=True),
        sa.Column("strategy_id", sa.String(64)),
        sa.Column("alpha", sa.Integer()),
        sa.Column("beta", sa.Integer()),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )
    op.create_table("job_runs",
        sa.Column("run_id", sa.String(64), primary_key=True),
        sa.Column("job_id", sa.String(64)),
        sa.Column("strategy_id", sa.String(64)),
        sa.Column("council_id", sa.String(64)),
        sa.Column("eval_score", sa.Float()),
        sa.Column("reward", sa.Integer()),
        sa.Column("status", sa.String(32)),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
    )


def downgrade() -> None:
    for t in ["job_runs", "bandit_arms", "snapshot_projection", "agent_output_projection", "job_projection", "events"]:
        op.drop_table(t)
