#!/usr/bin/env bash
set -euo pipefail

python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo "Setup complete."
echo "Start Ollama: ollama serve"
echo "Ensure model exists: ollama pull llama3.2"
echo "Run MurMur: python cli.py \"Hello from MurMur\""
