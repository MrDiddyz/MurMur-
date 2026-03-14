# Documentation Log

## 2026-03-08 — Creator Studio NFT flow foundation

Implemented a first-pass Creator Studio domain pipeline in workspace packages.

### Added packages
- `@murmur/blockchain`
  - `BlockchainMinter` with mint + owner-scoped gallery reads.
  - Mint receipts include `tokenId`, `transactionHash`, `metadataUri`, owner, and timestamp.
- `@murmur/nft-pipeline`
  - `CreatorStudioService` that runs:
    1. upload image (input accepted as bytes)
    2. pin image to IPFS (deterministic mock URI)
    3. generate metadata with image URI
    4. pin metadata to IPFS (deterministic mock URI)
    5. mint NFT through `@murmur/blockchain`
    6. refresh gallery from blockchain-minted state

### Notes
- The flow currently uses deterministic mock IPFS addresses and in-memory mint state to preserve pipeline shape while keeping the implementation test/dev friendly.
- Gallery refresh is always sourced from the blockchain minter state to avoid invented gallery entries.
