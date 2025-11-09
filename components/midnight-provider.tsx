"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";

// Minimal Lace/Cardano CIP-30 type declarations (subset) to avoid TypeScript errors
interface Cip30WalletApi {
  getUsedAddresses: () => Promise<string[]>;
  getChangeAddress: () => Promise<string>;
  enable?: () => Promise<Cip30WalletApi>; // some wallets expose enable again
}

interface WindowWithCardano extends Window {
  cardano?: {
    lace?: {
      enable: () => Promise<Cip30WalletApi>;
      isEnabled?: () => Promise<boolean>;
      icon?: string;
      name?: string;
    };
  };
}

declare const window: WindowWithCardano;

interface MidnightContextState {
  isDetected: boolean;
  isConnected: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const MidnightContext = createContext<MidnightContextState | undefined>(
  undefined
);

export function useMidnight() {
  const ctx = useContext(MidnightContext);
  if (!ctx)
    throw new Error("useMidnight must be used within a MidnightProvider");
  return ctx;
}

export function MidnightProvider({ children }: { children: React.ReactNode }) {
  const [isDetected, setIsDetected] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [api, setApi] = useState<Cip30WalletApi | null>(null);

  useEffect(() => {
    setIsDetected(!!window.cardano?.lace);
  }, []);

  const connect = async () => {
    if (!window.cardano?.lace) return;
    try {
      const laceApi = await window.cardano.lace.enable();
      setApi(laceApi);
      let used = await laceApi.getUsedAddresses();
      if (!used || used.length === 0) {
        // fallback to change address
        used = [await laceApi.getChangeAddress()];
      }
      const first = used[0];
      setAddress(first);
      setIsConnected(true);
    } catch (e) {
      console.error("Failed to connect Midnight (Lace) wallet", e);
    }
  };

  const disconnect = () => {
    setApi(null);
    setAddress(null);
    setIsConnected(false);
  };

  const value = useMemo<MidnightContextState>(
    () => ({ isDetected, isConnected, address, connect, disconnect }),
    [isDetected, isConnected, address]
  );

  return (
    <MidnightContext.Provider value={value}>
      {children}
    </MidnightContext.Provider>
  );
}
