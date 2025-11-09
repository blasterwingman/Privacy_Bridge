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

## 📝 License

MIT License - Built for HackTrent 2025

## 🤝 Contributing

This is a hackathon MVP. Feel free to fork and extend!

---

**Built with ❤️ using Next.js, Solana, and Supabase**
