from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Optional, Sequence

from openai import OpenAI


DEFAULT_SYSTEM_PROMPT = (
    "You are a specialized coding agent. "
    "Generate clean, correct, production-ready code based on the user's task. "
    "Return ONLY code unless otherwise asked."
)

REVIEW_SYSTEM_PROMPT = (
    "You are an advanced code reviewer. "
    "Analyze the provided code for correctness, structure, readability, "
    "security issues, edge cases, performance concerns, and overall quality. "
    "Suggest specific improvements and provide corrected examples when relevant."
)


class BaseAgent:
    """Minimalt agent-grensesnitt for Coordinator-pipeline."""

    def handle(self, input_text: str) -> str:
        raise NotImplementedError


class Coordinator:
    def __init__(self, agents: Dict[str, BaseAgent]):
        self.agents = agents

    def run_pipeline(self, task: str, sequence: Sequence[str]) -> str:
        """Kjør oppgaven gjennom en navngitt agent-sekvens."""
        current_payload = task

        for agent_name in sequence:
            if agent_name not in self.agents:
                raise ValueError(f"Agent '{agent_name}' finnes ikke i Coordinator.")

            agent = self.agents[agent_name]
            print(f"\n=== Kjører agent: {agent_name} ===")
            current_payload = agent.handle(current_payload)
            print(f"Resultat fra {agent_name}:\n{current_payload}\n")

        return current_payload


@dataclass
class CoderAgent(BaseAgent):
    model: str = "gpt-4.1"
    system_prompt: str = DEFAULT_SYSTEM_PROMPT
    client: Optional[OpenAI] = None

    def __post_init__(self) -> None:
        if self.client is None:
            self.client = OpenAI()

    def generate_code(self, task_description: str) -> str:
        response = self.client.responses.create(
            model=self.model,
            input=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": task_description},
            ],
            temperature=0.2,
        )
        return response.output_text.strip()

    def handle(self, instructions: str) -> str:
        return self.generate_code(instructions)


@dataclass
class ReviewerAgent(BaseAgent):
    model: str = "gpt-4.1"
    system_prompt: str = REVIEW_SYSTEM_PROMPT
    client: Optional[OpenAI] = None

    def __post_init__(self) -> None:
        if self.client is None:
            self.client = OpenAI()

    def handle(self, code: str) -> str:
        response = self.client.responses.create(
            model=self.model,
            input=[
                {"role": "system", "content": self.system_prompt},
                {
                    "role": "user",
                    "content": (
                        "Analyser denne koden og svar med: "
                        "1) Funn, 2) Konkrete forbedringer, 3) Forbedret kodeeksempel.\n\n"
                        f"{code}"
                    ),
                },
            ],
            temperature=0.1,
        )
        return response.output_text.strip()


class ArchitectAgent(BaseAgent):
    def handle(self, task: str) -> str:
        return f"Foreslått arkitektur for: {task}"


if __name__ == "__main__":
    coordinator = Coordinator(
        agents={
            "architect": ArchitectAgent(),
            "coder": CoderAgent(),
            "reviewer": ReviewerAgent(),
        }
    )

    task = "Lag en klasse UserManager som kan opprette og hente brukere."

    # Full pipeline med arkitektur -> kode -> review
    full_sequence = ["architect", "coder", "reviewer"]
    full_result = coordinator.run_pipeline(task, full_sequence)
    print("\n=== Endelig resultat (full pipeline) ===")
    print(full_result)

    # Ren kodeanalyse-pipeline
    review_sequence = ["coder", "reviewer"]
    review_result = coordinator.run_pipeline(task, review_sequence)
    print("\n=== Endelig resultat (kodeanalyse-pipeline) ===")
    print(review_result)
