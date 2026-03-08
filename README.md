# MurMur AI System

MurMur is an AI art ecosystem that combines creative generation pipelines, orchestration, creator tooling, marketplace publishing, and immersive gallery experiences.

## Main Modules

- **AI Art Engine**
- **AI Art Orchestra**
- **NFT Marketplace**
- **Creator Studio**
- **Metaverse Gallery**

## Development

Install dependencies:

```bash
npm install
```

Start the development environment:

```bash
npm run dev
```

Run the AI Orchestra:

```bash
npm run orchestra
```

## Architecture

- `agents/` — AI agents responsible for creative generation and orchestration.
- `engines/` — Core pipelines for AI art generation, IPFS storage, and NFT minting.
- `apps/` — Frontend applications (Next.js).
- `blockchain/` — Smart contracts and deployment scripts.

## Rules for Agents

- Never modify smart contracts without explicit instruction.
- All generated art must be stored via the IPFS engine.
- NFT minting must go through the `nft-engine`.
- Frontend architecture must remain modular.

## Agent Workflow

1. Generate artwork.
2. Upload artwork.
3. Generate metadata.
4. Upload metadata.
5. Mint NFT.
6. Publish to marketplace.

## Legacy Base Stack (Infrastructure)

This repository also contains a minimal 1-server infrastructure skeleton using FastAPI + Postgres + Nginx via Docker Compose.

### Run infrastructure stack

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```
2. Build and start services:
   ```bash
   docker compose up -d --build
   ```
3. Check health endpoint via Nginx:
   ```bash
   curl http://localhost/health
   ```
