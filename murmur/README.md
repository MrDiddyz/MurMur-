# MURMUR LOCAL AI ENGINE

MURMUR LOCAL AI ENGINE is a minimal, production-style local AI project built with Python and Ollama.
It provides a simple CLI, a modular prompt system, and structured output logging.

## Features

- Local inference using Ollama (`llama3.2`)
- CLI interface for one-shot prompts
- Prompt modules (`system` and `creative`)
- Timestamped output files in `outputs/`
- JSON logging (`outputs/log.json`)
- Clean structure ready for future multi-agent, API, and dashboard expansion

## Project Structure

```
murmur/
  app.py
  cli.py
  config.py
  requirements.txt
  README.md

  prompts/
    system.txt
    creative.txt

  core/
    engine.py
    logger.py

  outputs/
    .gitkeep

  scripts/
    run.bat
    setup.sh

  .env.example
```

## Install Ollama

1. Install Ollama from [https://ollama.com](https://ollama.com)
2. Start the Ollama runtime:

```bash
ollama serve
```

3. Pull the model:

```bash
ollama pull llama3.2
```

## Setup

From the `murmur/` directory:

```bash
bash scripts/setup.sh
```

## Run

```bash
python cli.py "Explain local-first AI architecture in 3 bullets"
```

or:

```bash
python app.py "Explain local-first AI architecture in 3 bullets"
```

On each run, MurMur:
- prints the model response
- writes `outputs/response_YYYYMMDD_HHMMSS.txt`
- appends a log entry to `outputs/log.json`

## Example

```bash
python cli.py "Write a short plan for building a multi-agent local AI stack"
```
