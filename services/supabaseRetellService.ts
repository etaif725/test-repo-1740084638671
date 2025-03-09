import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Agent, Call } from '@/types/retell';

export const supabaseRetellService = {
  async saveRetellAgent(agent: Agent, userId: string) {
    const supabase = createClientComponentClient<Database>();
    
    const { data, error } = await supabase
      .from('retell_agents')
      .upsert({
        user_id: userId,
        agent_id: agent.agent_id,
        agent_name: agent.agent_name,
        voice_id: agent.voice_id,
        llm_websocket_url: agent.llm_websocket_url,
        configuration: agent.configuration
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async getRetellAgents(userId: string) {
    const supabase = createClientComponentClient<Database>();
    
    const { data, error } = await supabase
      .from('retell_agents')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    return data;
  },
  
  async getRetellAgentById(agentId: string) {
    const supabase = createClientComponentClient<Database>();
    
    const { data, error } = await supabase
      .from('retell_agents')
      .select('*')
      .eq('agent_id', agentId)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async saveRetellCall(call: Call, userId: string) {
    const supabase = createClientComponentClient<Database>();
    
    const { data, error } = await supabase
      .from('retell_calls')
      .upsert({
        user_id: userId,
        agent_id: call.agent_id,
        call_id: call.call_id,
        call_status: call.call_status,
        call_type: call.call_type,
        start_timestamp: call.start_timestamp,
        end_timestamp: call.end_timestamp,
        duration_seconds: call.end_timestamp && call.start_timestamp 
          ? Math.floor((call.end_timestamp - call.start_timestamp) / 1000) 
          : null,
        call_cost: call.call_cost,
        recording_url: call.recording_url,
        transcript: call.transcript,
        call_analysis: call.call_analysis,
        metadata: call.metadata
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async getRetellCalls(userId: string, limit = 100) {
    const supabase = createClientComponentClient<Database>();
    
    const { data, error } = await supabase
      .from('retell_calls')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data;
  },
  
  async getRetellCallById(callId: string) {
    const supabase = createClientComponentClient<Database>();
    
    const { data, error } = await supabase
      .from('retell_calls')
      .select('*')
      .eq('call_id', callId)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async getRetellCallsByAgentId(agentId: string, userId: string) {
    const supabase = createClientComponentClient<Database>();
    
    const { data, error } = await supabase
      .from('retell_calls')
      .select('*')
      .eq('agent_id', agentId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  }
};

export default supabaseRetellService; 