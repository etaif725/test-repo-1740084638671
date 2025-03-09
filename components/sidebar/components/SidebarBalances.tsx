'use client';

import { useEffect, useState, useContext } from 'react';
import { WalletContext } from '@/contexts/layout';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AuthContext } from '@/hooks/use-auth';

export default function SidebarBalances() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const walletContext = useContext(WalletContext);
  const [credits, setCredits] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [voiceAgentCount, setVoiceAgentCount] = useState(0);
  const [maxVoiceAgents, setMaxVoiceAgents] = useState(5);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        // Fetch user credits
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;
        if (userData) {
          setCredits(userData.credits || 0);
        }

        // Fetch wallet balance
        const { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        if (!walletError && walletData) {
          setWalletBalance(walletData.balance || 0);
        }

        // Fetch voice agent count
        const { count, error: agentError } = await supabase
          .from('voice_agents_vp')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (!agentError) {
          setVoiceAgentCount(count || 0);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user, supabase]);

  // Use wallet balance from context if available
  useEffect(() => {
    if (walletContext && walletContext.balance !== undefined) {
      setWalletBalance(walletContext.balance);
    }
  }, [walletContext]);

  return (
    <div className="w-full h-full flex flex-col items-start justify-start rounded-lg border border-zinc-200 px-3 py-4 dark:border-white/10">
      <div className="flex w-full flex-col">
        <p className="mb-2.5 text-lg font-bold text-zinc-950 dark:text-white">
          Your Balance:
        </p>
        <p className="py-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 focus:dark:!bg-white/20 active:dark:!bg-white/20">
          Credits: {credits}
        </p>
        <p className="py-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 focus:dark:!bg-white/20 active:dark:!bg-white/20">
          Wallet Balance: ${(walletBalance / 100).toFixed(2)}
        </p>
        <p className="py-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 focus:dark:!bg-white/20 active:dark:!bg-white/20">
          Voice Agents: {voiceAgentCount} / {maxVoiceAgents}
        </p>
      </div>
    </div>
  );
}
