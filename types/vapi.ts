export interface Call {
  direction: string;
  assistantId: string;
  endedAt: string;
  id: string;
  startedAt: string;
  recordingUrl: string;
  cost: number;
  customer?: {
    number: string;
    name?: string;
    email?: string;
    id?: string;
  };
  phoneNumberId?: string;
  createdAtGt?: Date | string;
  createdAtLt?: Date | string;
  createdAtGe?: Date | string;
  createdAtLe?: Date | string;
  updatedAtGt?: Date | string;
  updatedAtLt?: Date | string;
  updatedAtGe?: Date | string;
  updatedAtLe?: Date | string;
  endedReason?: string;
  status?: string;
  artifact?: {
    transcript?: string;
  };
  analysis?: {
    summary?: string;
    successEvaluation?: string;
    structuredData?: {
      sentiment?: string;
    };
  };
}

export interface Agent {
  id: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  transcriber?: {
    provider: string;
    disablePartialTranscripts?: boolean;
    endUtteranceSilenceThreshold?: number;
    language?: string;
    realtimeUrl?: string;
    wordBoost?: string[];
  };
  model?: {
    provider: string;
    model: string;
    emotionRecognitionEnabled?: boolean;
    knowledgeBase?: {
      server?: {
        url: string;
        timeoutSeconds?: number;
        backoffPlan?: {
          maxRetries: number;
          type: Record<string, any>;
          baseDelaySeconds: number;
        };
      };
    };
    knowledgeBaseId?: string;
    maxTokens?: number;
    messages?: Array<{
      role: string;
    }>;
    numFastTurns?: number;
    temperature?: number;
    toolIds?: string[];
    tools?: Array<{
      type: string;
      async: boolean;
    }>;
  };
  voice?: {
    provider: string;
    voiceId: string;
    chunkPlan?: {
      enabled: boolean;
      minCharacters: number;
    };
    fallbackPlan?: {
      voices: Array<{
        provider: string;
        voiceId: string;
      }>;
    };
    speed?: number;
  };
  firstMessage?: string;
  firstMessageMode?: string;
  clientMessages?: string[];
  serverMessages?: string[];
  silenceTimeoutSeconds?: number;
  maxDurationSeconds?: number;
  backgroundSound?: string;
  backgroundDenoisingEnabled?: boolean;
  modelOutputInMessagesEnabled?: boolean;
  transportConfigurations?: Array<{
    provider: string;
    timeout: number;
    record: boolean;
  }>;
  credentials?: Array<{
    provider: string;
    apiKey: string;
  }>;
  voicemailDetection?: {
    provider: string;
    voicemailDetectionTypes: string[];
    enabled: boolean;
    machineDetectionTimeout?: number;
    machineDetectionSpeechThreshold?: number;
    machineDetectionSpeechEndThreshold?: number;
    machineDetectionSilenceTimeout?: number;
  };
  voicemailMessage?: string;
  endCallMessage?: string;
  endCallPhrases?: string[];
  compliancePlan?: {
    hipaaEnabled: boolean;
    pciEnabled: boolean;
  };
  metadata?: Record<string, any>;
  artifactPlan?: {
    recordingEnabled: boolean;
    videoRecordingEnabled: boolean;
    pcapEnabled: boolean;
    pcapS3PathPrefix?: string;
    transcriptPlan?: {
      enabled: boolean;
    };
    recordingPath?: string;
  };
  messagePlan?: {
    idleMessages: string[];
    idleMessageMaxSpokenCount?: number;
    idleTimeoutSeconds?: number;
    silenceTimeoutMessage?: string;
  };
  startSpeakingPlan?: {
    waitSeconds: number;
    smartEndpointingEnabled: boolean;
    customEndpointingRules?: Array<{
      type: string;
      regex: string;
      timeoutSeconds: number;
    }>;
    transcriptionEndpointingPlan?: {
      onPunctuationSeconds: number;
      onNoPunctuationSeconds: number;
      onNumberSeconds: number;
    };
  };
  stopSpeakingPlan?: {
    numWords: number;
    voiceSeconds: number;
    backoffSeconds: number;
    acknowledgementPhrases: string[];
    interruptionPhrases: string[];
  };
  monitorPlan?: {
    listenEnabled: boolean;
    controlEnabled: boolean;
  };
  credentialIds?: string[];
  server?: {
    url: string;
    timeoutSeconds: number;
    secret: string;
    headers?: Record<string, string>;
    backoffPlan?: {
      maxRetries: number;
      type: Record<string, any>;
      baseDelaySeconds: number;
    };
  };
  hooks?: Array<{
    on: string;
    do: Array<Record<string, any>>;
  }>;
}

export type ListCallsResponse = Call[]; 

export type CallTranscriptResponse = {
  transcript: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  call_successful: boolean;
  call_summary: string;
  success_avaluation: string;
};

export type OrgKnowledgeResponse = {
  limit: number;
  createdAtGt: Date | string;
  createdAtLt: Date | string;
  createdAtGe: Date | string;
  createdAtLe: Date | string;
  updatedAtGt: Date | string;
  updatedAtLt: Date | string;
  updatedAtGe: Date | string;
  updatedAtLe: Date | string;
};

export type SquadsResponse = {
  members: Array<Record<string, any>>;
  id: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  membersOverrides: {
    transcriber?: {
      provider: string;
    };
    model?: {
      provider: string;
      model: string;
    };
    voice?: {
      provider: string;
      voiceId: string;
    };
    firstMessage?: string;
    firstMessageMode?: string;
    clientMessages?: string[];
    serverMessages?: string[];
    silenceTimeoutSeconds?: number;
    maxDurationSeconds?: number;
    backgroundSound?: string;
    backgroundDenoisingEnabled?: boolean;
    modelOutputInMessagesEnabled?: boolean;
    transportConfigurations?: Array<{
      provider: string;
      timeout: number;
      record: boolean;
    }>;
    credentials?: Array<{
      provider: string;
      apiKey: string;
    }>;
    variableValues?: Record<string, string>;
    name?: string;
    voicemailDetection?: {
      provider: string;
    };
    voicemailMessage?: string;
    endCallMessage?: string;
    endCallPhrases?: string[];
    metadata?: Record<string, string>;
    artifactPlan?: {
      recordingEnabled: boolean;
      videoRecordingEnabled: boolean;
      pcapEnabled: boolean;
      pcapS3PathPrefix: string;
    };
    startSpeakingPlan?: {
      waitSeconds: number;
      smartEndpointingEnabled: boolean;
    };
    stopSpeakingPlan?: {
      numWords: number;
      voiceSeconds: number;
      backoffSeconds: number;
    };
    monitorPlan?: {
      listenEnabled: boolean;
      controlEnabled: boolean;
    };
    credentialIds?: string[];
    server?: {
      url: string;
      timeoutSeconds: number;
      backoffPlan: {
        maxRetries: number;
        type: Record<string, string>;
        baseDelaySeconds: number;
      };
    };
    hooks?: Array<{
      on: string;
      do: Array<Record<string, any>>;
    }>;
  };
}[];

export type GetAgentsResponse = Agent[];

export type CreateAgentResponse = Agent;

export type UpdateAgentResponse = Agent;

export type GetAgentByIdResponse = Agent;