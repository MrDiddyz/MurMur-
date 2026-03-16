from hashlib import sha256

from core import eval as eval_core
from core.agent_factory import select_council
from core.bandits import ARM_CATALOG, assign_reward, ensure_arms, sample_arm
from core.ids import event_id, gen_id, utc_now
from core.llm import MockLLM
from core.prompts import PROMPT_VERSIONS
from core.strategies import STRATEGIES
from events.schemas import EventEnvelope
from events.types import *
from events.writer import EventWriter
from storage.models import JobRun
from tools.tool_registry import execute_tool


ROLE_MAP = {
    "architect_v1": "Architect",
    "builder_v1": "Builder",
    "builder_impl_v1": "Builder",
    "critic_v1": "Critic",
    "experimenter_v1": "Experimenter",
    "synthesizer_v1": "Synthesizer",
}


class Orchestrator:
    def __init__(self, session):
        self.session = session
        self.writer = EventWriter(session)
        self.llm = MockLLM()

    def emit(self, job_id, run_id, evt_type, actor, payload=None, meta=None):
        seq = self.writer.next_seq(run_id)
        env = EventEnvelope(
            event_id=event_id(f"{run_id}:{seq}:{evt_type}"),
            job_id=job_id,
            run_id=run_id,
            seq=seq,
            type=evt_type,
            timestamp=utc_now(),
            actor=actor,
            payload=payload or {},
            meta=meta or {},
        )
        return self.writer.append(env)

    def run_job(self, job_id: str, run_id: str, req: dict):
        self.session.add(JobRun(run_id=run_id, job_id=job_id, status="running"))
        self.emit(job_id, run_id, RUN_STARTED, "worker", {})
        
        # Ensure all bandit arms exist in the database for reward assignment
        ensure_arms(self.session)

        if req.get("mode") == "auto":
            council_id, agents, rationale = select_council(req["task"])
        else:
            council_id = "explicit"
            agents = [f"{c}_v1" for c in req.get("council", [])] or ["architect_v1", "builder_v1", "critic_v1", "experimenter_v1", "synthesizer_v1"]
            rationale = "Explicit council from request."
        self.emit(job_id, run_id, COUNCIL_SELECTED, "agent_factory", {
            "council_id": council_id,
            "agents": agents,
            "rationale": rationale,
        })

        if req.get("strategy_id"):
            strategy_id = req["strategy_id"]
            arm_id = "arm_explicit"
            sample_value = 1.0
            mode = "explicit"
        elif req.get("mode") == "auto":
            arm, sample_value = sample_arm(self.session, run_id)
            arm_id, strategy_id = arm.arm_id, arm.strategy_id
            self.emit(job_id, run_id, BANDIT_ARM_SAMPLED, "bandit", {
                "arm_id": arm_id,
                "strategy_id": strategy_id,
                "alpha": arm.alpha,
                "beta": arm.beta,
                "sampled_value": round(sample_value, 2),
            })
            mode = "bandit"
        else:
            arm_id, strategy_id, _ = ARM_CATALOG[0]
            mode = "default"

        self.emit(job_id, run_id, STRATEGY_SELECTED, "orchestrator", {
            "strategy_id": strategy_id,
            "selection_mode": mode,
            "candidate_arms": [a[0] for a in ARM_CATALOG],
        })

        artifacts = {}
        allow_tools = req.get("allow_tools", [])
        for agent_id in agents:
            role = ROLE_MAP.get(agent_id, "Builder")
            self.emit(job_id, run_id, AGENT_STARTED, agent_id, {
                "agent_id": agent_id,
                "role": role,
                "prompt_version": PROMPT_VERSIONS.get(role, "custom@v1"),
                "model": self.llm.model,
                "temperature": 0.0,
            })
            digest = sha256(f"{job_id}:{run_id}:{agent_id}".encode()).hexdigest()
            self.emit(job_id, run_id, AGENT_CONTEXT_BUILT, "orchestrator", {
                "agent_id": agent_id,
                "input_refs": ["evt_001", "evt_002"],
                "context_digest": f"sha256:{digest}",
            })

            if role == "Builder":
                self.emit(job_id, run_id, TOOL_CALL_REQUESTED, agent_id, {
                    "agent_id": agent_id,
                    "tool_name": "code.run",
                    "tool_input": {"code": "print('build-ok')"},
                })
                tool_result = execute_tool("code.run", {"code": "print('build-ok')"}, allow_tools)
                if tool_result.get("rejected"):
                    self.emit(job_id, run_id, TOOL_CALL_REJECTED, "tool_registry", {
                        "tool_name": "code.run",
                        "reason": tool_result["reason"],
                    })
                else:
                    self.emit(job_id, run_id, TOOL_CALL_COMPLETED, "tool_registry", {
                        "tool_name": "code.run",
                        "ok": tool_result["ok"],
                        "stdout": tool_result.get("stdout", ""),
                        "stderr": tool_result.get("stderr", ""),
                        "duration_ms": tool_result.get("duration_ms", 0),
                    })
                self.emit(job_id, run_id, TOOL_CALL_REQUESTED, agent_id, {
                    "agent_id": agent_id,
                    "tool_name": "web.search",
                    "tool_input": {"query": req["task"]},
                })
                web = execute_tool("web.search", {"query": req["task"]}, allow_tools)
                if not web.get("ok"):
                    self.emit(job_id, run_id, TOOL_CALL_REJECTED, "tool_registry", {
                        "tool_name": "web.search",
                        "reason": web.get("reason", "disabled"),
                    })
                else:
                    self.emit(job_id, run_id, TOOL_CALL_COMPLETED, "tool_registry", {
                        "tool_name": "web.search",
                        "ok": web.get("ok"),
                        "results": web.get("results", []),
                        "duration_ms": web.get("duration_ms", 0),
                    })

            text = self.llm.generate(role, req["task"], req.get("context", {}))
            artifacts[role.lower()] = text
            self.emit(job_id, run_id, AGENT_OUTPUT_RECORDED, agent_id, {
                "agent_id": agent_id,
                "role": role,
                "output_text": text,
                "latency_ms": 100,
                "token_in": 0,
                "token_out": 0,
            })

        synthesis = {
            "decision": f"Proceed with {strategy_id} for task: {req['task']}",
            "next_tasks": ["Implement", "Validate", "Deploy"],
            "parking_lot": ["Scale tuning"],
            "artifacts": {
                "architecture": artifacts.get("architect", ""),
                "implementation": artifacts.get("builder", ""),
                "risks": artifacts.get("critic", ""),
                "experiments": artifacts.get("experimenter", ""),
                "synthesis": artifacts.get("synthesizer", ""),
            },
        }
        self.emit(job_id, run_id, SYNTHESIS_GENERATED, "synthesizer_v1", synthesis)
        ev = eval_core.evaluate(synthesis["decision"])
        self.emit(job_id, run_id, EVALUATION_COMPLETED, "evaluator", ev)

        reward = assign_reward(self.session, arm_id if arm_id != "arm_explicit" else "arm_01", ev["score"])
        self.emit(job_id, run_id, BANDIT_REWARD_ASSIGNED, "bandit", {
            "arm_id": arm_id if arm_id != "arm_explicit" else "arm_01",
            "strategy_id": strategy_id,
            "reward": reward,
            "threshold": 0.75,
            "score_used": ev["score"],
        })

        self.emit(job_id, run_id, DECISION_PUBLISHED, "orchestrator", {"published": True})
        snap_id = gen_id("snap")
        self.emit(job_id, run_id, STATE_SNAPSHOT_CREATED, "orchestrator", {
            "snapshot_id": snap_id,
            "state_version": 1,
            "summary": {
                "status": "succeeded",
                "selected_strategy": strategy_id,
                "selected_council": council_id,
                "score": ev["score"],
            },
        })
        self.emit(job_id, run_id, RUN_COMPLETED, "worker", {})

        run = self.session.get(JobRun, run_id)
        run.strategy_id = strategy_id
        run.council_id = council_id
        run.eval_score = ev["score"]
        run.reward = reward
        run.status = "succeeded"
        run.completed_at = utc_now()
        self.session.flush()
