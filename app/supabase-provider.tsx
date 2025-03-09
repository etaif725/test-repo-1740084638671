'use client';

import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

// Define a simpler type for our database structure
type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string | null;
          email: string;
          phone: string | null;
          credits: number;
          billing_address: any | null;
          created_at: string;
          updated_at: string;
        };
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          created_at: string;
          updated_at: string;
        };
      };
      wallet_usage: {
        Row: {
          id: string;
          wallet_id: string;
          amount: number;
          description: string | null;
          transaction_type: string;
          created_at: string;
        };
      };
      voice_agents_vp: {
        Row: {
          id: string;
          user_id: string;
          agent_id: string;
          agent_name: string | null;
          voice_id: string;
          llm_websocket_url: string;
          configuration: any | null;
          created_at: string;
          updated_at: string;
        };
      };
      voice_agents_vp_calls: {
        Row: {
          id: string;
          user_id: string;
          agent_id: string | null;
          call_id: string;
          call_status: string | null;
          call_type: string | null;
          start_timestamp: number | null;
          end_timestamp: number | null;
          duration_seconds: number | null;
          call_cost: number | null;
          recording_url: string | null;
          transcript: string | null;
          call_analysis: any | null;
          metadata: any | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
};

// Create context with a default value to avoid undefined errors
const Context = createContext<SupabaseContext>({ 
  supabase: createPagesBrowserClient<Database>() 
});

export default function SupabaseProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() => createPagesBrowserClient<Database>());
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return <Context.Provider value={{ supabase }}>{children}</Context.Provider>;
}

export const useSupabase = () => {
  const context = useContext(Context);
  return context;
};
