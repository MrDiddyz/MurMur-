import argparse
import json

import requests

BASE = "http://localhost:8000/v1"


def main():
    parser = argparse.ArgumentParser("murmurs")
    sub = parser.add_subparsers(dest="cmd", required=True)

    j = sub.add_parser("job")
    j.add_argument("--task", required=True)
    j.add_argument("--context", default="")
    j.add_argument("--mode", default="auto")

    s = sub.add_parser("status")
    s.add_argument("--job", required=True)

    e = sub.add_parser("events")
    e.add_argument("--job", required=True)

    r = sub.add_parser("replay")
    r.add_argument("--job", required=True)

    t = sub.add_parser("timeline")
    t.add_argument("--job", required=True)

    sub.add_parser("bandits").add_argument("--list", action="store_true")

    args = parser.parse_args()
    if args.cmd == "job":
        ctx = {}
        if args.context:
            with open(args.context) as f:
                ctx = json.load(f)
        body = {
            "task": args.task,
            "context": ctx,
            "mode": args.mode,
            "council": ["architect", "builder", "critic", "experimenter", "synthesizer"],
            "allow_tools": ["code.run"],
        }
        print(requests.post(f"{BASE}/jobs", json=body, timeout=10).json())
    elif args.cmd == "status":
        print(requests.get(f"{BASE}/jobs/{args.job}", timeout=10).json())
    elif args.cmd == "events":
        print(requests.get(f"{BASE}/jobs/{args.job}/events", timeout=10).json())
    elif args.cmd == "replay":
        print(requests.get(f"{BASE}/jobs/{args.job}/replay", timeout=10).json())
    elif args.cmd == "timeline":
        print(requests.get(f"{BASE}/jobs/{args.job}/timeline", timeout=10).json())
    elif args.cmd == "bandits":
        print(requests.get(f"{BASE}/bandits", timeout=10).json())


if __name__ == "__main__":
    main()
