import { ComponentType } from 'react';

export type SortDirection = "asc" | "desc" | "none";

export interface SortCriterion {
  column: string;
  direction: SortDirection;
}

export interface FilterCriterion {
  column: string;
  value: string;
  type: "contains" | "equals";
}

export type OpenAIModel =
  | 'gpt-3.5-turbo'
  | 'gpt-4o'
  | 'gpt-4o-mini';

export interface TranslateBody {
  topic: string;
  paragraphs: string;
  essayType: string;
  model: OpenAIModel;
  type?: 'review' | 'refactor' | 'complexity' | 'normal';
}

export interface ChatBody {
  inputMessage: string;
  model: OpenAIModel;
  apiKey?: string | undefined | null;
}

export interface TranslateResponse {
  code: string;
}

export interface PageMeta {
  title: string;
  description: string;
  cardImage: string;
}

export interface User {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  credits: number;
  billing_address?: any;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface WalletUsage {
  id: string;
  wallet_id: string;
  amount: number;
  description: string;
  transaction_type: string;
  created_at: string;
}

export interface VoiceAgent {
  id: string;
  user_id: string;
  agent_id: string;
  agent_name: string;
  voice_id: string;
  llm_websocket_url: string;
  configuration: any;
  created_at: string;
  updated_at: string;
}

export interface VoiceAgentCall {
  id: string;
  user_id: string;
  agent_id: string;
  call_id: string;
  call_status: string;
  call_type: string;
  start_timestamp: number;
  end_timestamp: number;
  duration_seconds: number;
  call_cost: number;
  recording_url: string;
  transcript: string;
  call_analysis: any;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface IRoute {
  path: string;
  name: string;
  layout?: string;
  exact?: boolean;
  component?: ComponentType;
  disabled?: boolean;
  icon?: JSX.Element;
  secondary?: boolean;
  collapse?: boolean;
  items?: IRoute[];
  rightElement?: boolean;
  invisible?: boolean;
  category?: string;
}

export interface EssayBody {
  topic: string;
  words: '300' | '200';
  essayType: '' | 'Argumentative' | 'Classic' | 'Persuasive' | 'Critique';
  model: OpenAIModel;
  apiKey?: string | undefined;
}

export interface PremiumEssayBody {
  words: string;
  topic: string;
  essayType:
    | ''
    | 'Argumentative'
    | 'Classic'
    | 'Persuasive'
    | 'Memoir'
    | 'Critique'
    | 'Compare/Contrast'
    | 'Narrative'
    | 'Descriptive'
    | 'Expository'
    | 'Cause and Effect'
    | 'Reflective'
    | 'Informative';
  tone: string;
  citation: string;
  level: string;
  model: OpenAIModel;
  apiKey?: string | undefined;
}
