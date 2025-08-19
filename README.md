# TypeScript - Mini Ledger Solana

## 📌 Solution Abstract
A minimal TypeScript implementation of a Solana-like ledger with Proof of History (PoH). Built with TDD (Vitest) and Fastify. Educational project to understand blockchain internals.

- **PoH (Proof of History)** as monotonic sha256 "ticks" collected in **Entry** and grouped in **Slot**.
- **Leader mode**: generates PoH, accepts signed transactions, buffers them in entries and produces a log `/ledger`.
- **Validator mode**: accepts foreign slots via `/ingest`, recalculates PoH, verifies signatures and *replays* transactions to a local bank, converging with the leader state.
- **Anti-replay** by signature and `recent_hash` window to protect against "stale" transactions.

Suitable for **TDD/demo/study**, and as a skeleton mini-sandbox based on Solana design.

## ⚙️ How to use

### Setup 

####  1. Install pnpm (via Corepack)

Try this (Node 20 already includes Corepack):

```
corepack enable
corepack prepare pnpm@9 --activate
pnpm -v
```

#### 2. Create and initialize a minimal project

(for instance ~/solana/mini_ledger_typescript)

```
git init
pnpm init
pnpm add -D typescript tsx vitest @types/node
```

#### 3. Install minimal dev dependencies

```
pnpm add -D typescript tsx vitest @types/node
```

#### 4. Create folders

```
mkdir -p src/api src/core src/test
```

### Test

` pnpm test`

### Run
` pnpm dev`
