from tools.code_tool import run_python
from tools.web_tool import search_web


def execute_tool(tool_name: str, tool_input: dict, allow_tools: list[str]):
    if tool_name not in allow_tools:
        return {"ok": False, "rejected": True, "reason": f"{tool_name} not allowed"}
    if tool_name == "code.run":
        return run_python(tool_input.get("code", "print('noop')"))
    if tool_name == "web.search":
        return search_web(tool_input.get("query", ""))
    return {"ok": False, "rejected": True, "reason": "unknown tool"}
