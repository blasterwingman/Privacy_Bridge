"use client";

import { SolanaProvider } from "@/components/solana-provider";
import { MidnightProvider } from "@/components/midnight-provider";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Privacy Bridge MVP - Cross-Chain Asset Transfer</title>
        <meta
          name="description"
          content="Privacy-focused cross-chain bridge with real Solana integration"
        />
      </head>
      <body>
        <SolanaProvider>
          <MidnightProvider>{children}</MidnightProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
