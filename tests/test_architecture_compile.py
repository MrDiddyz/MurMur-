import unittest

from fastapi import HTTPException

from app import ArchitectureSpec, compile_architecture


class ArchitectureCompileTests(unittest.TestCase):
    def _base_spec(self) -> dict:
        return {
            "id": "arch_001",
            "topology": "hierarchical",
            "agents": [
                {"role": "planner", "model": "reasoner", "memory": "short"},
                {"role": "researcher", "model": "fast", "memory": "vector"},
                {"role": "critic", "model": "reasoner", "memory": "short"},
                {"role": "executor", "model": "tool_user", "memory": "none"},
            ],
            "routing": [
                ["planner", "researcher"],
                ["researcher", "critic"],
                ["critic", "executor"],
            ],
            "loops": {"self_reflection": True, "max_iterations": 3},
            "voting": {"enabled": False},
        }

    def test_compile_hierarchical_architecture(self) -> None:
        compiled = compile_architecture(ArchitectureSpec(**self._base_spec()))
        self.assertEqual(compiled.id, "arch_001")
        self.assertEqual(len(compiled.execution_stages), 3)
        self.assertEqual(compiled.execution_stages[0]["from"], "planner")
        self.assertEqual(compiled.execution_stages[-1]["to"], "executor")
        self.assertTrue(compiled.self_reflection)
        self.assertEqual(compiled.max_iterations, 3)

    def test_rejects_unknown_routing_role(self) -> None:
        spec = self._base_spec()
        spec["routing"] = [["planner", "missing"]]
        with self.assertRaises(HTTPException):
            compile_architecture(ArchitectureSpec(**spec))

    def test_rejects_non_hierarchical_topology(self) -> None:
        spec = self._base_spec()
        spec["topology"] = "mesh"
        with self.assertRaises(HTTPException):
            compile_architecture(ArchitectureSpec(**spec))


if __name__ == "__main__":
    unittest.main()
