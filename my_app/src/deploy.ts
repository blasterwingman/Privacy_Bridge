import * as readline from "readline/promises";
import * as Rx from "rxjs";
import { WebSocket } from "ws";
import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { type Wallet } from "@midnight-ntwrk/wallet-api";
import {
  NetworkId,
  setNetworkId,
  getZswapNetworkId,
  getLedgerNetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";
import { createBalancedTx } from "@midnight-ntwrk/midnight-js-types";
import { Transaction as ZswapTransaction } from "@midnight-ntwrk/zswap";
import { Transaction } from "@midnight-ntwrk/ledger";
import {
  httpClientProofProvider,
} from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import {
  indexerPublicDataProvider,
} from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import {
  NodeZkConfigProvider,
} from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import {
  levelPrivateStateProvider,
} from "@midnight-ntwrk/midnight-js-level-private-state-provider";

// Fix WebSocket for Node.js environment
// @ts-ignore
globalThis.WebSocket = WebSocket;

// ----- Network config -----
setNetworkId(NetworkId.TestNet);

const CONFIG = {
  indexer:   "https://indexer.testnet-02.midnight.network/api/v1/graphql",
  indexerWS: "wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws",
  node:      "https://rpc.testnet-02.midnight.network",
  proof:     "http://127.0.0.1:6300",
};

// Wait until wallet is synced and has a positive balance (helper you already used)
const waitForFunds = (wallet: Wallet) =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.tap((s) => {
        if (s.syncProgress) {
          const lag = s.syncProgress.lag;
          console.log(
            `Sync: synced=${s.syncProgress.synced} sourceGap=${lag.sourceGap} applyGap=${lag.applyGap}`,
          );
        }
      }),
      Rx.filter((s) => s.syncProgress?.synced === true),
      Rx.map((s) => {
        // Native token is the default coin; some SDKs expose balances as a map keyed by asset id/hash.
        // We keep this generic: show every balance we find.
        return s.balances;
      }),
    ),
  );

// Build the walletProvider/midnightProvider used by contracts and tx balancing
async function buildWalletProviders(wallet: Wallet) {
  const state = await Rx.firstValueFrom(wallet.state());

  return {
    coinPublicKey: state.coinPublicKey,
    encryptionPublicKey: state.encryptionPublicKey,

    // Balance -> prove -> convert back to ledger -> wrap as balanced
    async balanceTx(tx: any, newCoins: any) {
      const zswap = ZswapTransaction.deserialize(
        tx.serialize(getLedgerNetworkId()),
        getZswapNetworkId(),
      );

      const balanced = await wallet.balanceTransaction(zswap, newCoins);
      const proven = await wallet.proveTransaction(balanced);

      const ledgerTx = Transaction.deserialize(
        proven.serialize(getZswapNetworkId()),
        getLedgerNetworkId(),
      );
      return createBalancedTx(ledgerTx);
    },

    submitTx(tx: any) {
      return wallet.submitTransaction(tx);
    },
  };
}

// ---------- IMPORTANT ----------
// Native transfer (send coins) – drop-in stub.
// Replace the SINGLE TODO line that creates `unsignedTx` with the official builder
// from the Midnight wallet SDK (v5) once you have the correct API name.
async function buildAndSendNativeTransfer(options: {
  wallet: Wallet;
  toAddress: string;
  amount: bigint; // smallest units
}) {
  const { wallet, toAddress, amount } = options;

  // Providers are required to balance/prove/submit
  const providers = await buildWalletProviders(wallet);

  // ── TODO (the only line you’ll need to replace) ────────────────────────────
  // 1) Construct an UNSIGNED ledger transaction that transfers the native coin
  //    `amount` to `toAddress`.
  //
  //    Ask the Midnight docs for the exact builder function name in v5.
  //    It will likely be a helper that creates a ledger Transaction,
  //    or a Zswap builder you later convert to ledger before calling balanceTx().
  //
  //    For now, we deliberately throw with a helpful message so you can’t
  //    accidentally think this is already sending funds.
  throw new Error(
    [
      "Your installed @midnight-ntwrk/wallet does not expose a simple native-transfer helper.",
      "To implement a real send you need the official transfer/build API from the Wallet SDK",
      "(or a low-level Zswap/ledger builder).",
      "Once you have it, replace this TODO to produce an UNSIGNED ledger Transaction,",
      "then the rest of the pipeline (balance -> prove -> submit) will work.",
    ].join("\n"),
  );
  // ──────────────────────────────────────────────────────────────────────────

  // Example once you have an unsigned ledger tx in a variable named `unsignedTx`:
  // const balanced = await providers.balanceTx(unsignedTx, /* newCoins */ []);
  // const submitted = await providers.submitTx(balanced);
  // return submitted;
}

// Print a compact view of balances (generic across SDK changes)
function prettyPrintBalances(all: Record<string, bigint> | undefined) {
  if (!all || Object.keys(all).length === 0) {
    console.log("No balances reported yet.");
    return;
  }
  console.log("Balances:");
  for (const [asset, amt] of Object.entries(all)) {
    console.log(`  - ${asset}: ${amt.toString()}`);
  }
}

// Try to show local transaction history if the SDK exposes it on state()
function tryPrintLocalHistory(state: any) {
  const keys = Object.keys(state || {});
  const candidate = state?.history ?? state?.transactions ?? state?.txs;

  if (!candidate) {
    console.log(
      "No local history available on wallet.state().history | transactions.",
    );
    console.log(
      "Tip: you can also query recent txs via the Indexer GraphQL using your address.",
    );
    return;
  }

  console.log("Recent transactions (best-effort):");
  for (const item of candidate.slice(-10).reverse()) {
    // Print whatever fields are available without assuming a schema
    if (typeof item === "string") {
      console.log(`  - ${item}`);
    } else if (item?.public?.txId) {
      console.log(
        `  - txId=${item.public.txId} height=${item.public.blockHeight ?? "?"}`,
      );
    } else if (item?.txId) {
      console.log(`  - txId=${item.txId}`);
    } else {
      console.log(`  - ${JSON.stringify(item)}`);
    }
  }
}

async function main() {
  console.log("\nMidnight Wallet CLI\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    // Seed input / generation (same pattern you already used)
    const hasSeed = (await rl.question("Do you have a wallet seed? (y/n): "))
      .toLowerCase()
      .startsWith("y");

    let walletSeed: string;
    if (hasSeed) {
      walletSeed = await rl.question("Enter your 64-character seed: ");
    } else {
      const bytes = new Uint8Array(32);
      // @ts-ignore
      crypto.getRandomValues(bytes);
      walletSeed = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
        "",
      );
      console.log(`\nSAVE THIS SEED: ${walletSeed}\n`);
    }

    console.log("Connecting wallet…");
    const wallet = await WalletBuilder.buildFromSeed(
      CONFIG.indexer,
      CONFIG.indexerWS,
      CONFIG.proof,
      CONFIG.node,
      walletSeed,
      getZswapNetworkId(),
      "info",
    );

    wallet.start();

    // Wait for sync
    await Rx.firstValueFrom(
      wallet.state().pipe(Rx.filter((s) => s.syncProgress?.synced === true)),
    );

    const state = await Rx.firstValueFrom(wallet.state());
    console.log(`\nAddress: ${state.address}\n`);
    prettyPrintBalances(state.balances);

    // Simple menu
    let running = true;
    while (running) {
      console.log("\n--- Menu ---");
      console.log("1. Show address & balances");
      console.log("2. Send native tokens");
      console.log("3. View recent transactions");
      console.log("4. Exit");
      const choice = await rl.question("\nChoose: ");

      switch (choice.trim()) {
        case "1": {
          const s = await Rx.firstValueFrom(wallet.state());
          console.log(`\nAddress: ${s.address}`);
          prettyPrintBalances(s.balances);
          break;
        }

        case "2": {
          const to = await rl.question("Recipient address: ");
          const amtStr = await rl.question(
            "Amount (in smallest units, bigint): ",
          );

          const amt = BigInt(amtStr);
          console.log("Submitting payment…");
          try {
            await buildAndSendNativeTransfer({ wallet, toAddress: to, amount: amt });
            console.log("✓ Submitted.");
          } catch (e: any) {
            console.error(
              "✖ Your installed @midnight-ntwrk/wallet package does not expose a simple native-transfer helper.\n" +
                "  To implement a real send, you need the official transfer/build API from the Wallet SDK\n" +
                "  (or construct a Zswap/ledger transaction manually). Replace the TODO in buildAndSendNativeTransfer().\n" +
                `  (You entered: to=${to}, amount=${amt}).\n\nDetails: ${e?.message ?? e}`,
            );
          }
          break;
        }

        case "3": {
          const s = await Rx.firstValueFrom(wallet.state());
          tryPrintLocalHistory(s);
          break;
        }

        case "4":
          running = false;
          break;

        default:
          console.log("Please choose 1, 2, 3, or 4.");
      }
    }

    await wallet.close();
    console.log("\nGoodbye!");

  } catch (err) {
    console.error("\nError:", err);
  } finally {
    // Always close the readline interface
    rl.close();
  }
}

main().catch(console.error);
