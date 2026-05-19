# Architecture

MurMur Core is split into modules: Archive, Signal, Council, Events, and Dashboard. APIs call typed services in `lib/*`, validated with Zod, and emit events for observability.
