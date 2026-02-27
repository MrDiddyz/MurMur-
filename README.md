# MURMUR
### A Learning Constellation

MurMur is a modular intelligence infrastructure designed to help systems learn, reflect, and evolve continuously.

It is not a single AI model.
It is a coordinated ecosystem of specialized agents, simulation environments, and adaptive memory — built to optimize real-world decision-making at scale.

MurMur is designed for organizations and individuals who require **structured intelligence**, not just responses.

---

## Vision

Modern software executes instructions.
MurMur develops capability.

Our goal is to create a learning architecture where:

- Multiple AI agents specialize and collaborate
- Systems simulate possible futures before acting
- Decisions improve through reinforcement and reflection
- Knowledge compounds over time instead of resetting per session

MurMur is built as an extensible foundation for adaptive systems in business, research, and complex operational environments.

---

## Core Principles

**Modularity**
Every capability is separable, replaceable, and composable.

**Reflection**
Agents do not only act — they analyze their own performance.

**Simulation Before Execution**
Decisions can be tested in modeled environments before real deployment.

**Persistent Memory**
Learning is cumulative and structured.

**Human-Steerable Intelligence**
Users guide goals and constraints while MurMur handles optimization.

---

## System Architecture

MurMur operates as a coordinated constellation of functional layers.

### Orchestrator Engine
Central coordination layer managing agent communication, task routing, and execution cycles.

### Agent Framework
Specialized AI roles working together:

- Teacher Agent — structured reasoning and knowledge organization
- Experimental Agent — hypothesis generation and exploration
- Think Tank Simulator — multi-perspective modeling
- Reflective Agent — performance evaluation and learning synthesis

### Memory System
Persistent structured knowledge including:

- Observations
- Decisions
- Outcomes
- Behavioral patterns
- Learned strategies

### Simulation Layer
Model-based environments for:

- Scenario testing
- Behavioral economics modeling
- Market dynamics
- Reinforcement learning training

### Module Layer
Commercial or domain-specific capabilities packaged as independent extensions.

### Interface Layer
Web dashboard and control environment for visualization and system steering.

---

## Technology Stack

**Core Runtime**
- TypeScript / Node.js
- Fastify API layer

**Data Infrastructure**
- PostgreSQL (Supabase)
- Redis (Upstash)

**Frontend**
- Next.js (App Router)
- Real-time dashboards

**Simulation & Training**
- Python environments
- Gym-compatible reinforcement learning

**Infrastructure**
- Docker-first architecture
- Cloud-native deployment
- CI/CD via GitHub Actions

---

## Repository Structure

MurMur is organized as a modular codebase to support long-term scalability.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## MurMurLayer: Psycho Reactive Audio Visual Player

Route: `/winamp`

### File Tree

```text
src/murmurlayer/
  core/
    audioEngine.ts
    performanceMonitor.ts
    stateBus.tsx
    visualEngine.ts
  ui/
    eqPanel.tsx
    playerControls.tsx
    playlist.tsx
    uploadPanel.tsx
    visualCanvas.tsx
  app/
    page.tsx
src/styles/
  leopardTheme.css
src/app/winamp/page.tsx
```

### Install & Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000/winamp`.

### Performance Notes

- Visual rendering targets 60fps through `requestAnimationFrame` and quality auto-throttling.
- Performance monitor lowers visual complexity when FPS < 50.
- Analyzer cost is reduced dynamically by switching `fftSize` and increasing smoothing.
- Memory guard trims oldest uploaded images when heap pressure is high.
- Object URLs are revoked on item removal and provider unmount to avoid leaks.

### Extension Guide

- **Ableton Link / MIDI output:** add adapters in `core/audioEngine.ts` and publish transport sync state through `stateBus.tsx`.
- **Shader GPU pipeline:** replace the current canvas 2D warping in `core/visualEngine.ts` with WebGL/WebGPU shader passes.
- **Electron build:** package this Next route in an Electron shell and reuse current modules unchanged.
- **AI visuals:** stream prompt-generated images into `stateBus.addImages` and let lazy decode + bitmap cache drive rendering.
