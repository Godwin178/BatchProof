# BatchProof setup guide

This guide takes you from a clean clone to a fully working platform:
database, authentication, dashboard, QR verification, and — optionally —
on-chain batch fingerprint anchoring on Arbitrum Sepolia.

---

## 1. Prerequisites

- Node.js 18.17 or newer
- A free [Supabase](https://supabase.com) account
- For anchoring (optional): a MetaMask wallet and free [Arbitrum Sepolia
  testnet ETH](https://faucets.chain.link/arbitrum-sepolia) from a faucet

## 2. Install dependencies

```bash
npm install
```

## 3. Create the Supabase project

1. In the Supabase dashboard, create a new project (any name; pick a region
   close to you).
2. When the project is ready, open **Project Settings → API** and copy:
   - **Project URL**
   - **anon public key** (the publishable one — never the service role key)

## 4. Apply the database schema

1. In the Supabase dashboard open **SQL Editor**.
2. Paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql)
   and run it.

The script creates the `profiles`, `products`, `batches`, `batch_events` and
`reports` tables, row-level security policies, the trigger that creates a
profile on signup, and the helper functions that prevent privilege
escalation.

In **Authentication → Providers**, make sure **Email** is enabled. Email
confirmation can stay on — the register screen tells users to check their
inbox — or turn it off for faster local testing.

## 5. Configure environment variables

```bash
cp .env.example .env.local
```

Then fill in:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Your Supabase anon key |
| `NEXT_PUBLIC_APP_URL` | yes | Public base URL used inside QR codes (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_BATCH_REGISTRY_ADDRESS` | no | Deployed `BatchProofRegistry` address (enables anchoring) |
| `NEXT_PUBLIC_CHAIN_ID` | no | Defaults to `421614` (Arbitrum Sepolia) |

## 6. Run the app

```bash
npm run dev
```

Open `http://localhost:3000`. Register a business account, add a product,
register a batch and download its QR code. Scanning (or opening) the QR link
shows the public verification page for that batch.

> If you set `NEXT_PUBLIC_APP_URL` to your LAN address (e.g.
> `http://192.168.x.x:3000`), QR codes from your dev machine are scannable by
> a phone on the same network.

## 7. Promote an administrator

The first account is a normal user. To make yourself an admin, sign up in the
app, then run in the Supabase SQL editor:

```sql
update public.profiles
set role = 'admin'
where contact_email = 'you@example.com';
```

The admin appears in the dashboard sidebar as **Admin** with access to user
roles, public reports and batch revocation.

## 8. Blockchain anchoring (optional)

The app works fully without a blockchain: every batch still has its SHA-256
fingerprint and full public history. Anchoring adds a tamper-evident,
timestamped proof of the fingerprint on Arbitrum Sepolia.

### Deploy the registry

```bash
cd contracts
npm install
cp .env.example .env
```

Edit `contracts/.env`:

- `ARBITRUM_SEPOLIA_RPC_URL` — any Arbitrum Sepolia JSON-RPC endpoint
- `DEPLOYER_PRIVATE_KEY` — a **dedicated testnet-only wallet** key holding
  faucet ETH

Then:

```bash
npm run compile
npm run deploy:arbitrum-sepolia
```

The script prints the deployed contract address. Add it to `.env.local`:

```
NEXT_PUBLIC_BATCH_REGISTRY_ADDRESS=0x…
```

Restart `npm run dev`. From now on, every batch detail page shows an
**Anchor fingerprint on Arbitrum Sepolia** button. Clicking it:

1. Asks your connected wallet to switch/add the Arbitrum Sepolia network,
2. Sends a transaction calling `anchorBatch(bytes32)` with the batch's
   32-byte SHA-256 fingerprint — **only the hash**, never business data,
3. Waits for the transaction to be mined, then records the real transaction
   hash on the batch record.

If anything fails — no wallet, wrong network, rejected transaction — the
button reports it and records nothing. Anchoring is append-only: a
fingerprint can never be overwritten.

### Verify on-chain

Every anchored batch links its transaction on
[Arbiscan (Sepolia)](https://sepolia.arbiscan.io) from both the dashboard and
the public verification page.

## 9. Production notes

- This repository deliberately targets **Arbitrum Sepolia (testnet)**. Do not
  deploy to mainnet without a security review.
- Row-level security is the primary data boundary; the Supabase service role
  key is never used by the app and should never be added to the frontend.
- Deploy on a platform that runs Next.js (Vercel, Fly.io, a Node server) and
  set the same environment variables there, with `NEXT_PUBLIC_APP_URL`
  pointing at the public domain.
- Batch data is intentionally public via verification pages — publish only
  what you are happy for anyone with the QR code to see.

## 10. Troubleshooting

- **`Invalid API key` / `supabaseUrl is required`** — `.env.local` is missing
  or wrong; check the URL and anon key from Project Settings → API.
- **Login loops back to /login** — make sure email confirmation is either
  completed or disabled in Supabase Auth settings.
- **"Blockchain anchoring is not configured"** — expected until step 8 is
  completed; the dashboard overview shows the same status.
- **Schema errors on re-run** — `create trigger` statements use
  `drop trigger if exists`; tables use `create table if not exists`. If a
  policy name conflicts, drop it first (`drop policy <name> on <table>;`).
