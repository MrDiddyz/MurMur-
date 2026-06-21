# Agent Event Bus PoC

A lightweight proof-of-concept that captures event contracts and validates a system topology before publishing topology updates.

## Layout

- `bus/schemas/` - JSON Schema contracts for events.
- `bus/samples/` - sample event payloads used for dry runs.
- `system/topology.json` - declarative graph for module dependencies.
- `system/invariants.js` - static checks for topology integrity.
- `scripts/emit-event.js` - emits an event from a JSON file (stdout by default).

## Quick start

```bash
cd agent-event-bus-poc
npm run check:topology
npm run emit:topology
npm run emit:health
```

## CI

- `topology-check.yml` runs `npm run check:topology`.
- `event-bus-listener.yml` listens for `repository_dispatch` events (`module.health.v1`, `topology.changed.v1`) and dispatches `topology-check.yml`.

## Optional webhook publish

Set `EVENT_BUS_WEBHOOK_URL` to POST event JSON to an endpoint:

```bash
EVENT_BUS_WEBHOOK_URL=https://example.com/events npm run emit:topology
```

If unset, events are printed to stdout.
