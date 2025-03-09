// services/dashboardService.ts
import { supabaseService } from '@/utils/supabase/service';
import { v4 as uuidv4 } from 'uuid';

export const dashboardService = {
  // Authentication is handled by Supabase Auth
  // This function would be called after authentication to set up a user's profile
  async initializeUserProfile(userId: string) {
    // Check if user already has a wallet
    const { data: existingWallet } = await supabaseService
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (!existingWallet) {
      // Create wallet record if it doesn't exist
      await supabaseService.from('wallets').insert({
        user_id: userId,
        balance: 0
      });
    }
    
    // Return user profile data
    return this.getUserProfile(userId);
  },
  
  async getUserProfile(userId: string) {
    // Get authenticated user data
    const { data: userData } = await supabaseService
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    return {
      user: userData
    };
  },
  
  async getWalletBalance(userId: string) {
    const { data: wallet } = await supabaseService
      .from('wallets')
      .select('id, balance')
      .eq('user_id', userId)
      .single();
      
    const { data: usage } = await supabaseService
      .from('wallet_usage')
      .select('*')
      .eq('wallet_id', wallet?.id || '')
      .order('created_at', { ascending: false });
      
    return {
      balance: wallet?.balance || 0,
      usage: usage || []
    };
  },
  
  async getVoiceAgents(userId: string) {
    const { data: voiceAgents } = await supabaseService
      .from('voice_agents_vp')
      .select('*')
      .eq('user_id', userId);
      
    return voiceAgents || [];
  },
  
  async getVoiceAgentCalls(userId: string, agentId?: string) {
    let query = supabaseService
      .from('voice_agents_vp_calls')
      .select('*')
      .eq('user_id', userId);
      
    if (agentId) {
      query = query.eq('agent_id', agentId);
    }
    
    const { data: calls } = await query.order('created_at', { ascending: false });
    
    return calls || [];
  },
  
  async getUserCredits(userId: string) {
    const { data: user } = await supabaseService
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();
      
    return {
      credits: user?.credits || 0
    };
  }
};

export default dashboardService;