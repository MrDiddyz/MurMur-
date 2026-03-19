from dataclasses import dataclass


@dataclass
class ToolResult:
    ok: bool
    stdout: str = ""
    stderr: str = ""
    reason: str = ""
    duration_ms: int = 0
