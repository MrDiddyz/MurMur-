from __future__ import annotations

import json
from pathlib import Path


class ContractValidationError(ValueError):
    pass


def load_contract_schema(name: str) -> dict:
    root = Path(__file__).resolve().parents[1] / "contracts"
    with open(root / f"{name}.schema.json", "r", encoding="utf-8") as f:
        return json.load(f)


def validate_contract(name: str, payload: dict) -> None:
    schema = load_contract_schema(name)
    required = schema.get("required", [])
    missing = [key for key in required if key not in payload]
    if missing:
        raise ContractValidationError(f"missing required keys: {', '.join(missing)}")
