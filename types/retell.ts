export interface Call {
  transcript: any;
  call_cost: any;
  call_type: string;
  access_token: string;
  call_id: string;
  agent_id: string;
  call_status: string;
  metadata: Record<string, any>;
  retell_llm_dynamic_variables?: {
    [key: string]: string;
  };
  opt_out_sensitive_data_storage?: boolean;
  start_timestamp?: number;
  end_timestamp?: number;
  transcript_object?: Array<{
    role: string;
    content: string;
    words: Array<{
      word: string;
      start: number;
      end: number;
    }>;
  }>;
  transcript_with_tool_calls?: Array<{
    role: string;
    content: string;
    words: Array<{
      word: string;
      start: number;
      end: number;
    }>;
  }>;
  recording_url?: string;
  public_log_url?: string;
  e2e_latency?: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
    max: number;
    min: number;
    num: number;
  };
  llm_latency?: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
    max: number;
    min: number;
    num: number;
  };
  llm_websocket_network_rtt_latency?: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
    max: number;
    min: number;
    num: number;
  };
  disconnection_reason?: 'user_hangup' | 'agent_hangup' | 'call_transfer' | 'inactivity' | 'machine_detected' | 
    'concurrency_limit_reached' | 'dial_busy' | 'dial_failed' | 'dial_no_answer' | 'error_llm_websocket_open' |
    'error_llm_websocket_lost_connection' | 'error_llm_websocket_runtime' | 'error_llm_websocket_corrupt_payload' |
    'error_frontend_corrupted_payload' | 'error_twilio';
  call_analysis?: {
    in_voicemail: boolean;
    user_sentiment: string;
    call_successful: boolean;
    custom_analysis_data: Record<string, any>;
  };
}

export interface Agent {
  configuration: any;
  agent_id: string;
  llm_websocket_url: string;
  agent_name?: string;
  voice_id: string;
  voice_model?: string;
  fallback_voice_ids?: string[];
  voice_temperature?: number;
  voice_speed?: number;
  volume?: number;
  responsiveness?: number;
  interruption_sensitivity?: number;
  enable_backchannel?: boolean;
  backchannel_frequency?: number;
  backchannel_words?: string[];
  reminder_trigger_ms?: number;
  reminder_max_count?: number;
  ambient_sound?: string;
  ambient_sound_volume?: number;
  language?: string;
  webhook_url?: string;
  boosted_keywords?: string[];
  opt_out_sensitive_data_storage?: boolean;
  pronunciation_dictionary?: Array<{
    word: string;
    alphabet: string;
    phoneme: string;
  }>;
  normalize_for_speech?: boolean;
  end_call_after_silence_ms?: number;
  max_call_duration_ms?: number;
  enable_voicemail_detection?: boolean;
  voicemail_message?: string;
  voicemail_detection_timeout_ms?: number;
  post_call_analysis_data?: Array<{
    type: string;
    name: string;
    description: string;
    examples: string[];
  }>;
  last_modification_timestamp?: number;
}

export interface RetellLLM {
  llm_id: string;
  llm_websocket_url: string;
  model: string;
  model_temperature?: number;
  general_prompt?: string;
  general_tools?: Array<{
    type: string;
    name: string;
    description: string;
    [key: string]: any;
  }>;
  states?: Array<{
    name: string;
    state_prompt: string;
    edges?: Array<{
      destination_state_name: string;
      description: string;
    }>;
    tools?: Array<{
      type: string;
      name: string;
      description: string;
      [key: string]: any;
    }>;
  }>;
  starting_state?: string;
  begin_message?: string;
  inbound_dynamic_variables_webhook_url?: string;
  last_modification_timestamp?: number;
}

export type ListCallsResponse = Call[];

export type CallTranscriptResponse = {
  transcript: string;
  crm_note: string;
  sentiment: string;
  call_successful: boolean;
  call_summary: string;
  success_evaluation: string;
  call_duration: number;
  call_type: string;
  call_id: string;
  call_status: string;
  call_start_time: number;
  call_end_time: number;
  
};

export type KnowledgeBaseResponse = {
  knowledge_base_id: string;
  knowledge_base_name: string;
  status: 'in_progress' | 'complete' | 'error';
  knowledge_base_sources: Array<{
    type: 'document';
    source_id: string;
    filename: string;
    file_url: string;
  }>;
  enable_auto_refresh: boolean;
  last_refreshed_timestamp: number;
};

export type GetAgentsResponse = Agent[];

export type CreateAgentResponse = Agent;

export type UpdateAgentResponse = Agent;

export type GetAgentByIdResponse = Agent;