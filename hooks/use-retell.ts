import { useState, useCallback, useEffect, useContext } from 'react';
import { Agent, Call, CallTranscriptResponse } from '@/types/retell';
import { useToast } from '@/hooks/use-toast';
import { useDashboard } from '@/contexts/DashboardContext';
import { AuthContext } from '@/hooks/use-auth';
import { useSupabase } from '@/app/supabase-provider';

export function useRetell() {
  const { supabase } = useSupabase();
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const dashboard = useDashboard();
  const integration = dashboard?.integration;
  const [loading, setLoading] = useState<boolean>(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [transcript, setTranscript] = useState<CallTranscriptResponse | null>(null);
  const { toast } = useToast();

  const handleError = useCallback((error: any, message: string) => {
    console.error(message, error);
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  }, [toast]);

  const getAgents = useCallback(async () => {
    if (!user) return [];
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('retell_agents')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setAgents(data);
      return data;
    } catch (error) {
      handleError(error, 'Failed to fetch agents');
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError, supabase, user]);

  const syncAgents = useCallback(async () => {
    if (!user) return [];
    
    try {
      setLoading(true);
      // This would typically call the Retell API to sync agents
      // For now, we'll just fetch the existing agents from the database
      const { data, error } = await supabase
        .from('retell_agents')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setAgents(data);
      toast({
        title: 'Success',
        description: 'Agents synced successfully',
      });
      return data;
    } catch (error) {
      handleError(error, 'Failed to sync agents');
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError, toast, supabase, user]);

  const createAgent = useCallback(async (agentData: Partial<Agent>) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      
      // Generate a unique agent_id if not provided
      const agent_id = agentData.agent_id || `agent_${Date.now()}`;
      
      const { data, error } = await supabase
        .from('retell_agents')
        .insert({
          user_id: user.id,
          agent_id,
          agent_name: agentData.agent_name || 'New Agent',
          voice_id: agentData.voice_id || 'default',
          llm_websocket_url: agentData.llm_websocket_url || '',
          configuration: agentData.configuration || {}
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update agents list
      setAgents(prev => [...prev, data]);
      
      toast({
        title: 'Success',
        description: 'Agent created successfully',
      });
      
      return data;
    } catch (error) {
      handleError(error, 'Failed to create agent');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, toast, supabase, user]);

  const updateAgent = useCallback(async (agentId: string, agentData: Partial<Agent>) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('retell_agents')
        .update({
          agent_name: agentData.agent_name,
          voice_id: agentData.voice_id,
          llm_websocket_url: agentData.llm_websocket_url,
          configuration: agentData.configuration
        })
        .eq('agent_id', agentId)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update agents list
      setAgents(prev => 
        prev.map(agent => 
          agent.agent_id === agentId ? data : agent
        )
      );
      
      toast({
        title: 'Success',
        description: 'Agent updated successfully',
      });
      
      return data;
    } catch (error) {
      handleError(error, 'Failed to update agent');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, toast, supabase, user]);

  const getCalls = useCallback(async (date: string = 'all', agentId: string = 'all') => {
    if (!user) return [];
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('retell_calls')
        .select('*')
        .eq('user_id', user.id);
      
      // Add date filter if provided
      if (date !== 'all') {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString());
      }
      
      // Add agent filter if provided
      if (agentId !== 'all') {
        query = query.eq('agent_id', agentId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setCalls(data);
      return data;
    } catch (error) {
      handleError(error, 'Failed to fetch calls');
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError, supabase, user]);

  const getCall = useCallback(async (callId: string) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('retell_calls')
        .select('*')
        .eq('call_id', callId)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      setCurrentCall(data);
      return data;
    } catch (error) {
      handleError(error, 'Failed to fetch call');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, supabase, user]);

  const getTranscript = useCallback(async (callId: string) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('retell_calls')
        .select('transcript')
        .eq('call_id', callId)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      const transcriptData = data.transcript ? JSON.parse(data.transcript) : null;
      setTranscript(transcriptData);
      return transcriptData;
    } catch (error) {
      handleError(error, 'Failed to fetch transcript');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, supabase, user]);

  // Load agents on mount
  useEffect(() => {
    if (user) {
      getAgents();
    }
  }, [user, getAgents]);

  return {
    loading,
    agents,
    calls,
    currentCall,
    transcript,
    getAgents,
    syncAgents,
    createAgent,
    updateAgent,
    getCalls,
    getCall,
    getTranscript,
  };
}