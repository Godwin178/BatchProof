# BatchProof smart contracts

`BatchProofRegistry` anchors cryptographic batch fingerprints on **Arbitrum
Sepolia (testnet)**. It is built on OpenZeppelin's `AccessControl`.

## What goes on-chain

- A single `bytes32` hash per batch — the SHA-256 fingerprint the app computes
  from the batch record (batch ID, producer, origin, production date, expiry
  date, description).
- The issuer address and the anchoring timestamp.

**Nothing else.** No business names, origins, dates or descriptions are ever
sent to the chain. The registry is an existence proof: it can demonstrate that
a fingerprint was committed at a point in time by an authorised registrar.

## Contract API

| Function | Description |
| --- | --- |
| `anchorBatch(bytes32 batchHash)` | Anchor a fingerprint (REGISTRAR_ROLE only). Reverts on empty or duplicate hashes, so records cannot be overwritten. |
| `isAnchored(bytes32 batchHash)` | `true` when the fingerprint is anchored. |
| `getAnchor(bytes32 batchHash)` | Issuer address and anchoring timestamp. |

Events: `BatchAnchored(bytes32 indexed batchHash, address indexed issuer, uint64 timestamp)`

## Setup

```bash
cd contracts
npm install
cp .env.example .env   # then fill in the RPC URL and a testnet-only key
```

Get testnet ETH for Arbitrum Sepolia from a public faucet, then:

```bash
npm run compile
npm run deploy:arbitrum-sepolia
```

After deployment, copy the printed contract address into the app's
`.env.local` as `NEXT_PUBLIC_BATCH_REGISTRY_ADDRESS`.

## Safety notes

- This repository targets **Arbitrum Sepolia only**. Do not add mainnet
  networks or deploy to mainnet.
- The deployer is granted both `DEFAULT_ADMIN_ROLE` and `REGISTRAR_ROLE`.
  Grant `REGISTRAR_ROLE` to the platform's anchoring wallet with
  `grantRole` when operating in production, and keep the admin key offline.
- `anchorBatch` is append-only: an existing hash can never be replaced.
