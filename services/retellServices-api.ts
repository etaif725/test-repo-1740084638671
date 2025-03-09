import { differenceInSeconds } from 'date-fns';
import { ListCallsResponse, CallTranscriptResponse, Call, Agent } from '../types/retell';
import { RateLimiter } from '../utils/rateLimiter'
import Retell from 'retell-sdk'

const RETELL_API_URL = 'https://api.retellai.com';
const RETELL_API_KEY = process.env.NEXT_PUBLIC_RETELL_API_KEY;
const rateLimiter = new RateLimiter();

export const retellServices = {
  async listCalls(date: string = 'all', agentId: string = 'all'): Promise<ListCallsResponse> {
    await rateLimiter.throttle();
    
    const now = Date.now();
    let startTimestamp: number | undefined;

    // Calculate start timestamp based on date range
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
    }

    // Build request body
    const requestBody: any = {
      sort_order: "descending",
      limit: 1000
    };

    // Add filter criteria if needed
    if (date !== 'all' || agentId !== 'all') {
      requestBody.filter_criteria = {};
      
      if (date !== 'all') {
        requestBody.filter_criteria.start_timestamp_gt = startTimestamp;
      }

      if (agentId !== 'all') {
        requestBody.filter_criteria.agent_id = [agentId];
      }
    }

    const response = await fetch(`${RETELL_API_URL}/v2/list-calls`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch calls: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  },

  async getCall(callId: string): Promise<Call> {
    await rateLimiter.throttle();
    const response = await fetch(`${RETELL_API_URL}/v2/get-call/${callId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch call: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  },

  async getCallTranscript(callId: string): Promise<CallTranscriptResponse> {
    await rateLimiter.throttle();
    const call = await this.getCall(callId);

    return {
      transcript: call.transcript || '',
      crm_note: call.call_analysis?.custom_analysis_data?.summary || '',
      sentiment: call.call_analysis?.user_sentiment || '',
      call_successful: call.call_analysis?.call_successful || false,
      call_summary: call.call_analysis?.custom_analysis_data?.summary || '',
      success_evaluation: call.call_analysis?.call_successful ? 'success' : 'failure',
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
    const response = await fetch(`${RETELL_API_URL}/list-agents`, {
      method: 'GET', 
      headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  },

  async createAgent(agentData: Partial<Agent>): Promise<Agent> {
    await rateLimiter.throttle();
    const response = await fetch(`${RETELL_API_URL}/create-agent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
      },
      body: JSON.stringify(agentData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create agent: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  },

  async updateAgent(agentId: string, agentData: Partial<Agent>): Promise<Agent> {
    await rateLimiter.throttle();
    const response = await fetch(`${RETELL_API_URL}/update-agent/${agentId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
      },
      body: JSON.stringify(agentData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update agent: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  },

  async getAgentById(agentId: string): Promise<Agent> {
    await rateLimiter.throttle();
    const response = await fetch(`${RETELL_API_URL}/get-agent/${agentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch agent: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }
}

export default retellServices;