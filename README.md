# MurMur AI

MurMur is an AI art platform + NFT marketplace built with Next.js, Tailwind, Ethers, IPFS, and Solidity.

## Features

- AI artwork generation
- IPFS upload through a server-side route
- NFT minting
- basic marketplace foundation
- wallet connection

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Ethers v6
- Pinata IPFS
- Solidity

## Getting Started

```bash
npm install
npm run dev
```

## Video generation script

A helper script is available to call the AI SDK video endpoint:

```bash
npm run video:generate -- --image "https://example.com/your-image.png" --text "The scene slowly comes to life with gentle movement" --duration 5 --output output.mp4
```

Environment variable overrides are also supported:

- `VIDEO_MODEL` (default: `alibaba/wan-v2.6-i2v`)
- `VIDEO_SOURCE_IMAGE`
- `VIDEO_PROMPT`
- `VIDEO_DURATION`
- `VIDEO_OUTPUT`

The script expects the AI SDK provider credentials in your environment (for example via `.env`).

