# 🚀 Quick Start Guide - Privacy Bridge MVP

## Step-by-Step Setup

### Step 1: Install Dependencies (2 minutes)

```bash
cd "c:\Users\Tirth Patel\Fall2025\hacktrent 2025\HackTrent2025\privacy-bridge-mvp"
npm install
```

Wait for all packages to install.

### Step 2: Set Up Supabase (5 minutes)

1. **Create a Supabase account** at https://supabase.com (if you don't have one)

2. **Create a new project**:

   - Click "New Project"
   - Name it: `privacy-bridge-mvp`
   - Set a database password (save this!)
   - Choose a region close to you
   - Wait for the project to be ready (~2 minutes)

3. **Create the database table**:

   - In your Supabase dashboard, go to the SQL Editor (left sidebar)
   - Click "New query"
   - Copy and paste the entire SQL from `README.md` (lines 66-112)
   - Click "Run" or press Ctrl+Enter
   - You should see "Success. No rows returned"

4. **Get your API credentials**:
   - Go to Project Settings (gear icon in left sidebar)
   - Click on "API" in the settings menu
   - Copy the "Project URL" (looks like: `https://xxxxx.supabase.co`)
   - Copy the "anon public" key (long string under "Project API keys")

### Step 3: Configure Environment Variables (1 minute)

1. In the `privacy-bridge-mvp` folder, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Open `.env.local` in VS Code

3. Replace the placeholders with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here

# These are fine as defaults for devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_WS_URL=wss://api.devnet.solana.com
```

4. Save the file

### Step 4: Install a Solana Wallet (2 minutes, if needed)

If you don't have a Solana wallet installed, choose one:

- **Phantom** (Recommended): https://phantom.app/
- **Solflare**: https://solflare.com/
- **Backpack**: https://backpack.app/

After installing, create or import a wallet.

### Step 5: Get Devnet SOL (2 minutes)

Your wallet needs some devnet SOL (fake money for testing):

1. Copy your wallet address from the wallet extension
2. Go to https://faucet.solana.com/
3. Paste your address
4. Select "Devnet"
5. Click "Confirm Airdrop"
6. Wait ~30 seconds, refresh your wallet

You should now see SOL in your wallet!

### Step 6: Run the App (1 minute)

```bash
npm run dev
```

Open your browser to http://localhost:3000

### Step 7: Test the Bridge! 🎉

1. Click "Connect Wallet" (top right)
2. Select your wallet (Phantom, Solflare, or Backpack)
3. Approve the connection
4. Enter an amount (try 0.1 SOL)
5. Leave Solana → Midnight selected
6. Click "Bridge Assets"
7. Approve the transaction in your wallet
8. Watch the transaction appear in history below!
9. Click "View TX" to see it on Solana Explorer

## 🎯 What You Just Built

You now have a **working cross-chain bridge MVP** with:

✅ Real Solana wallet integration  
✅ Actual on-chain Solana transactions  
✅ Transaction tracking in Supabase  
✅ Beautiful, responsive UI  
✅ Transaction history with blockchain explorer links

## ⚠️ Troubleshooting

### "No Solana wallets detected"

- Make sure you installed a wallet extension
- Refresh the page after installing
- Try a different browser if issues persist

### "Cannot find module" errors

- Run `npm install` again
- Make sure you're in the `privacy-bridge-mvp` directory
- Delete `node_modules` and `.next` folders, then run `npm install` again

### Supabase errors

- Double-check your `.env.local` has the correct URL and key
- Make sure you ran the SQL migration in Supabase
- Check that the table `bridge_transactions` exists in Supabase dashboard

### Transaction not showing

- Click the "Refresh" button in the transaction history
- Check that your wallet is still connected
- Make sure you approved the transaction in your wallet

## 📚 Next Steps

Want to extend this? Check out the "Future Enhancements" section in `README.md` for ideas on:

- Adding real Midnight network integration
- Implementing actual zero-knowledge proofs
- Supporting more tokens (SPL tokens)
- Adding smart contracts for the bridge logic

## 🤝 Need Help?

Common issues and their solutions are in `README.md` under the "Important Notes" section.

Happy bridging! 🌉
