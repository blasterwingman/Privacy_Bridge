"use client";

import { useState } from "react";
import { useMidnight } from "@/components/midnight-provider";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, ChevronDown } from "lucide-react";

function truncate(addr: string) {
  return addr.length <= 12 ? addr : `${addr.slice(0, 6)}...${addr.slice(-6)}`;
}

export function MidnightConnectButton() {
  const { isDetected, isConnected, address, connect, disconnect } =
    useMidnight();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => {
          if (!isConnected) connect();
          else setMenuOpen(!menuOpen);
        }}
        className="min-w-[160px] justify-between"
      >
        {isConnected && address ? (
          <>
            <span className="font-mono text-sm">{truncate(address)}</span>
            <ChevronDown className="h-4 w-4" />
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4 mr-2" /> Lace Wallet{" "}
            <ChevronDown className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>
      {menuOpen && isConnected && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-2">
          <div className="text-xs text-gray-500 mb-2 break-all font-mono">
            {address}
          </div>
          <button
            onClick={() => {
              disconnect();
              setMenuOpen(false);
            }}
            className="flex items-center w-full text-left text-sm px-2 py-1 rounded hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4 mr-2" /> Disconnect
          </button>
        </div>
      )}
      {!isDetected && (
        <div className="absolute right-0 mt-2 w-56 bg-yellow-50 border border-yellow-200 rounded-md shadow p-3 text-xs text-yellow-700">
          Lace wallet not detected. Install from{" "}
          <a
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
            href="https://lace.io"
          >
            lace.io
          </a>{" "}
          then refresh.
        </div>
      )}
    </div>
  );
}
