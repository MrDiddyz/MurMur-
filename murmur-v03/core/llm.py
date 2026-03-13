from hashlib import sha256


class MockLLM:
    model = "mock-llm"

    def generate(self, role: str, task: str, context: dict) -> str:
        digest = sha256(f"{role}|{task}|{context}".encode()).hexdigest()[:12]
        return f"{role} deterministic output for '{task}' [{digest}]"
