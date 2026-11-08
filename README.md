# BatchProof

Blockchain-powered product and batch verification platform. BatchProof helps
businesses register products and production batches, publish verifiable batch
histories behind unique QR codes, and anchor cryptographic batch fingerprints
on the Arbitrum Sepolia test network.

## What it does

- **Public landing page** explaining the product, its features and the
  industries it serves.
- **Accounts** — registration, login and logout powered by Supabase Auth.
- **Business dashboard** (protected) for managing products, batches, history
  and the business profile, with activity statistics.
- **Batch registration** — batch ID, producer, origin, production date, expiry
  date and description. Each record is fingerprinted with SHA-256.
- **Unique QR codes** per batch, linking to a public verification page.
- **Public verification pages** showing the batch record, its integrity hash,
  its on-chain anchor status (when configured) and its full history, with the
  ability for anyone to report a problem.
- **Batch history** — distribution checkpoints, inspection results and status
  updates form an append-only timeline.
- **Admin area** for platform administrators: user roles, public reports and
  batch revocation.
- **Privacy policy and terms** included.

## Privacy by design

Only a SHA-256 fingerprint of a batch record ever touches the blockchain. No
business names, origins, dates or any other private information is placed
on-chain. Anchoring is **disabled** until you deploy a registry contract and
configure its address — the platform never invents transactions,
confirmations or data.

## Tech stack

- [Next.js](https://nextjs.org) 14 (App Router) + TypeScript + Tailwind CSS
- [Supabase](https://supabase.com) for authentication and PostgreSQL storage
  (with row-level security — see `supabase/schema.sql`)
- [Solidity](https://soliditylang.org) + [OpenZeppelin](https://openzeppelin.com)
  + [Hardhat](https://hardhat.org) for the `BatchProofRegistry` contract
- [ethers.js](https://ethers.org) for optional in-wallet anchoring

## Project structure

```
app/                 Next.js App Router (pages, layouts, server actions)
components/          Shared UI components
lib/                 Supabase clients, auth helpers, hashing, chain config
supabase/            Database schema with row-level security
contracts/           Solidity registry + Hardhat setup (own package.json)
```

## Getting started

See [SETUP.md](SETUP.md) for a step-by-step guide: creating the Supabase
project, applying the schema, configuring environment variables, running the
app, promoting an administrator and deploying the contract to Arbitrum
Sepolia.

Quick start:

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project URL and anon key
npm run dev
```

## Smart contracts

The registry lives in `contracts/` with its own toolchain:

```bash
cd contracts
npm install
npm run compile
npm run deploy:arbitrum-sepolia
```

See [contracts/README.md](contracts/README.md) for the contract API and
safety notes. The repository targets **Arbitrum Sepolia only** — never deploy
to mainnet from here.

## License

MIT — see [LICENSE](LICENSE).
