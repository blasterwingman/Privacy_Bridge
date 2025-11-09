# Privacy Bridge MVP

A working MVP of a privacy-focused cross-chain bridge that integrates **real Solana transactions** with a Supabase-powered transaction tracking system.

## 🚀 Features

### ✅ Working Features

- **Real Solana Wallet Integration** - Connect with Phantom, Solflare, or Backpack wallets
- **Actual On-Chain Transactions** - Executes real Solana transactions when bridging FROM Solana
- **Transaction Tracking** - Stores all bridge transactions in Supabase database
- **Transaction History** - View your past bridge transactions with links to Solana Explorer
- **Beautiful UI** - Modern, responsive interface built with Tailwind CSS
- **Real-time Updates** - Automatic refresh of transaction history

### 🔄 Simulated Features (MVP Scope)

- **Midnight Network Integration** - Currently simulated; would need actual Midnight SDK
- **Privacy Mode** - UI toggle present; zero-knowledge proofs would need implementation
- **Destination Chain Transactions** - Only source (Solana) transactions are executed on-chain

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Blockchain**: Solana Web3.js, @solana/kit
- **Wallet**: Wallet Standard (supports multiple Solana wallets)
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Radix UI primitives, Lucide React icons

### Project Structure

```
privacy-bridge-mvp/
├── app/
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx            # Root layout with SolanaProvider
│   └── page.tsx              # Main page with bridge interface
├── components/
│   ├── bridge-interface.tsx      # Bridge UI with real Solana txs
│   ├── transaction-history.tsx   # Display user transactions
│   ├── wallet-connect-button.tsx # Wallet connection UI
│   ├── solana-provider.tsx       # Solana context & RPC
│   └── ui/                       # Reusable UI components
├── lib/
│   ├── supabase.ts          # Supabase client & types
│   └── utils.ts             # Utility functions
└── package.json
```

## 📦 Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Solana wallet browser extension (Phantom, Solflare, or Backpack)
- Supabase account and project

### 1. Install Dependencies

```bash
cd privacy-bridge-mvp
npm install
```

### 2. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to the SQL Editor in your Supabase dashboard
3. Run this SQL migration:

```sql
CREATE TABLE IF NOT EXISTS bridge_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  source_chain text NOT NULL,
  destination_chain text NOT NULL,
  source_token text NOT NULL,
  destination_token text NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  is_private boolean DEFAULT false,
  source_tx_hash text,
  destination_tx_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  fee_amount numeric DEFAULT 0,
  estimated_completion timestamptz
);

ALTER TABLE bridge_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view all bridge transactions"
  ON bridge_transactions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create bridge transactions"
  ON bridge_transactions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own transactions"
  ON bridge_transactions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_bridge_transactions_user_address
  ON bridge_transactions(user_address);

CREATE INDEX IF NOT EXISTS idx_bridge_transactions_status
  ON bridge_transactions(status);

CREATE INDEX IF NOT EXISTS idx_bridge_transactions_created_at
  ON bridge_transactions(created_at DESC);
```

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Get these from Supabase Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Use custom Solana RPC (defaults to devnet)
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_WS_URL=wss://api.devnet.solana.com
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 How to Use

### 1. Connect Your Wallet

- Click "Connect Wallet" in the top right
- Select your Solana wallet (Phantom, Solflare, or Backpack)
- Approve the connection request in your wallet

### 2. Bridge Assets

- Select **"Solana"** as the source chain (for real transactions)
- Enter the amount of SOL to bridge
- Select **"Midnight"** as the destination
- Toggle privacy mode if desired (simulated)
- Click **"Bridge Assets"**
- Approve the transaction in your wallet

### 3. View Transaction History

- Your completed bridges appear in the Transaction History section
- Click the "View TX" link to see the transaction on Solana Explorer
- Refresh to update the status

## ⚠️ Important Notes

### This is a Development MVP

- **Uses Solana Devnet** - No real money involved
- **Destination transactions are simulated** - Only the source Solana transaction is executed
- **Privacy features are simulated** - No actual zero-knowledge proofs implemented
- **Bridge wallet is a placeholder** - In production, this would be a program-controlled account

### Security Considerations

- Never use this with Mainnet funds
- All RLS policies are set to public for demo purposes
- Production would need proper authentication and authorization

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Key Integration Points

#### Real Solana Transactions

See `components/bridge-interface.tsx` lines 85-131 for the actual Solana transaction execution using Wallet Standard.

#### Supabase Integration

See `lib/supabase.ts` for the database client setup and TypeScript types.

#### Wallet Connection

See `components/wallet-connect-button.tsx` and `components/solana-provider.tsx` for the Wallet Standard integration.

## 🚧 Future Enhancements

To make this production-ready:

1. **Implement actual Midnight SDK integration**
2. **Add smart contracts for bridge logic**
3. **Implement real zero-knowledge proofs**
4. **Add liquidity pools and bridge validators**
5. **Implement automated destination chain transactions**
6. **Add comprehensive error handling and retry logic**
7. **Set up proper authentication in Supabase**
8. **Add transaction status updates (pending → processing → completed)**
9. **Implement fee estimation and gas optimization**
10. **Add support for more tokens (SPL tokens)**

## � Where this system is useful

This privacy-focused cross-chain bridge prototype demonstrates features and patterns that are useful in multiple real-world scenarios. Example use cases include:

- Privacy-preserving payments: enabling users to move value between chains without exposing transaction details to third parties.
- Cross-chain testing and development: a safe environment for developers to prototype bridge flows and on-chain integrations using Solana devnet and Supabase for telemetry.
- Confidential transfers for DAOs and communities: private distribution of funds or rewards where participant privacy matters.
- Layer-2 and rollup coordination: moving assets into privacy-preserving layers or rollups where metadata minimization is required.
- Regulatory-compliant privacy: integrating privacy controls while keeping an auditable trail (with appropriate governance and controls) for enterprise use.
- Educational demos and audits: showing how wallets, on-chain transactions, and off-chain tracking can be combined when researching privacy primitives.

Each of these examples shows how privacy-aware bridge designs can be leveraged for both research and production (with additional security, auditing, and cryptographic work).

## �📝 License

MIT License - Built for HackTrent 2025

## 🤝 Contributing

This is a hackathon MVP. Feel free to fork and extend!

---
## 📁 Project Structure Note

**Important:** The Privacy Bridge application files have been added directly to the root of this repository rather than in a separate `privacy_bridge_mvp` subfolder. This was done to simplify the repository structure and make it easier for reviewers and judges to access and evaluate the code.

All components, pages, and configurations are located in their respective directories at the repository root level.

# **Privacy_Bridge – Technical Overview**

Privacy_Bridge is a zero-knowledge–enabled private wallet and smart-contract system built on the **Midnight Testnet**.
It demonstrates an end-to-end pipeline for:

* Compact contract compilation
* zk-config generation
* Contract deployment
* Private balance queries
* Private transaction construction via **ZSwap**
* Wallet state synchronization via the **Midnight indexer**
* Command-line wallet operations (send / receive / history)

The project includes a **backend deployment script (`deploy.ts`)**, a **CLI wallet (`cli.ts`)**, and a **frontend UI** that communicates with the backend’s wallet logic.

---

## **1. System Architecture**

```
                           ┌─────────────────────────────┐
                           │ Midnight Testnet             │
                           │ • Ledger Node                │
                           │ • Proof Server               │
                           │ • Public Indexer + WS        │
                           └──────────────┬──────────────┘
                                          │
                                          ▼
     ┌──────────────────────────────┐     ▼
     │       Backend (Node)         │─────────────┐
     │ • deploy.ts                  │             │
     │ • cli.ts (wallet)            │             │
     │ • ZSwap + Ledger providers   │             │
     └──────────────────────────────┘             │
                    │                             │
                    ▼                             │
     ┌──────────────────────────────┐             │
     │ Smart Contract               │             │
     │ • Compact contract           │             │
     │ • Managed zk-config          │             │
     │ • Private state store        │             │
     └──────────────────────────────┘             │
                    │                             │
                    ▼                             │
     ┌──────────────────────────────┐             │
     │ Frontend (React/Next.js)     │◄────────────┘
     │ • Reads deployment.json      │
     │ • Displays wallet state      │
     │ • Sends wallet operations    │
     └──────────────────────────────┘
```

---

## **2. Core Components**

### **2.1 Compact Smart Contract**

* Written in `.compact`
* Compiled with:

  ```
  compact compile contracts/Privacy_Bridge.compact contracts/managed/Privacy_Bridge
  ```
* Outputs:

  * Bytecode
  * ZK configuration
  * Contract metadata (index.cjs)

### **2.2 ZK Configuration**

Generated automatically in:

```
contracts/managed/Privacy_Bridge/
```

Used for:

* Proof generation
* State transitions
* Hooking into ZSwap during wallet operations

### **2.3 Wallet Module**

Wallet is constructed using:

```ts
WalletBuilder.buildFromSeed(
  indexerURL,
  websocketURL,
  proofServerURL,
  nodeURL,
  seed,
  getZswapNetworkId(),
  "info"
);
```

It manages:

* Key derivation
* Ledger sync
* ZSwap private coin management
* Proof generation
* Transaction submission

---

## **3. Backend Scripts**

### ✅ **3.1 deploy.ts (Contract Deployment)**

Responsible for:

1. Importing/creating wallet
2. Syncing wallet state
3. Loading managed contract
4. Generating ZK providers
5. Deploying contract via:

   ```ts
   deployContract(providers, { ... })
   ```
6. Writing `deployment.json`

Output example:

```json
{
  "contractAddress": "mn_contract_test1...",
  "deployedAt": "2025-11-07T22:19:51.302Z"
}
```

---

### ✅ **3.2 cli.ts (Private Wallet CLI)**

Implements core wallet operations:

#### **Balance Query**

Uses:

```ts
wallet.state().pipe(...)
```

Reads shielded balance (`nativeToken()`).

#### **Send Tokens**

ZSwap pipeline:

```ts
ZswapTransaction.deserialize(...)
wallet.balanceTransaction(...)
wallet.proveTransaction(...)
Transaction.deserialize(...)
wallet.submitTransaction(...)
```

#### **Transaction History**

Uses public data provider:

```ts
publicDataProvider.queryTransactions(address)
```

#### **Receive Tokens**

Shield address is displayed to the user.
Balance auto-updates on next sync.

---

## **4. Providers**

Providers are assembled as required by Midnight DSL:

```ts
const providers = {
  privateStateProvider,
  publicDataProvider,
  zkConfigProvider,
  proofProvider,
  walletProvider,
  midnightProvider
};
```

### **4.1 Private State Provider**

Manages local encrypted storage.

### **4.2 Public Data Provider**

GraphQL + WebSocket streams for:

* Ledger inclusion
* Block height
* Contract state

### **4.3 ZK Config Provider**

Loads contract-specific zero-knowledge circuits.

### **4.4 Proof Provider**

Local:

```
http://127.0.0.1:6300
```

Generates proofs required for:

* Deploy actions
* Private method calls
* ZSwap shielding/unshielding

### **4.5 Wallet Provider**

Encapsulates:

* publicKey, encryptionKey
* ZSwap balancing algorithm
* Proof generation
* Transaction submission

---

## **5. Frontend Integration (Technical)**

Your frontend consumes:

```
deployment.json
balance endpoint
history endpoint
send endpoint
```

Common connection method:

```ts
const deployment = await fetch("/deployment.json").then(r => r.json());
```

### **Frontend Workflow**

1. User enters their seed
2. Client passes seed → backend
3. Backend constructs wallet
4. Backend returns:

   * balance
   * transactions
   * shield address
5. UI displays:

   * Real-time private balance
   * Send field (address + amount)
   * History

No contract calls are required on the frontend.

---

## **6. Security Notes**

* Seeds must never be logged or stored unencrypted
* ZSwap coins must only be deserialized via SDK
* WebSocket connections must be kept alive for sync
* Proof server must be local or trusted
* Contract state remains encrypted while stored locally

---

## **7. How To Run**

### **Compile Contract**

```
npm run compile
```

### **Deploy Contract**

```
npm run deploy
```

### **Launch Wallet CLI**

```
npm run cli
```

---

## **8. Required Dependencies**

Your `package.json` is already correct.

✅ **No changes required**
CLI and deploy scripts both rely on:

* `@midnight-ntwrk/wallet`
* `@midnight-ntwrk/zswap`
* `@midnight-ntwrk/midnight-js-*`
* `ws`

---

## **9. Technical Roadmap**

* Add shielded → unshielded bridge
* Wallet RPC server for frontend
* Contract-based multi-message storage
* Integration with multiple Compact modules
* Batch ZSwap transactions
* Automatic proof server failover

---

## **10. Summary**

Privacy_Bridge demonstrates a full private transaction pipeline on Midnight Testnet:

✔ Compact contract → zk-config → deployment
✔ Wallet creation/import
✔ ZSwap-based private transfers
✔ Shielded balance tracking
✔ CLI + frontend integration
✔ Fully local ZK proof generation


**Built with ❤️ using Next.js, Solana, and Supabase**
