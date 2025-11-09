# Privacy Bridge MVP - Setup Checklist

Use this checklist to track your setup progress!

## ✅ Setup Checklist

### 1. Project Setup

- [ ] Opened terminal in the `privacy-bridge-mvp` folder
- [ ] Ran `npm install` successfully
- [ ] All dependencies installed (no errors)

### 2. Supabase Setup

- [ ] Created Supabase account at supabase.com
- [ ] Created new project named "privacy-bridge-mvp"
- [ ] Waited for project to finish initializing (~2 min)
- [ ] Opened SQL Editor in Supabase dashboard
- [ ] Copied SQL from `supabase_schema.sql`
- [ ] Pasted and ran SQL (saw "Success" message)
- [ ] Verified table exists in Table Editor

### 3. Environment Variables

- [ ] Copied `.env.example` to `.env.local`
- [ ] Got Supabase URL from Project Settings > API
- [ ] Got Supabase Anon Key from Project Settings > API
- [ ] Pasted both values into `.env.local`
- [ ] Saved the file

### 4. Wallet Setup

- [ ] Installed Solana wallet extension (Phantom/Solflare/Backpack)
- [ ] Created or imported a wallet
- [ ] Got devnet SOL from https://faucet.solana.com/
- [ ] Verified SOL balance shows in wallet (~2-5 SOL)

### 5. Run the App

- [ ] Ran `npm run dev` in terminal
- [ ] Saw "Ready" message (no errors)
- [ ] Opened http://localhost:3000 in browser
- [ ] Page loaded successfully

### 6. Test the Bridge

- [ ] Clicked "Connect Wallet" button
- [ ] Selected wallet from dropdown
- [ ] Approved connection in wallet popup
- [ ] Saw wallet address appear in header
- [ ] Entered amount (e.g., 0.1 SOL)
- [ ] Clicked "Bridge Assets"
- [ ] Approved transaction in wallet
- [ ] Saw success message
- [ ] Transaction appeared in history below
- [ ] Clicked "View TX" link
- [ ] Verified transaction on Solana Explorer

## 🎉 Success Criteria

If you checked all boxes above, congratulations! You have:

- ✅ A working privacy bridge MVP
- ✅ Real Solana blockchain integration
- ✅ Transaction tracking with Supabase
- ✅ Beautiful UI with wallet connection
- ✅ Full transaction history

## 🐛 Troubleshooting

### If `npm install` fails:

1. Check Node.js version: `node --version` (should be 18+)
2. Delete `node_modules` folder and `package-lock.json`
3. Run `npm install` again

### If wallet doesn't connect:

1. Check that wallet extension is installed
2. Refresh the page
3. Try a different browser
4. Make sure wallet is unlocked

### If transaction fails:

1. Check you have devnet SOL
2. Check wallet is still connected
3. Try a smaller amount
4. Check console for errors (F12)

### If history doesn't show:

1. Click the "Refresh" button
2. Check `.env.local` has correct Supabase credentials
3. Check Supabase table exists
4. Check browser console for errors

## 📝 Notes

**Estimated setup time**: 15-20 minutes for first-time setup

**Need help?**: Check these files in order:

1. `START_HERE.md` - Overview and quick start
2. `SETUP.md` - Detailed step-by-step guide
3. `README.md` - Full technical documentation
4. `PROJECT_SUMMARY.md` - Architecture and how it works

## 🚀 Ready to Demo?

Once all checkboxes are complete, you're ready to:

- Demo the bridge to your team
- Present at the hackathon
- Deploy to Vercel/Netlify
- Extend with more features

Good luck! 🎉
