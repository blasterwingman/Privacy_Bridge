"use client";

import { useEffect, useState } from "react";
import { useSolana } from "@/components/solana-provider";
import { supabase, type BridgeTransaction } from "@/lib/supabase";
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  ExternalLink,
} from "lucide-react";

interface TransactionHistoryProps {
  refreshTrigger?: number;
}

export default function TransactionHistory({
  refreshTrigger,
}: TransactionHistoryProps) {
  const { selectedAccount, isConnected } = useSolana();
  const [transactions, setTransactions] = useState<BridgeTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && selectedAccount) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [isConnected, selectedAccount, refreshTrigger]);

  const fetchTransactions = async () => {
    if (!selectedAccount) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bridge_transactions")
        .select("*")
        .eq("user_address", selectedAccount.address)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "processing":
        return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Transaction History
        </h3>
        <p className="text-gray-600 text-center py-8">
          Connect your wallet to view transaction history
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          Transaction History
        </h3>
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading && transactions.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <p className="text-gray-600 text-center py-8">
          No bridge transactions yet. Start bridging to see your history!
        </p>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(tx.status)}
                    <div>
                      <div className="font-semibold text-gray-900">
                        {tx.amount} {tx.source_token} → {tx.destination_token}
                      </div>
                      <div className="text-sm text-gray-600">
                        {tx.source_chain} → {tx.destination_chain}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                    <span>
                      {new Date(tx.created_at).toLocaleDateString()} at{" "}
                      {new Date(tx.created_at).toLocaleTimeString()}
                    </span>
                    {tx.is_private && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        🔒 Private
                      </span>
                    )}
                    {tx.source_tx_hash && (
                      <a
                        href={`https://explorer.solana.com/tx/${tx.source_tx_hash}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        View TX <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    tx.status
                  )}`}
                >
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
