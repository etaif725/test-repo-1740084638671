// src/contexts/DashboardContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/hooks/use-auth';

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  const [wallet, setWallet] = useState({ balance: 0, usage: [] });
  const [voiceAgents, setVoiceAgents] = useState([]);
  const [voiceCalls, setVoiceCalls] = useState([]);
  const [aiModel, setAiModel] = useState('gpt-4o');
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);

  const loadDashboardData = async () => {
    if (user) {
      try {
        setLoading(true);
        
        // Load user credits
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single();
          
        if (userError) throw userError;
        setCredits(userData?.credits || 0);
        
        // Load wallet data
        const { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();
          
        if (!walletError && walletData) {
          // Load wallet usage
          const { data: usageData, error: usageError } = await supabase
            .from('wallet_usage')
            .select('*')
            .eq('wallet_id', walletData.id)
            .order('created_at', { ascending: false })
            .limit(10);
            
          setWallet({ 
            balance: walletData.balance || 0, 
            usage: usageError ? [] : (usageData || [])
          });
        }
        
        // Load Voice agents
        const { data: agentsData, error: agentsError } = await supabase
          .from('voice_agents_vp')
          .select('*')
          .eq('user_id', user.id);
          
        if (!agentsError) {
          setVoiceAgents(agentsData || []);
        }
        
        // Load recent Voice calls
        const { data: callsData, error: callsError } = await supabase
          .from('voice_agents_vp_calls')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (!callsError) {
          setVoiceCalls(callsData || []);
        }
        
      } catch (error) {
        console.error('Error loading dashboard data:', error.message || JSON.stringify(error));
      } finally {
        setLoading(false);
      }
    } else {
      // Reset state when logged out
      setCredits(0);
      setWallet({ balance: 0, usage: [] });
      setVoiceAgents([]);
      setVoiceCalls([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const refreshWallet = async () => {
    if (!user) return;
    
    try {
      // Refresh user credits
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();
        
      if (!userError) {
        setCredits(userData?.credits || 0);
      }
      
      // Refresh wallet balance
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('balance, id')
        .eq('user_id', user.id)
        .single();
        
      if (!walletError && walletData) {
        const { data: usageData, error: usageError } = await supabase
          .from('wallet_usage')
          .select('*')
          .eq('wallet_id', walletData.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        setWallet({ 
          balance: walletData.balance || 0, 
          usage: usageError ? [] : (usageData || [])
        });
      }
    } catch (error) {
      console.error('Error refreshing wallet:', error.message || JSON.stringify(error));
    }
  };

  const value = {
    user,
    wallet,
    loading,
    voiceAgents,
    voiceCalls,
    aiModel,
    credits,
    setAiModel,
    refreshWallet,
    refreshDashboard: async () => {
      setLoading(true);
      await loadDashboardData();
    }
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);