import retellServices from '@/services/retellServices';
import { supabaseRetellService } from '@/services/supabaseRetellService';
import { Agent, Call } from '@/types/retell';

export const combinedRetellService = {
  /**
   * Fetches agents from Retell API and syncs them to the database
   */
  async syncAgents(userId: string) {
    try {
      // Get agents from Retell API
      const agents = await retellServices.getAgents();
      
      // Save each agent to the database
      const savedAgents = await Promise.all(
        agents.map(agent => supabaseRetellService.saveRetellAgent(agent, userId))
      );
      
      return savedAgents;
    } catch (error) {
      console.error('Error syncing agents:', error);
      throw error;
    }
  },
  
  /**
   * Creates a new agent in Retell and saves it to the database
   */
  async createAgent(agentData: Partial<Agent>, userId: string) {
    try {
      // Create agent in Retell
      const agent = await retellServices.createAgent(agentData);
      
      // Save to database
      await supabaseRetellService.saveRetellAgent(agent, userId);
      
      return agent;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  },
  
  /**
   * Updates an agent in Retell and syncs changes to the database
   */
  async updateAgent(agentId: string, agentData: Partial<Agent>, userId: string) {
    try {
      // Update agent in Retell
      const updatedAgent = await retellServices.updateAgent(agentId, agentData);
      
      // Save changes to database
      await supabaseRetellService.saveRetellAgent(updatedAgent, userId);
      
      return updatedAgent;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  },
  
  /**
   * Fetches calls from Retell API and syncs them to the database
   */
  async syncCalls(userId: string, date: string = 'all', agentId: string = 'all') {
    try {
      // Get calls from Retell API
      const callsResponse = await retellServices.listCalls(date, agentId);
      
      // Save each call to the database
      const savedCalls = await Promise.all(
        callsResponse.map((call: Call) => supabaseRetellService.saveRetellCall(call, userId))
      );
      
      return savedCalls;
    } catch (error) {
      console.error('Error syncing calls:', error);
      throw error;
    }
  },
  
  /**
   * Gets call details and transcript, then saves to database
   */
  async getCallWithTranscript(callId: string, userId: string) {
    try {
      // Get call details from Retell
      const call = await retellServices.getCall(callId);
      
      // Get transcript details
      const transcript = await retellServices.getCallTranscript(callId);
      
      // Merge transcript data with call data
      const enrichedCall = {
        ...call,
        transcript: transcript.transcript,
        call_analysis: {
          ...call.call_analysis,
          custom_analysis_data: {
            ...call.call_analysis?.custom_analysis_data,
            summary: transcript.call_summary
          },
          user_sentiment: transcript.sentiment,
          call_successful: transcript.call_successful
        }
      };
      
      // Save to database
      await supabaseRetellService.saveRetellCall(enrichedCall, userId);
      
      return {
        call: enrichedCall,
        transcript
      };
    } catch (error) {
      console.error('Error getting call with transcript:', error);
      throw error;
    }
  },
  
  /**
   * Gets agents from database, falling back to API if needed
   */
  async getAgents(userId: string) {
    try {
      // Try to get from database first
      const dbAgents = await supabaseRetellService.getRetellAgents(userId);
      
      // If no agents in DB, sync from API
      if (!dbAgents || dbAgents.length === 0) {
        return this.syncAgents(userId);
      }
      
      return dbAgents;
    } catch (error) {
      console.error('Error getting agents:', error);
      throw error;
    }
  },
  
  /**
   * Gets calls from database, falling back to API if needed
   */
  async getCalls(userId: string, date: string = 'all', agentId: string = 'all') {
    try {
      // If specific filters are applied, sync from API to ensure latest data
      if (date !== 'all' || agentId !== 'all') {
        return this.syncCalls(userId, date, agentId);
      }
      
      // Otherwise try to get from database first
      const dbCalls = await supabaseRetellService.getRetellCalls(userId);
      
      // If no calls in DB, sync from API
      if (!dbCalls || dbCalls.length === 0) {
        return this.syncCalls(userId);
      }
      
      return dbCalls;
    } catch (error) {
      console.error('Error getting calls:', error);
      throw error;
    }
  }
};

export default combinedRetellService; 