from core.memory.store import memory


class ReflectionAgent:
    def evaluate(self):
        if not memory.records:
            return

        avg_error = sum(r["error"] for r in memory.records) / len(memory.records)

        print("SYSTEM PERFORMANCE")
        print("Average prediction error:", avg_error)

        if abs(avg_error) > 0.2:
            print("Adjusting strategies...")


reflection_agent = ReflectionAgent()
