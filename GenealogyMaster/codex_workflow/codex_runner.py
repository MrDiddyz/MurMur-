"""Run Codex prompts and write generated code to disk."""

from __future__ import annotations

import argparse
import os
from pathlib import Path


def _resolve_path(path_value: str, base_dir: Path) -> Path:
    path = Path(path_value)
    if path.is_absolute():
        return path
    return (base_dir / path).resolve()


def run_codex(
    prompt_file: str,
    output_file: str,
    model: str = "gpt-5-codex",
    temperature: float = 0.0,
) -> None:
    """Read a prompt file, call Codex, and save generated code output."""
    base_dir = Path(__file__).resolve().parent
    prompt_path = _resolve_path(prompt_file, base_dir)
    output_path = _resolve_path(output_file, base_dir)

    if not prompt_path.exists():
        raise FileNotFoundError(f"Prompt file not found: {prompt_path}")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")

    prompt = prompt_path.read_text(encoding="utf-8")

    from openai import OpenAI

    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
    )

    code_output = response.choices[0].message.content or ""

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(code_output, encoding="utf-8")

    print(f"Codex har generert kode: {output_path}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run Codex prompt -> code generation workflow")
    parser.add_argument(
        "--prompt-file",
        default="prompts/generate_endpoint.txt",
        help="Path to prompt template input file (absolute or relative to codex_workflow/).",
    )
    parser.add_argument(
        "--output-file",
        default="results/person_router_generated.py",
        help="Path for generated code output (absolute or relative to codex_workflow/).",
    )
    parser.add_argument("--model", default="gpt-5-codex", help="OpenAI model name.")
    parser.add_argument("--temperature", type=float, default=0.0, help="Sampling temperature.")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    run_codex(
        prompt_file=args.prompt_file,
        output_file=args.output_file,
        model=args.model,
        temperature=args.temperature,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
