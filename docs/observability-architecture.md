# MurMur Observability & Agent Orchestration Architecture

This document captures the proposed end-to-end telemetry and autonomous response flow for MurMur.

## High-level flow

```mermaid
flowchart TD
    A[Apps / Services / Edge Nodes\n- iPhone backend API\n- Worker jobs\n- DB / cache / gateway\n- Raspberry Pi nodes optional]

    A -->|metrics: /metrics\ntraces + logs: OTLP| B[OpenTelemetry Collector\n- receivers: otlp, prometheus\n- processors: batch, resource, attributes\n- exporters: prometheus, loki, tempo]

    B -->|metrics| C[Prometheus\nTSDB + rules + alerts]
    C --> D[Grafana dashboards]
    B -->|traces/logs| E[Tempo + Loki]
    E --> D

    C -->|alerts / snapshots / correlations| F[AsyncObservabilityAgent\n- normaliserer: Telemetry -> MurMurEvent\n- korrelerer: metric + log + trace\n- sender: MurMur Event Bus]

    F --> G[MurMur Core Event Bus\nNATS / Redis Streams / Kafka-light]

    G --> H[Teacher Agent / Reflective Agent\nforklaringer + læring]
    G --> I[Healer Agent\nauto-repair actions via executor]
    G --> J[Growth/Experiment Agent\nA/B + KPI]

    G --> K[Audit + Knowledge\n- hendelseslogg\n- runbooks markdown\n- beslutningsgrunnlag]

    D --> L[Grafana dashboards + Prometheus alerts + MurMur incident log]
    C --> L
    K --> L

    L --> M[Power BI dataset / Fabric / Excel export]
    M --> N[Copilot i Power BI]

    L --> O[Teams notifications via webhook]
    O --> P[Copilot i Teams]

    L --> Q[SharePoint/OneDrive runbooks + postmortems]
    Q --> R[Copilot kan skrive/oppdatere docs]
```

## Responsibilities by layer

- **Instrumentation producers** emit metrics and OTLP traces/logs from app and edge runtimes.
- **OpenTelemetry Collector** centralizes ingestion, processing, enrichment, and fan-out.
- **Prometheus + Grafana + Tempo + Loki** provide primary observability UX and durable telemetry backends.
- **AsyncObservabilityAgent** converts raw telemetry into domain events (`MurMurEvent`) with cross-signal correlation.
- **MurMur Core Event Bus** distributes correlated events to autonomous agents for explanation, healing, and growth.
- **Audit + Knowledge** persist decisions and context as a replayable operational memory.


## Copilot-friendly dissemination layer

To support the additional collaboration flow, MurMur should produce a consolidated incident context stream from:

- Grafana dashboards
- Prometheus alerts
- MurMur incident log

From this shared stream, publish to Microsoft 365 touchpoints:

- **Power BI / Fabric / Excel export** for analytical copilots and executive reporting.
- **Teams webhooks** for real-time notifications and conversational triage in Copilot for Teams.
- **SharePoint / OneDrive** for runbooks and postmortems so Copilot can draft and update operational docs.

## Recommended data contracts

1. Define a `MurMurEvent` schema with:
   - source service / node
   - event category (`metric_alert`, `trace_anomaly`, `log_pattern`, `correlated_incident`)
   - severity and confidence
   - correlation keys (trace id, span id, service, environment, deploy version)
   - suggested actions + provenance
2. Require every autonomous agent output to include:
   - reasoned explanation
   - executed / proposed action
   - expected KPI impact
   - rollback instruction (if actioning)
3. Store all decisions with links to the originating telemetry to preserve auditability.

## Implementation notes

- Start with **NATS** for low-friction event bus setup; evolve to Redis Streams or Kafka if retention/replay needs grow.
- Keep correlation rules in versioned config and treat them as production code.
- Add runbook references directly to generated incidents to reduce mean time to recovery.
- Ensure all repair actions are idempotent and gated by policy.
- Add a small export adapter that maps `MurMurEvent` to Power BI/Teams/SharePoint payload shapes (with PII redaction).

