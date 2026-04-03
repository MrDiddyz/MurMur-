from __future__ import annotations

import argparse
from datetime import datetime, timezone

from config import OUTPUTS_DIR, ensure_outputs_dir
from core.engine import run_murmur
from core.logger import MurmurLogger


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="MurMur Local AI Engine CLI")
    parser.add_argument("prompt", type=str, help="Prompt text to send to MurMur")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    ensure_outputs_dir()

    response = run_murmur(args.prompt)
    print(response)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    output_file = OUTPUTS_DIR / f"response_{timestamp}.txt"
    output_file.write_text(response, encoding="utf-8")

    logger = MurmurLogger(OUTPUTS_DIR / "log.json")
    logger.log(prompt=args.prompt, response=response)


if __name__ == "__main__":
    main()
