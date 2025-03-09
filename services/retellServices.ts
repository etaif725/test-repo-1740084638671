import { differenceInSeconds } from 'date-fns';
import { ListCallsResponse, CallTranscriptResponse, Call, Agent } from '../types/retell';
import { RateLimiter } from '../utils/rateLimiter';
import { createClient } from '@supabase/supabase-js';

const RETELL_API_URL = 'https://api.retellai.com';
const RETELL_API_KEY = process.env.NEXT_PUBLIC_RETELL_API_KEY;
const rateLimiter = new RateLimiter();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const retellServices = {
  async listCalls(date: string = 'all', agentId: string = 'all'): Promise<ListCallsResponse> {
    await rateLimiter.throttle();
    
    let query = supabase
      .from('retell_calls')
      .select('*');
    
    // Add date filter if provided
    if (date !== 'all') {
      const now = Date.now();
      let startTimestamp: number;
      
      switch(date) {
        case '24h':
          startTimestamp = now - (24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTimestamp = now - (7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startTimestamp = now - (30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startTimestamp = now - (90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTimestamp = 0;
      }
      
      const startDate = new Date(startTimestamp);
      query = query.gte('created_at', startDate.toISOString());
    }
    
    // Add agent filter if provided
    if (agentId !== 'all') {
      query = query.eq('agent_id', agentId);
    }
    
    // Order by created_at descending
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to fetch calls: ${error.message}`);
    }
    
    return data || [];
  },

  async getCall(callId: string): Promise<Call> {
    await rateLimiter.throttle();
    
    const { data, error } = await supabase
      .from('retell_calls')
      .select('*')
      .eq('call_id', callId)
      .single();
    
    if (error) {
      throw new Error(`Failed to fetch call: ${error.message}`);
    }
    
    return data;
  },

  async getCallTranscript(callId: string): Promise<CallTranscriptResponse> {
    await rateLimiter.throttle();
    
    const { data, error } = await supabase
      .from('retell_calls')
      .select('*')
      .eq('call_id', callId)
      .single();
    
    if (error) {
      throw new Error(`Failed to fetch call transcript: ${error.message}`);
    }
    
    const call = data;
    const callAnalysis = call.call_analysis || {};
    
    return {
      transcript: call.transcript || '',
      crm_note: callAnalysis.custom_analysis_data?.summary || '',
      sentiment: callAnalysis.user_sentiment || '',
      call_successful: callAnalysis.call_successful || false,
      call_summary: callAnalysis.custom_analysis_data?.summary || '',
      success_evaluation: callAnalysis.call_successful ? 'success' : 'failure',
      call_duration: call.end_timestamp ? 
        differenceInSeconds(new Date(call.end_timestamp), new Date(call.start_timestamp)) : 0,
      call_type: call.call_type || '',
      call_id: call.call_id || '',
      call_status: call.call_status || '',
      call_start_time: call.start_timestamp || 0,
      call_end_time: call.end_timestamp || 0,
    };
  },

  async getAgents(): Promise<Agent[]> {
    await rateLimiter.throttle();
    
    const { data, error } = await supabase
      .from('retell_agents')
      .select('*');
    
    if (error) {
      throw new Error(`Failed to fetch agents: ${error.message}`);
    }
    
    return data || [];
  },

  async createAgent(agentData: Partial<Agent>): Promise<Agent> {
    await rateLimiter.throttle();
    
    // First create the agent in Retell API
    const response = await fetch(`${RETELL_API_URL}/create-agent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(agentData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create agent in Retell: ${response.status} ${response.statusText}`);
    }

    const retellAgent = await response.json();
    
    // Then store the agent in our database
    const { data, error } = await supabase
      .from('retell_agents')
      .insert({
        user_id: agentData['user_id'],
        agent_id: retellAgent.agent_id,
        agent_name: retellAgent.agent_name || 'New Agent',
        voice_id: retellAgent.voice_id,
        llm_websocket_url: retellAgent.llm_websocket_url || '',
        configuration: retellAgent.configuration || {}
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to store agent in database: ${error.message}`);
    }
    
    return data;
  },

  async updateAgent(agentId: string, agentData: Partial<Agent>): Promise<Agent> {
    await rateLimiter.throttle();
    
    // First update the agent in Retell API
    const response = await fetch(`${RETELL_API_URL}/update-agent/${agentId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(agentData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update agent in Retell: ${response.status} ${response.statusText}`);
    }

    const retellAgent = await response.json();
    
    // Then update the agent in our database
    const { data, error } = await supabase
      .from('retell_agents')
      .update({
        agent_name: retellAgent.agent_name,
        voice_id: retellAgent.voice_id,
        llm_websocket_url: retellAgent.llm_websocket_url,
        configuration: retellAgent.configuration
      })
      .eq('agent_id', agentId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update agent in database: ${error.message}`);
    }
    
    return data;
  },

  async getAgentById(agentId: string): Promise<Agent> {
    await rateLimiter.throttle();
    
    const { data, error } = await supabase
      .from('retell_agents')
      .select('*')
      .eq('agent_id', agentId)
      .single();
    
    if (error) {
      throw new Error(`Failed to fetch agent: ${error.message}`);
    }
    
    return data;
  }
}

export default retellServices;