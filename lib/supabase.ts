import { createClient } from "@supabase/supabase-js";

// Use dummy values if not configured to prevent app from crashing
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder";

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  console.warn(
    "⚠️ Supabase credentials not configured. Transaction history will not work."
  );
  console.warn(
    "Create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface BridgeTransaction {
  id: string;
  user_address: string;
  source_chain: string;
  destination_chain: string;
  source_token: string;
  destination_token: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  is_private: boolean;
  source_tx_hash?: string;
  destination_tx_hash?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  fee_amount: number;
  estimated_completion?: string;
}
