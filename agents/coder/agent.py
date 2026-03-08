from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Optional, Sequence

import openai


DEFAULT_SYSTEM_PROMPT = (
    "You are a specialized coding agent. "
    "Generate clean, correct, production-ready code based on the user's task. "
    "Return ONLY code unless otherwise asked."
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
    """LLM-agent som genererer kode basert på instruksjoner fra pipeline."""

    model: str = "gpt-4.1-codex"
    system_prompt: str = DEFAULT_SYSTEM_PROMPT
    api_client: Optional[object] = None

    def __post_init__(self) -> None:
        # Tillat dependency injection i tester, ellers bruk openai-modulen direkte.
        if self.api_client is None:
            self.api_client = openai

    def handle(self, instructions: str) -> str:
        response = self.api_client.ChatCompletion.create(
            model=self.model,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": instructions},
            ],
            temperature=0.2,
        )
        return response["choices"][0]["message"]["content"]


class ReviewerAgent(BaseAgent):
    def handle(self, code: str) -> str:
        return f"Review: Koden ser riktig ut.\n\n{code}"


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
