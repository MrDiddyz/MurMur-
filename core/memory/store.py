import json
from datetime import datetime


class MemoryStore:
    def __init__(self):
        self.records = []

    def log(self, agent, decision, expected, actual):
        self.records.append(
            {
                "time": datetime.utcnow().isoformat(),
                "agent": agent,
                "decision": decision,
                "expected": expected,
                "actual": actual,
                "error": expected - actual,
            }
        )


memory = MemoryStore()
