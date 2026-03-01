# MurMur Architecture

This document describes MurMur's system architecture, component boundaries, and cloud deployment posture for AWS and GCP-class environments.

## 1) Logical Architecture (ASCII)

```text
                        +--------------------------------+
                        |         Operator Interfaces     |
                        |  Next.js apps, dashboards, API |
                        +----------------+---------------+
                                         |
                                         v
+----------------------+    +------------+-------------+    +----------------------+
|  Identity & Policy   |--->|   Orchestration Plane    |<---|  Observability Plane |
| AuthN/AuthZ, RBAC    |    | Task router, agent loops |    | Logs, metrics, traces|
+----------+-----------+    +------+--------------------+    +----------+-----------+
           |                       |                                    |
           v                       v                                    v
+----------+-----------+    +------+--------------------+    +----------+-----------+
|  Security Controls   |    |   Intelligence Runtime    |    |  Ops & SRE Tooling   |
| Secrets, audit, KMS  |    | Prompts, decisions, sims |    | Alerts, runbooks, SLO|
+----------+-----------+    +------+--------------------+    +----------+-----------+
           |                       |                                    |
           +-----------+-----------+---------------------+--------------+
                       |                                 |
                       v                                 v
             +---------+----------+             +--------+---------+
             |  Persistent Memory |             | Transactional DB |
             | vectors, documents |             | state, workflow  |
             +---------+----------+             +--------+---------+
                       |                                 |
                       +----------------+----------------+
                                        |
                                        v
                              +---------+---------+
                              | External Services |
                              | queues, webhooks, |
                              | enterprise systems|
                              +-------------------+
```

## 2) Component Responsibilities

- **Operator Interfaces**: Human control plane for requesting execution, reviewing outcomes, and managing configuration.
- **Orchestration Plane**: Coordinates agent roles, task execution order, retries, and state transitions.
- **Intelligence Runtime**: Houses prompt assets, decision templates, reflection loops, and simulation artifacts.
- **Memory + Database**: Splits long-term memory from transactional system state to preserve both performance and traceability.
- **Security + Identity**: Enforces policy gates, signs access boundaries, and protects cryptographic material.
- **Observability + SRE**: Captures service health and decision-quality signals for remediation and optimization.

## 3) AWS-Level Deployment Diagram

```text
               +------------------------ AWS Account ------------------------+
               |                                                            |
               |  +-------------------+      +----------------------------+ |
Internet ----->|  | Route53 + WAF/ALB |----->|  ECS/EKS Services          | |
               |  +-------------------+      |  - API/Orchestrator        | |
               |                             |  - Worker/Agent Executors   | |
               |                             +--------------+-------------+ |
               |                                            |               |
               |                 +--------------------------+-----------+   |
               |                 |                                      |   |
               |        +--------v---------+                 +----------v-+ |
               |        | RDS PostgreSQL   |                 | ElastiCache| |
               |        | workflow state   |                 | Redis      | |
               |        +--------+---------+                 +------------+ |
               |                 |                                          |
               |        +--------v---------+     +-----------------------+  |
               |        | S3 Data Buckets  |     | OpenSearch/CloudWatch |  |
               |        | artifacts, logs  |     | logs, metrics, traces |  |
               |        +--------+---------+     +-----------------------+  |
               |                 |                                          |
               |   +-------------v--------------+                           |
               |   | IAM + KMS + SecretsManager |                           |
               |   +----------------------------+                           |
               +------------------------------------------------------------+
```

## 4) GCP-Level Deployment Diagram

```text
               +----------------------- GCP Project ------------------------+
               |                                                           |
Internet ----->| +---------------------+   +-----------------------------+ |
               | | Cloud Armor + LB    |-->| GKE / Cloud Run Services    | |
               | +---------------------+   | - API/Orchestrator          | |
               |                           | - Worker/Agent Executors     | |
               |                           +---------------+--------------+ |
               |                                           |                |
               |             +-----------------------------+------------+   |
               |             |                                          |   |
               |      +------v------+                         +---------v--+ |
               |      | Cloud SQL   |                         | Memorystore| |
               |      | PostgreSQL  |                         | Redis      | |
               |      +------+------+
               |             |                                          |   |
               |      +------v------+                     +-------------v-+ |
               |      | GCS Buckets  |                     | Cloud Logging | |
               |      | artifacts    |                     | Monitoring    | |
               |      +------+------+
               |             |                                          |   |
               | +-----------v------------+                             |   |
               | | IAM + KMS + SecretMgr  |<----------------------------+   |
               | +------------------------+                                 |
               +-----------------------------------------------------------+
```

## 5) Deployment Notes

- Treat orchestration and agent workers as independently scalable workloads.
- Keep transactional state and long-term memory physically separated.
- Enforce private networking between compute and data planes.
- Centralize audit logs and retain immutable execution metadata.
- Use canary/blue-green rollout strategies for agent and prompt-runtime updates.
