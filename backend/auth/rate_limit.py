from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class LoginRateLimitConfig:
    window_minutes: int = 15
    max_failures_per_email: int = 5
    max_failures_per_ip: int = 20


async def _failed_attempt_count_by_email(db, email: str, cfg: LoginRateLimitConfig) -> int:
    return int(
        await db.fetch_val(
            """
            SELECT COUNT(*)
            FROM login_attempts
            WHERE email = $1
              AND success = FALSE
              AND created_at >= NOW() - ($2::text || ' minutes')::interval
            """,
            email,
            cfg.window_minutes,
        )
        or 0
    )


async def _failed_attempt_count_by_ip(db, ip: str, cfg: LoginRateLimitConfig) -> int:
    return int(
        await db.fetch_val(
            """
            SELECT COUNT(*)
            FROM login_attempts
            WHERE ip = $1
              AND success = FALSE
              AND created_at >= NOW() - ($2::text || ' minutes')::interval
            """,
            ip,
            cfg.window_minutes,
        )
        or 0
    )


async def is_rate_limited(db, email: str, ip: str, cfg: LoginRateLimitConfig | None = None) -> bool:
    cfg = cfg or LoginRateLimitConfig()
    failed_by_email = await _failed_attempt_count_by_email(db, email, cfg)
    failed_by_ip = await _failed_attempt_count_by_ip(db, ip, cfg)
    return (
        failed_by_email >= cfg.max_failures_per_email
        or failed_by_ip >= cfg.max_failures_per_ip
    )


async def record_login_attempt(db, email: str, ip: str, success: bool) -> None:
    await db.execute(
        """
        INSERT INTO login_attempts (email, ip, success)
        VALUES ($1, $2, $3)
        """,
        email,
        ip,
        success,
    )
