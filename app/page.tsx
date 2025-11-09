"use client";

import { useState } from "react";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { MidnightConnectButton } from "@/components/midnight-connect-button";
import BridgeInterface from "@/components/bridge-interface";
import TransactionHistory from "@/components/transaction-history";
import { Shield, Zap, Globe, Lock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Privacy Protected",
    description:
      "Optional anonymous transactions with zero-knowledge proofs (simulated)",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Zap,
    title: "Real Solana Transactions",
    description: "Actual on-chain transactions when bridging from Solana",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Globe,
    title: "Cross-Chain Ready",
    description: "Bridge between Solana and Midnight networks seamlessly",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Lock,
    title: "Secure Bridge",
    description: "Track all transactions with Supabase database",
    color: "bg-orange-100 text-orange-600",
  },
];

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTransactionCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Privacy Bridge MVP
                </h1>
                <p className="text-xs text-gray-600">
                  Cross-Chain Asset Transfer
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WalletConnectButton />
              <MidnightConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Bridge Assets with Real Solana Integration
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transfer SOL from Solana to Midnight network with actual on-chain
            transactions. Connect your Phantom, Solflare, or Backpack wallet to
            get started.
          </p>
        </div>

        {/* Bridge Interface */}
        <div className="flex flex-col items-center gap-8 mb-12">
          <BridgeInterface onTransactionCreated={handleTransactionCreated} />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100 hover:border-blue-200"
              >
                <div
                  className={`${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Transaction History */}
        <div className="flex flex-col items-center">
          <TransactionHistory refreshTrigger={refreshTrigger} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Privacy Bridge MVP - Real Solana transactions with cross-chain
              capabilities
            </p>
            <p className="text-xs mt-2 text-gray-500">
              Built with Next.js, Solana Web3.js, and Supabase | HackTrent 2025
            </p>
            <p className="text-xs mt-1 text-orange-600 font-medium"></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
