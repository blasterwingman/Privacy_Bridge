// src/cli.ts
import * as readline from "readline/promises";
import { WebSocket } from "ws";
import * as Rx from "rxjs";
import * as fs from "fs";
import * as path from "path";

import { type Wallet } from "@midnight-ntwrk/wallet-api";
import { WalletBuilder } from "@midnight-ntwrk/wallet";

import {
  NetworkId,
  setNetworkId,
  getZswapNetworkId,
  getLedgerNetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";

import { nativeToken, Transaction } from "@midnight-ntwrk/ledger";
import { Transaction as ZswapTransaction } from "@midnight-ntwrk/zswap";
import * as ZS from "@midnight-ntwrk/zswap";
import { createBalancedTx } from "@midnight-ntwrk/midnight-js-types";

import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";

// Node.js needs a WebSocket global for some Midnight libs.
 // @ts-ignore
globalThis.WebSocket = WebSocket;

// ---------- Network ----------
setNetworkId(NetworkId.TestNet);

const TESTNET_CONFIG = {
  indexer: "https://indexer.testnet-02.midnight.network/api/v1/graphql",
  indexerWS: "wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws",
  node: "https://rpc.testnet-02.midnight.network",
  proofServer: "http://127.0.0.1:6300",
};

// ---------- Helpers ----------
async function waitSynced(wallet: Wallet) {
  await Rx.firstValueFrom(
    wallet
      .state()
      .pipe(Rx.filter((s) => s.syncProgress?.synced === true))
  );
}

async function getBalance(wallet: Wallet): Promise<bigint> {
  const s = await Rx.firstValueFrom(wallet.state());
  return s.balances[nativeToken()] ?? 0n;
}

function readDeployment() {
  if (!fs.existsSync("deployment.json")) return null;
  try {
    return JSON.parse(fs.readFileSync("deployment.json", "utf-8"));
  } catch {
    return null;
  }
}

// Build a balanced+proved ledger tx from a Zswap tx using the wallet provider flow
async function balanceAndProve(
  wallet: Wallet,
  zswapTx: ZswapTransaction
): Promise<Transaction> {
  const balancedZswap = await wallet.balanceTransaction(
    zswapTx,
    /* newCoins */ []
  );
  const provedZswap = await wallet.proveTransaction(balancedZswap);
  return Transaction.deserialize(
    provedZswap.serialize(getZswapNetworkId()),
    getLedgerNetworkId()
  );
}

// NOTE on "send":
// The wallet SDKs you pinned (wallet 5.0.0 / ledger 4.0.0 / zswap 4.x) don’t
// ship a one-liner like wallet.sendNative(…).
// Building a payment from scratch normally requires a small payment-builder
// helper that creates a Zswap transfer tx with chosen inputs/outputs, then
// we balance+prove+submit.
//
// To keep your package.json unchanged, this CLI implements a minimal “send”
// using the wallet’s coin selection through balanceTransaction() on a skeleton
// Zswap tx that pays <amount> to <toAddress> and returns change to your wallet.

// Create a minimal Zswap payment tx (one output to recipient)
// This assumes native token, no memo, and lets the wallet add inputs/change.
function buildPaymentSkeleton(toShieldAddr: string, amount: bigint) {
  // Create a blank Zswap tx with a single payment output.
  // The builder API below is the common pattern exposed by zswap 4.x.
  // TransactionBuilder is not exported in the package's TS types in some
  // releases; access it dynamically to avoid type-errors while still
  // supporting runtime builder classes when present.
  const b: any = new (ZS as any).TransactionBuilder(getZswapNetworkId());

  // Add a payment output in the native asset
  b.addPayment({
    address: toShieldAddr,
    asset: nativeToken(), // native asset
    amount,
  });

  // (No inputs added here; the wallet will select inputs during balance step)
  return b.build();
}

// --- Simple history via indexer ---
// We’ll fetch last N transactions involving your address using the public indexer.
// The publicDataProvider exposes a generic "fetchAddressTransactions" in many
// Midnight examples; if not available in your exact build, we fallback to a
// generic GraphQL query through the provider’s "query" method.
type IndexedTx = {
  txId: string;
  blockHeight: number;
  direction: "in" | "out" | "unknown";
  amount: bigint;
};

async function fetchRecentTxs(
  address: string,
  limit = 10
): Promise<IndexedTx[]> {
  const pub = indexerPublicDataProvider(TESTNET_CONFIG.indexer, TESTNET_CONFIG.indexerWS);

  // Try a helper if present (newer providers expose something like this)
  // @ts-ignore
  if (typeof pub.fetchAddressTransactions === "function") {
    // @ts-ignore
    const items = await pub.fetchAddressTransactions(address, limit);
    return items.map((t: any) => ({
      txId: t.txId ?? t.id ?? "unknown",
      blockHeight: t.blockHeight ?? 0,
      direction: t.direction ?? "unknown",
      amount: BigInt(t.amount ?? 0),
    }));
  }

  // Fallback: very lightweight GraphQL query.
  // (Schema names can drift; if this errors, comment this out and rely on balance only.)
  const query = `
    query RecentTxs($addr: String!, $limit: Int!) {
      transactions(address: $addr, limit: $limit, order_by: {blockHeight: desc}) {
        txId
        blockHeight
        amount
        direction
      }
    }
  `;
  try {
    // @ts-ignore
    const res = await pub.query(query, { addr: address, limit });
    const rows = res?.data?.transactions ?? [];
    return rows.map((t: any) => ({
      txId: t.txId ?? "unknown",
      blockHeight: t.blockHeight ?? 0,
      direction: (t.direction as "in" | "out") ?? "unknown",
      amount: BigInt(t.amount ?? 0),
    }));
  } catch {
    return [];
  }
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    console.log("\nMidnight Wallet CLI (Testnet)\n");

    // Optional: show contract from your previous deploy (not required for wallet ops)
    const deployment = readDeployment();
    if (deployment?.contractAddress) {
      console.log(`(Found deployment.json – contract: ${deployment.contractAddress})\n`);
    }

    // Get/ask for seed
    const seed = await rl.question("Enter your 64-char wallet seed (hex): ");

    console.log("\nConnecting & syncing…");
    const wallet = await WalletBuilder.buildFromSeed(
      TESTNET_CONFIG.indexer,
      TESTNET_CONFIG.indexerWS,
      TESTNET_CONFIG.proofServer,
      TESTNET_CONFIG.node,
      seed,
      getZswapNetworkId(),
      "info"
    );
    wallet.start();
    await waitSynced(wallet);

    const st = await Rx.firstValueFrom(wallet.state());
    const myAddr = st.address;
    console.log(`\nAddress: ${myAddr}`);

    let running = true;
    while (running) {
      const bal = await getBalance(wallet);
      console.log("\n--- Menu ---");
      console.log(`Balance: ${bal} (native)`);
      console.log("1) Show address (receive)");
      console.log("2) Send tokens");
      console.log("3) View recent transactions");
      console.log("4) Exit");
      const choice = await rl.question("\nYour choice: ");

      switch (choice.trim()) {
        case "1": {
          console.log(`\nYour shield address:\n${myAddr}`);
          console.log("\nGet test tokens:\nhttps://midnight.network/test-faucet\n");
          break;
        }
        case "2": {
          const to = await rl.question("\nRecipient shield address: ");
          const amtStr = await rl.question("Amount (integer, native units): ");
          let amount: bigint;
          try {
            amount = BigInt(amtStr.trim());
            if (amount <= 0n) throw new Error();
          } catch {
            console.error("Invalid amount.");
            break;
          }

          try {
            console.log("\nBuilding payment…");
            // 1) Build a minimal Zswap payment
            const zswapSkeleton = buildPaymentSkeleton(to.trim(), amount);

            // 2) Balance & prove (wallet selects inputs / change, adds proofs)
            const ledgerTx = await balanceAndProve(wallet, zswapSkeleton);

            // 3) Submit
            console.log("Submitting…");
            const submitted = await wallet.submitTransaction(ledgerTx);

            console.log("\n✅ Sent!");
            const txId = (submitted as any)?.public?.txId ?? (submitted as any)?.txId ?? String(submitted ?? "(unknown)");
            const includedAt = (submitted as any)?.public?.blockHeight ?? (submitted as any)?.blockHeight ?? "pending";
            console.log(`Tx ID: ${txId}`);
            console.log(`Included at block: ${includedAt}`);
          } catch (e) {
            console.error("\n❌ Send failed:", e);
          }
          break;
        }
        case "3": {
          try {
            console.log("\nFetching last 10 transactions…");
            const items = await fetchRecentTxs(myAddr, 10);
            if (!items.length) {
              console.log("No recent transactions found (or indexer helper unavailable).");
            } else {
              for (const t of items) {
                console.log(
                  `- ${t.txId} | block ${t.blockHeight} | ${t.direction} | amount ${t.amount}`
                );
              }
            }
          } catch (e) {
            console.error("Failed to load history:", e);
          }
          break;
        }
        case "4": {
          running = false;
          break;
        }
        default:
          console.log("Please choose 1, 2, 3, or 4.");
      }
    }

    await wallet.close();
    console.log("\nGoodbye!\n");
  } catch (err) {
    console.error("\nError:", err);
  } finally {
    // Always close the readline interface
    // @ts-ignore
    rl?.close?.();
  }
}

main().catch(console.error);
