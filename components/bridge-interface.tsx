"use client";

import { useState } from "react";
import { useSolana } from "@/components/solana-provider";
import { useMidnight } from "@/components/midnight-provider";
import { supabase } from "@/lib/supabase";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  ArrowLeftRight,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface BridgeInterfaceProps {
  onTransactionCreated?: () => void;
}

const CHAINS = [
  { id: "solana", name: "Solana", tokens: ["SOL"] },
  {
    id: "midnight",
    name: "Midnight",
    tokens: ["tDUST"],
  },
];

// Mock bridge wallet - in production, this would be a program-controlled address
const BRIDGE_WALLET = "5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9";

export default function BridgeInterface({
  onTransactionCreated,
}: BridgeInterfaceProps) {
  const { selectedAccount, isConnected, selectedWallet } = useSolana();
  const { isConnected: isMidnightConnected, address: midnightAddress } =
    useMidnight();

  const [sourceChain, setSourceChain] = useState("solana");
  const [destinationChain, setDestinationChain] = useState("midnight");
  const [amount, setAmount] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const sourceChainData = CHAINS.find((c) => c.id === sourceChain);
  const [selectedToken, setSelectedToken] = useState(
    sourceChainData?.tokens[0] || "SOL"
  );

  const handleSwapChains = () => {
    setSourceChain(destinationChain);
    setDestinationChain(sourceChain);
    const newSourceData = CHAINS.find((c) => c.id === destinationChain);
    setSelectedToken(newSourceData?.tokens[0] || "SOL");
  };

  const getDestinationToken = () => {
    // Midnight uses tDUST as the test token, not a prefixed pSOL
    if (destinationChain === "midnight") {
      return "tDUST";
    }
    if (destinationChain === "solana") {
      return "SOL";
    }
    return selectedToken;
  };

  const calculateFee = () => {
    const baseAmount = parseFloat(amount) || 0;
    return (baseAmount * 0.003).toFixed(4);
  };

  const handleBridge = async () => {
    // Determine required connection based on source chain
    if (sourceChain === "solana") {
      if (!isConnected || !selectedAccount) {
        setError("Connect a Solana wallet first");
        return;
      }
    } else if (sourceChain === "midnight") {
      if (!isMidnightConnected || !midnightAddress) {
        setError("Connect your Lace (Midnight) wallet first");
        return;
      }
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    setTxSignature(null);

    try {
      let txHash: string | null = null;

      // Only execute real transactions if bridging FROM Solana
      if (sourceChain === "solana" && selectedToken === "SOL") {
        if (!selectedWallet) {
          throw new Error("Wallet not properly connected");
        }

        // Create real Solana transaction
        const connection = new Connection(
          process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
            "https://api.devnet.solana.com",
          "confirmed"
        );

        const fromPubkey = new PublicKey(selectedAccount!.address);
        const toPubkey = new PublicKey(BRIDGE_WALLET);

        const amountLamports = Math.floor(
          parseFloat(amount) * LAMPORTS_PER_SOL
        );

        // Get recent blockhash
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();

        // Create transaction
        const transaction = new Transaction({
          feePayer: fromPubkey,
          blockhash,
          lastValidBlockHeight,
        }).add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: amountLamports,
          })
        );

        // Sign and send transaction using the wallet
        // Narrow the feature to `any` (or a proper type) so TypeScript knows it has signAndSendTransaction
        const solanaFeature = (selectedWallet.features as any)[
          "solana:signAndSendTransaction"
        ];

        if (
          !solanaFeature ||
          typeof solanaFeature.signAndSendTransaction !== "function"
        ) {
          throw new Error("Wallet does not support transaction signing");
        }

        const response = await solanaFeature.signAndSendTransaction({
          account: selectedAccount,
          chain: "solana:devnet",
          transaction: transaction.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
          }),
          options: {
            preflightCommitment: "confirmed",
          },
        });

        // The wallet response shape may vary (array or object), normalize to extract a signature
        let signature: string | undefined;
        if (Array.isArray(response)) {
          signature = response[0]?.signature ?? response[0];
        } else if (response && typeof response === "object") {
          signature =
            (response as any).signature ?? (response as any)[0]?.signature;
        } else if (typeof response === "string") {
          signature = response;
        }

        if (!signature) {
          throw new Error(
            "Failed to retrieve transaction signature from wallet response"
          );
        }

        txHash = signature.toString();
        setTxSignature(txHash);
      } else if (sourceChain === "midnight") {
        // Simulated Midnight transaction placeholder
        txHash = `midnight-sim-${Date.now()}`;
        setTxSignature(txHash);
      }

      // Record transaction in Supabase
      const estimatedCompletion = new Date();
      estimatedCompletion.setMinutes(estimatedCompletion.getMinutes() + 5);

      const { error: insertError } = await supabase
        .from("bridge_transactions")
        .insert({
          user_address:
            sourceChain === "solana"
              ? selectedAccount!.address
              : midnightAddress,
          source_chain: sourceChain,
          destination_chain: destinationChain,
          source_token: selectedToken,
          destination_token: getDestinationToken(),
          amount: parseFloat(amount),
          status: txHash ? "processing" : "pending",
          is_private: isPrivate,
          fee_amount: parseFloat(calculateFee()),
          estimated_completion: estimatedCompletion.toISOString(),
          source_tx_hash: txHash,
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setAmount("");
      onTransactionCreated?.();

      setTimeout(() => {
        setSuccess(false);
        setTxSignature(null);
      }, 5000);
    } catch (err) {
      console.error("Bridge error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create bridge transaction"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-xl">
          <ArrowLeftRight className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Bridge Assets</h2>
      </div>

      <div className="space-y-4">
        {/* From Section */}
        <div className="bg-gray-50 rounded-xl p-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            From
          </label>
          <select
            value={sourceChain}
            onChange={(e) => {
              setSourceChain(e.target.value);
              const newChainData = CHAINS.find((c) => c.id === e.target.value);
              setSelectedToken(newChainData?.tokens[0] || "SOL");
            }}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CHAINS.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
          </select>

          <div className="flex gap-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.001"
              min="0"
              className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sourceChainData?.tokens.map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSwapChains}
            className="bg-white border-2 border-gray-200 rounded-full p-3 hover:border-blue-500 hover:bg-blue-50 transition-all transform hover:scale-110"
          >
            <ArrowLeftRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* To Section */}
        <div className="bg-gray-50 rounded-xl p-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            To
          </label>
          <select
            value={destinationChain}
            onChange={(e) => setDestinationChain(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CHAINS.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
          </select>

          <div className="bg-white border border-gray-300 rounded-lg px-4 py-3">
            <div className="flex justify-between items-center">
              <span className="text-xl text-gray-900">
                {amount ? parseFloat(amount).toFixed(4) : "0.00"}
              </span>
              <span className="text-gray-600 font-medium">
                {getDestinationToken()}
              </span>
            </div>
          </div>
        </div>

        {/* Privacy Toggle */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="mr-3 w-4 h-4"
                />
                <span className="font-medium text-gray-900">
                  Enable Privacy Mode
                </span>
              </label>
              <p className="text-sm text-gray-600 mt-1">
                {isPrivate
                  ? "Transactions will be shielded (simulated for MVP)"
                  : "Standard public transaction"}
              </p>
            </div>
          </div>
        </div>

        {/* Fee Information */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Bridge Fee (0.3%)</span>
            <span>
              {calculateFee()} {selectedToken}
            </span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Estimated Time
            </span>
            <span>~5 minutes</span>
          </div>
          {sourceChain === "solana" && selectedToken === "SOL" && (
            <div className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Real Solana transaction will be executed
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-green-700 text-sm font-medium mb-1">
              Bridge transaction initiated successfully!
            </div>
            {txSignature && (
              <a
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                View on Solana Explorer →
              </a>
            )}
          </div>
        )}

        {/* Bridge Button */}
        <button
          onClick={handleBridge}
          disabled={isSubmitting || !isConnected}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {isSubmitting
            ? "Processing..."
            : isConnected
            ? "Bridge Assets"
            : "Connect Wallet First"}
        </button>
      </div>
    </div>
  );
}
