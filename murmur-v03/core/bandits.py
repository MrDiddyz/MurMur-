import hashlib
from datetime import datetime, timezone

from sqlalchemy import select

from storage.models import BanditArm

ARM_CATALOG = [
    ("arm_01", "DEFAULT_SEQUENTIAL", "default"),
    ("arm_02", "BUILD_FIRST", "build_heavy"),
    ("arm_03", "RISK_CHECKED", "risk_heavy"),
    ("arm_04", "DEFAULT_SEQUENTIAL", "build_heavy"),
    ("arm_05", "DEFAULT_SEQUENTIAL", "risk_heavy"),
    ("arm_06", "BUILD_FIRST", "default"),
    ("arm_07", "RISK_CHECKED", "default"),
    ("arm_08", "BUILD_FIRST", "risk_heavy"),
    ("arm_09", "RISK_CHECKED", "build_heavy"),
    ("arm_10", "DEFAULT_SEQUENTIAL", "default"),
]


def ensure_arms(session):
    for arm_id, strategy, _ in ARM_CATALOG:
        if not session.get(BanditArm, arm_id):
            session.add(BanditArm(arm_id=arm_id, strategy_id=strategy, alpha=1, beta=1))


def _det_sample(run_id: str, arm_id: str, alpha: int, beta: int) -> float:
    h = hashlib.sha256(f"{run_id}:{arm_id}:{alpha}:{beta}".encode()).hexdigest()
    return int(h[:8], 16) / 0xFFFFFFFF


def sample_arm(session, run_id: str):
    ensure_arms(session)
    session.flush()
    arms = session.scalars(select(BanditArm)).all()
    best = None
    for arm in arms:
        score = _det_sample(run_id, arm.arm_id, arm.alpha, arm.beta)
        if best is None or score > best[1]:
            best = (arm, score)
    if best is None:
        raise RuntimeError("No bandit arms available. Database may be corrupted or transaction failed.")
    return best[0], best[1]


def assign_reward(session, arm_id: str, score: float):
    arm = session.get(BanditArm, arm_id)
    if arm is None:
        raise ValueError(f"BanditArm with arm_id '{arm_id}' not found in database")
    reward = 1 if score >= 0.75 else 0
    if reward:
        arm.alpha += 1
    else:
        arm.beta += 1
    arm.updated_at = datetime.now(timezone.utc)
    session.flush()
    return reward
