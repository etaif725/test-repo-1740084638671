"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout"
import { User } from "@supabase/supabase-js"
import { useTheme } from "next-themes"
import { createClient } from '@supabase/supabase-js'
import Retell from 'retell-sdk'
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "@/hooks/use-toast"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Avatar } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BsChevronCompactDown } from "react-icons/bs"
import { Divider } from "@mui/material"
import { FaPlus, FaTrash, FaUpload } from "react-icons/fa"
import { CheckCircleIcon, FileIcon, TrashIcon, UploadIcon, XIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const STORAGE_KEY = "voice-agent-form"
const RETELL_API_KEY = process.env.NEXT_PUBLIC_RETELL_API_KEY || ''

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Initialize Retell client
const retellClient = new Retell({
  apiKey: RETELL_API_KEY,
})

const formSchema = z.object({
  agentName: z.string().min(1, "Agent name is required"),
  voiceId: z.string().min(1, "Voice is required"),
  voiceModel: z.string().min(1, "Voice model is required"),
  voiceTemperature: z.number().min(0).max(1).default(0.2),
  voiceSpeed: z.number().min(0.5).max(2).default(1.04),
  volume: z.number().min(0).max(2).default(1.48),
  enableBackchannel: z.boolean().default(true),
  backchannelFrequency: z.number().min(0).max(1).default(0.7),
  backchannelWords: z.array(z.string()).default(["yeah", "you know", "ummm", "oh", "sure"]),
  reminderTriggerMs: z.number().min(1000).default(5000),
  reminderMaxCount: z.number().min(1).default(2),
  interruptionSensitivity: z.number().min(0).max(1).default(0.6),
  ambientSound: z.string().optional(),
  ambientSoundVolume: z.number().min(0).max(1).default(0.3),
  language: z.string().min(1, "Language is required"),
  optOutSensitiveDataStorage: z.boolean().default(false),
  normalizeForSpeech: z.boolean().default(false),
  endCallAfterSilenceMs: z.number().min(10000).default(62000),
  enableVoicemailDetection: z.boolean().default(false),
  voicemailMessage: z.string().optional(),
  maxCallDurationMs: z.number().min(60000).max(7200000).default(417000),
  voicemailDetectionTimeoutMs: z.number().min(5000).default(30000),
  beginMessageDelayMs: z.number().min(0).default(200),
  llmId: z.string().min(1, "LLM ID is required"),
  llmModel: z.string().min(1, "LLM model is required"),
  llmTemperature: z.number().min(0).max(1).default(0.4),
  llmHighPriority: z.boolean().default(false),
  toolCallStrictMode: z.boolean().default(false),
  generalPrompt: z.string().min(1, "General prompt is required"),
  knowledgeBaseIds: z.array(z.string()).default([]),
  enableTranscriptionFormatting: z.boolean().default(true),
  responsiveness: z.number().min(0).max(2).default(1),
  postCallAnalysisData: z.array(z.object({
    type: z.string(),
    name: z.string(),
    description: z.string(),
    examples: z.array(z.string()).optional()
  })).default([]),
  // Custom LLM Response Engine fields
  customLLMId: z.string().optional(),
  calApiKey: z.string().optional(),
  eventTypeId: z.number().optional(),
  transferCallNumber: z.string().optional(),
  useCustomResponseEngine: z.boolean().default(false),
  customStates: z.array(z.object({
    name: z.string(),
    statePrompt: z.string(),
    edges: z.array(z.object({
      description: z.string(),
      speakDuringTransition: z.boolean(),
      destinationStateName: z.string()
    })).optional(),
    tools: z.array(z.object({
      name: z.string(),
      description: z.string(),
      type: z.string(),
      transferDestination: z.object({
        type: z.string(),
        number: z.string()
      }).optional(),
      eventTypeId: z.number().optional(),
      calApiKey: z.string().optional(),
      timezone: z.string().optional()
    })).optional()
  })).default([]),
  // Company information
  companyName: z.string().min(1, "Company name is required"),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email("Invalid email format").optional(),
  hoursOfOperation: z.string().optional(),
  // Knowledge base
  orgId: z.string().optional(),
  workspaceId: z.string().optional(),
  knowledgeBaseUrls: z.array(z.string().url("Invalid URL format")).default([]),
  knowledgeBaseFiles: z.array(z.any()).default([]),
  // FAQs
  faqs: z.array(z.object({
    question: z.string().min(1, "Question is required"),
    answer: z.string().min(1, "Answer is required")
  })).default([{ question: "", answer: "" }])
})

const languages = [
  { id: 'multi', name: 'Multi-Lingual (English & Spanish only)' },
  { id: 'en-US', name: 'English (US)' },
  { id: 'en-IN', name: 'English (India)' },
  { id: 'en-GB', name: 'English (UK)' },
  { id: 'de-DE', name: 'German' },
  { id: 'es-ES', name: 'Spanish (Spain)' },
  { id: 'es-419', name: 'Spanish (Latin America)' },
  { id: 'hi-IN', name: 'Hindi' },
  { id: 'ja-JP', name: 'Japanese' },
  { id: 'pt-PT', name: 'Portuguese (Portugal)' },
  { id: 'pt-BR', name: 'Portuguese (Brazil)' },
  { id: 'fr-FR', name: 'French' },
  { id: 'zh-CN', name: 'Chinese (Mandarin)' },
  { id: 'ru-RU', name: 'Russian' },
  { id: 'it-IT', name: 'Italian' },
  { id: 'ko-KR', name: 'Korean' },
  { id: 'nl-NL', name: 'Dutch' },
  { id: 'pl-PL', name: 'Polish' },
  { id: 'tr-TR', name: 'Turkish' },
  { id: 'vi-VN', name: 'Vietnamese' }
]

const ambientSounds = [
  { id: 'coffee-shop', name: 'Coffee Shop', icon: '☕' },
  { id: 'convention-hall', name: 'Convention Hall', icon: '🏢' },
  { id: 'summer-outdoor', name: 'Summer Outdoor', icon: '☀️' },
  { id: 'mountain-outdoor', name: 'Mountain Outdoor', icon: '🏔️' },
  { id: 'static-noise', name: 'Static Noise', icon: '📻' },
  { id: 'call-center', name: 'Call Center', icon: '🎧' }
]

const voiceModels = [
  { id: 'eleven_flash_v2', name: 'Flash 2 (Super fast - least emotional)' },
  { id: 'eleven_flash_v2_5', name: 'Flash 2.5 (Super fast - least emotional)' },
  { id: 'eleven_turbo_v2', name: 'Turbo 2 (Balanced - English Only)' },
  { id: 'eleven_turbo_v2_5', name: 'Turbo 2.5 (Balanced - multi-lingual)' },
  { id: 'eleven_multilingual_v2', name: 'Multilingual (Super Slow - most emotional)' }
]

const llmModels = [
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'claude-3.7 (coming soon)', name: 'Claude 3.7' },
]

// Default state templates for custom response engine
const defaultStates = [
  {
    name: "agent_pitch",
    statePrompt: "### Role:\n\nYou are an AI Assistant for the company. You should speak in a friendly, professional manner.\n\n### Task:\n\nYour primary task is to act as a sales agent/appointment setter, to get the client interested in the company's solutions.\n\n### Closing:\n\nIf the client is interested, schedule an appointment with them.\n\n### Client Variables:\n\n- Prospect's First Name: {{lead_first_name}}\n- Prospect's Last Name: {{lead_last_name}}\n- Email: {{lead_email}}\n- Phone: {{lead_phone}}\n- Current Time: {{now}}",
    edges: [
      {
        description: "Transition to schedule an appointment",
        speakDuringTransition: false,
        destinationStateName: "schedule_appt"
      }
    ],
    tools: [
      {
        name: "transfer_call",
        description: "Transfer the call when the user asks to speak to a live agent",
        type: "transfer_call",
        transferDestination: {
          type: "predefined",
          number: "+10000000000"
        }
      }
    ]
  },
  {
    name: "schedule_appt",
    statePrompt: "### Scheduling Appointments:\nCurrent time is {{current_time}}.\n\n# Follow these steps:\n\n1. Ask what day or date they would like to book an appointment.\n2. Check if the slot is available on the calendar.\n3. If available, book the appointment.",
    edges: [],
    tools: [
      {
        name: "check_availability",
        description: "Check calendar availability",
        type: "check_availability_cal",
        eventTypeId: 0,
        calApiKey: "",
        timezone: "America/New_York"
      },
      {
        name: "book_appointment",
        description: "Book an appointment on the calendar",
        type: "book_appointment_cal",
        eventTypeId: 0,
        calApiKey: "",
        timezone: "America/New_York"
      }
    ]
  }
]

const defaultPostCallAnalysisData = [
  {
    type: "string",
    name: "detailed_call_summary",
    description: "Based on the call transcript, evaluate the call and provide a detailed criteria to better understand the client's needs, pain points and chances of choosing our service. Use a Checklist method to present the data by criteria and status"
  },
  {
    name: "crm_call_summary",
    description: "Summarize this sales qualification call in 150-300 words (context dependent). Focus on:\n\n1. Company size and current operations\n2. Main pain points in their scheduling process\n3. Level of interest in the solution\n4. Decision maker status\n5. Outcome (demo scheduled/email follow-up/not interested)\n6. Client Intent: Neutral, Negative, or Positive",
    type: "string",
    examples: []
  },
  {
    type: "string",
    name: "success_ev_call",
    description: "Based on the call transcript, evaluate the call and provide a detailed criteria to better understand the client's needs, pain points, are they likely to buy, and measure the performance of the agent as well and how he can do better next call. \n---\nUse a Matrix methodology to present the data in detail. Matrix is a grid that evaluates multiple criteria across different performance levels"
  },
  {
    name: "output_data_call_summary",
    description: "output the user information such as first name, last name, email, phone, time zone.",
    type: "string",
    examples: [
      "lead_email",
      "lead_timezone",
      "lead_first_name",
      "lead_last_name",
      "lead_phone"
    ]
  }
]

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

export function NewVoiceAgentRT(props: Props) {
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [voices, setVoices] = useState<any[]>([])
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [customLLMResponseEngine, setCustomLLMResponseEngine] = useState<any>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isCreatingKnowledgeBase, setIsCreatingKnowledgeBase] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agentName: "",
      voiceId: "",
      voiceModel: "eleven_turbo_v2_5",
      voiceTemperature: 0.3,
      voiceSpeed: 1.04,
      volume: 1.28,
      enableBackchannel: true,
      backchannelFrequency: 0.7,
      backchannelWords: ["yeah", "you know", "ummm", "oh", "sure"],
      reminderTriggerMs: 5000,
      reminderMaxCount: 2,
      interruptionSensitivity: 0.6,
      ambientSound: "",
      ambientSoundVolume: 0.3,
      language: "en-US",
      optOutSensitiveDataStorage: false,
      normalizeForSpeech: false,
      endCallAfterSilenceMs: 62000,
      enableVoicemailDetection: true,
      voicemailMessage: "",
      maxCallDurationMs: 417000,
      voicemailDetectionTimeoutMs: 30000,
      beginMessageDelayMs: 200,
      llmId: "",
      llmModel: "gpt-4o-mini",
      llmTemperature: 0.4,
      llmHighPriority: false,
      toolCallStrictMode: false,
      generalPrompt: "",
      knowledgeBaseIds: [],
      enableTranscriptionFormatting: true,
      responsiveness: 1,
      postCallAnalysisData: defaultPostCallAnalysisData,
      // Custom LLM Response Engine fields
      customLLMId: "",
      calApiKey: "",
      eventTypeId: 0,
      transferCallNumber: "",
      useCustomResponseEngine: false,
      customStates: defaultStates,
      // Company information
      companyName: "",
      companyPhone: "",
      companyEmail: "",
      hoursOfOperation: "",
      // Knowledge base
      orgId: props.userDetails?.org_id || "",
      workspaceId: props.userDetails?.workspace_id || "",
      knowledgeBaseUrls: [],
      knowledgeBaseFiles: [],
      // FAQs
      faqs: [{ question: "", answer: "" }]
    }
  })

  useEffect(() => {
    setMounted(true)
    loadVoices()
    loadKnowledgeBases()
    loadCustomLLMResponseEngine()
  }, [])

  const loadVoices = async () => {
    try {
      const response = await retellClient.voice.list()
      setVoices(response)
    } catch (err) {
      console.error('Error loading voices:', err)
    }
  }

  const loadKnowledgeBases = async () => {
    try {
      const response = await retellClient.knowledgeBase.list()
      setKnowledgeBases(response)
    } catch (err) {
      console.error('Error loading knowledge bases:', err)
    }
  }

  const loadCustomLLMResponseEngine = async () => {
    try {
      // Check if user has a predefined custom LLM response engine in Supabase
      const { data, error } = await supabase
        .from('custom_llm_response_engines')
        .select('*')
        .eq('user_id', props.user?.id)
        .single()

      if (data) {
        setCustomLLMResponseEngine(data)
        // Pre-populate form with custom LLM response engine data
        form.setValue('customLLMId', data.llm_id || "")
        form.setValue('calApiKey', data.cal_api_key || "")
        form.setValue('eventTypeId', data.event_type_id || 0)
        form.setValue('transferCallNumber', data.transfer_call_number || "")
      }
    } catch (err) {
      console.error('Error loading custom LLM response engine:', err)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles(prev => [...prev, ...newFiles])
      form.setValue('knowledgeBaseFiles', [...uploadedFiles, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    const updatedFiles = [...uploadedFiles]
    updatedFiles.splice(index, 1)
    setUploadedFiles(updatedFiles)
    form.setValue('knowledgeBaseFiles', updatedFiles)
  }

  const addFAQ = () => {
    const currentFaqs = form.getValues('faqs')
    form.setValue('faqs', [...currentFaqs, { question: "", answer: "" }])
  }

  const removeFAQ = (index: number) => {
    const currentFaqs = form.getValues('faqs')
    if (currentFaqs.length > 1) {
      const updatedFaqs = [...currentFaqs]
      updatedFaqs.splice(index, 1)
      form.setValue('faqs', updatedFaqs)
    }
  }

  const addKnowledgeBaseUrl = () => {
    const currentUrls = form.getValues('knowledgeBaseUrls')
    form.setValue('knowledgeBaseUrls', [...currentUrls, ""])
  }

  const removeKnowledgeBaseUrl = (index: number) => {
    const currentUrls = form.getValues('knowledgeBaseUrls')
    const updatedUrls = [...currentUrls]
    updatedUrls.splice(index, 1)
    form.setValue('knowledgeBaseUrls', updatedUrls)
  }

  const createKnowledgeBase = async (values: z.infer<typeof formSchema>) => {
    setIsCreatingKnowledgeBase(true)
    try {
      // Create knowledge base
      const kbResponse = await retellClient.knowledgeBase.create({
        knowledge_base_name: `${values.companyName} Knowledge Base`,
        enable_auto_refresh: true
      })

      // Add URLs to knowledge base
      if (values.knowledgeBaseUrls.length > 0) {
        await retellClient.knowledgeBase.addSources(kbResponse.knowledge_base_id, {
          knowledge_base_urls: values.knowledgeBaseUrls.filter(url => url.trim() !== "")
        })
      }

      // Add files to knowledge base
      if (uploadedFiles.length > 0) {
        const formData = new FormData()
        uploadedFiles.forEach(file => {
          formData.append('knowledge_base_files', file)
        })

        await fetch(`https://api.retellai.com/add-knowledge-base-sources/${kbResponse.knowledge_base_id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RETELL_API_KEY}`
          },
          body: formData
        })
      }

      // Add FAQs as text to knowledge base
      if (values.faqs.length > 0 && values.faqs[0].question !== "") {
        const faqTexts = values.faqs.map(faq => ({
          text: `Q: ${faq.question}\nA: ${faq.answer}`,
          title: faq.question
        }))

        await retellClient.knowledgeBase.addSources(kbResponse.knowledge_base_id, {
          knowledge_base_texts: faqTexts
        })
      }

      toast({
        title: "Knowledge Base Created",
        description: "Your knowledge base has been created successfully",
      })

      return kbResponse.knowledge_base_id
    } catch (err) {
      console.error('Error creating knowledge base:', err)
      toast({
        title: "Error",
        description: "Failed to create knowledge base",
        variant: "destructive"
      })
      return null
    } finally {
      setIsCreatingKnowledgeBase(false)
    }
  }

  const createCustomLLMResponseEngine = async (values: z.infer<typeof formSchema>) => {
    try {
      // Create a custom LLM response engine configuration
      const customResponseEngine = {
        llm_id: values.customLLMId || `llm_${Math.random().toString(36).substring(2, 15)}`,
        model: values.llmModel,
        model_temperature: values.llmTemperature,
        model_high_priority: values.llmHighPriority,
        tool_call_strict_mode: values.toolCallStrictMode,
        general_prompt: values.generalPrompt,
        general_tools: [
          {
            type: "end_call",
            name: "end_call",
            description: ""
          },
          {
            name: "transfer_call_live",
            description: "When user is angry or requests a human agent, transfer the call to a human.",
            number: values.transferCallNumber || "+10000000000",
            transfer_destination: {
              type: "predefined",
              number: values.transferCallNumber || "+10000000000"
            },
            type: "transfer_call",
            show_transferee_as_caller: false
          },
          {
            name: "check_calendar_availability",
            description: "When users ask for availability, check the calendar and provide available slots.",
            event_type_id: values.eventTypeId || 0,
            cal_api_key: values.calApiKey || "",
            type: "check_availability_cal",
            timezone: "America/New_York"
          },
          {
            event_type_id: values.eventTypeId || 0,
            cal_api_key: values.calApiKey || "",
            cal_fields: [
              {
                name: "name",
                description: "attendee name",
                type: "string",
                required: true
              },
              {
                name: "email",
                description: "attendee email",
                type: "string",
                required: true
              }
            ],
            timezone: "America/New_York",
            name: "book_appointment_cal",
            description: "When users ask to book an appointment, book it on the calendar.",
            location_type: "integrations:google:meet",
            type: "book_appointment_cal"
          }
        ],
        states: values.customStates.map(state => ({
          name: state.name,
          state_prompt: state.statePrompt,
          edges: state.edges?.map(edge => ({
            description: edge.description,
            speak_during_transition: edge.speakDuringTransition,
            destination_state_name: edge.destinationStateName
          })) || [],
          tools: state.tools?.map(tool => {
            const mappedTool: any = {
              name: tool.name,
              description: tool.description,
              type: tool.type
            }
            
            if (tool.type === "transfer_call" && tool.transferDestination) {
              mappedTool.transfer_destination = tool.transferDestination
              mappedTool.number = tool.transferDestination.number
            }
            
            if ((tool.type === "check_availability_cal" || tool.type === "book_appointment_cal") && tool.eventTypeId) {
              mappedTool.event_type_id = tool.eventTypeId
              mappedTool.cal_api_key = tool.calApiKey
              mappedTool.timezone = tool.timezone
            }
            
            return mappedTool
          }) || []
        })),
        starting_state: values.customStates[0]?.name || "agent_pitch",
        begin_message: "",
        knowledge_base_ids: values.knowledgeBaseIds,
        last_modification_timestamp: Date.now()
      }

      // Save custom LLM response engine to Supabase for reuse
      const { data, error } = await supabase
        .from('custom_llm_response_engines')
        .upsert({
          user_id: props.user?.id,
          llm_id: customResponseEngine.llm_id,
          cal_api_key: values.calApiKey,
          event_type_id: values.eventTypeId,
          transfer_call_number: values.transferCallNumber,
          states: values.customStates,
          config: customResponseEngine,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      return customResponseEngine
    } catch (err) {
      console.error('Error creating custom LLM response engine:', err)
      throw err
    }
  }

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      // Create knowledge base if files or URLs are provided
      let knowledgeBaseId = null
      if (values.knowledgeBaseUrls.length > 0 || uploadedFiles.length > 0 || (values.faqs.length > 0 && values.faqs[0].question !== "")) {
        knowledgeBaseId = await createKnowledgeBase(values)
      }

      // Update knowledge base IDs
      const updatedKnowledgeBaseIds = knowledgeBaseId 
        ? [...values.knowledgeBaseIds, knowledgeBaseId]
        : values.knowledgeBaseIds

      let responseEngine: any = {
        type: "retell-llm",
        llm_id: values.llmId,
        model: values.llmModel,
        model_temperature: values.llmTemperature,
        model_high_priority: values.llmHighPriority,
        tool_call_strict_mode: values.toolCallStrictMode,
        general_prompt: values.generalPrompt,
        knowledge_base_ids: updatedKnowledgeBaseIds
      }

      // If using custom response engine, create it
      if (values.useCustomResponseEngine) {
        const customEngine = await createCustomLLMResponseEngine(values)
        responseEngine = customEngine
      }

      // Create dynamic variables for company info
      const dynamicVariables: Record<string, string> = {
        company_name: values.companyName,
        company_phone: values.companyPhone || "",
        company_email: values.companyEmail || "",
        hours_of_operation: values.hoursOfOperation || ""
      }

      // Add FAQs to dynamic variables
      values.faqs.forEach((faq, index) => {
        if (faq.question && faq.answer) {
          dynamicVariables[`faq_${index + 1}_question`] = faq.question
          dynamicVariables[`faq_${index + 1}_answer`] = faq.answer
        }
      })

      // Construct agent config object
      const agentConfig = {
        agent_name: values.agentName,
        voice_id: values.voiceId,
        voice_model: values.voiceModel,
        fallback_voice_ids: [],
        voice_temperature: values.voiceTemperature,
        voice_speed: values.voiceSpeed,
        volume: values.volume,
        enable_backchannel: values.enableBackchannel,
        backchannel_frequency: values.backchannelFrequency,
        backchannel_words: values.backchannelWords,
        reminder_trigger_ms: values.reminderTriggerMs,
        reminder_max_count: values.reminderMaxCount,
        interruption_sensitivity: values.interruptionSensitivity,
        ambient_sound: values.ambientSound || null,
        ambient_sound_volume: values.ambientSoundVolume,
        language: values.language,
        opt_out_sensitive_data_storage: values.optOutSensitiveDataStorage,
        normalize_for_speech: values.normalizeForSpeech,
        end_call_after_silence_ms: values.endCallAfterSilenceMs,
        enable_voicemail_detection: values.enableVoicemailDetection,
        voicemail_message: values.voicemailMessage || "",
        max_call_duration_ms: values.maxCallDurationMs,
        voicemail_detection_timeout_ms: values.voicemailDetectionTimeoutMs,
        begin_message_delay_ms: values.beginMessageDelayMs,
        enable_transcription_formatting: values.enableTranscriptionFormatting,
        responsiveness: values.responsiveness,
        post_call_analysis_data: values.postCallAnalysisData,
        response_engine: responseEngine,
        dynamic_variables: dynamicVariables,
        org_id: values.orgId,
        workspace_id: values.workspaceId
      }

      // Create agent via Retell API
      const response = await retellClient.agent.create(agentConfig as unknown as Retell.AgentCreateParams)
      
      // Save to Supabase
      const { error } = await supabase
        .from('voice_agents')
        .insert([{
          user_id: props.user?.id,
          agent_id: response.agent_id,
          agent_name: values.agentName,
          voice_id: values.voiceId,
          voice_model: values.voiceModel,
          language: values.language,
          llm_id: values.useCustomResponseEngine ? values.customLLMId : values.llmId,
          llm_model: values.llmModel,
          config: agentConfig,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      if (error) throw error

      toast({
        title: "Success",
        description: "Voice agent created successfully",
      })

    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create voice agent",
        variant: "destructive"
      })
      console.error('Error creating agent:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <DashboardLayout
      title="New Voice Agent"
      description="Create a new AI voice agent"
    >
      <div className="">
        <Card className="p-6 w-full h-full bg-card text-card-foreground">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-6 text-black">
                  <TabsTrigger value="basic" className="text-black">Basic Info</TabsTrigger>
                  <TabsTrigger value="voice" className="text-black">Voice & Personality</TabsTrigger>
                  <TabsTrigger value="brain" className="text-black">AI Brain</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 text-black">
                  <FormField
                    control={form.control}
                    name="agentName"
                    render={({ field }) => (
                      <FormItem className="text-black dark:text-white">
                        <FormLabel>Agent Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Sales Assistant" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem className="text-black dark:text-white">
                        <FormLabel>Language</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-black dark:text-white">
                              <SelectValue placeholder="Select language" className="text-black dark:text-white" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="text-black dark:text-white bg-white dark:bg-black">
                            {languages.map((lang) => (
                              <SelectItem key={lang.id} value={lang.id} className="text-black dark:text-white">
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4 border p-4 rounded-lg text-black dark:text-white">
                    <h3 className="text-lg font-medium">Company Information</h3>
                    <p className="text-sm text-muted-foreground">
                      This information will be available to your AI agent during conversations
                    </p>
                    
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem className="text-black dark:text-white">
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Acme Corporation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="companyPhone"
                      render={({ field }) => (
                        <FormItem className="text-black dark:text-white">
                          <FormLabel>Company Phone (RAW Format Only)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. +1xxxxxxxxxx" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="companyEmail"
                      render={({ field }) => (
                        <FormItem className="text-black dark:text-white">
                          <FormLabel>Company Email</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. contact@acme.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hoursOfOperation"
                      render={({ field }) => (
                        <FormItem className="text-black dark:text-white">
                          <FormLabel>Hours of Operation</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Mon-Fri: 9am-5pm, Sat: 10am-2pm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 border p-4 rounded-lg text-black dark:text-white">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Frequently Asked Questions</h3>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const currentFaqs = form.getValues("faqs");
                          form.setValue("faqs", [
                            ...currentFaqs, 
                            { question: "", answer: "" }
                          ]);
                        }}
                      >
                        <FaPlus className="h-4 w-4 mr-1" /> Add FAQ
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Add common questions and answers that your AI agent should know
                    </p>
                    
                    {form.watch("faqs").map((_, index) => (
                      <div key={index} className="space-y-2 border p-3 rounded-md text-black dark:text-white">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">FAQ #{index + 1}</h4>
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const currentFaqs = form.getValues("faqs");
                                form.setValue("faqs", currentFaqs.filter((_, i) => i !== index));
                              }}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`faqs.${index}.question`}
                          render={({ field }) => (
                            <FormItem className="text-black dark:text-white">
                              <FormLabel>Question</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. What are your business hours?" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`faqs.${index}.answer`}
                          render={({ field }) => (
                            <FormItem className="text-black dark:text-white">
                              <FormLabel>Answer</FormLabel>
                              <FormControl>
                                <Textarea placeholder="e.g. Our business hours are Monday to Friday, 9am to 5pm." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 border p-4 rounded-lg text-black dark:text-white">
                    <h3 className="text-lg font-medium">Knowledge Base</h3>
                    <p className="text-sm text-muted-foreground">
                      Add information sources for your AI agent to reference during conversations
                    </p>
                    
                    <FormField
                      control={form.control}
                      name="knowledgeBaseUrls"
                      render={({ field }) => (
                        <FormItem className="text-black dark:text-white">
                          <FormLabel>Website URLs to Scrape</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input 
                                placeholder="e.g. https://www.example.com/faqs" 
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <Button 
                              type="button"
                              onClick={() => {
                                const input = document.querySelector('input[placeholder="e.g. https://www.example.com/faqs"]') as HTMLInputElement;
                                if (input && input.value) {
                                  field.onChange([...field.value, input.value]);
                                  input.value = "";
                                }
                              }}
                            >
                              Add
                            </Button>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-black dark:text-white">
                            {field.value.map((url, i) => (
                              <Badge key={i} variant="secondary" className="flex items-center gap-1">
                                {url}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() => {
                                    const newUrls = [...field.value];
                                    newUrls.splice(i, 1);
                                    field.onChange(newUrls);
                                  }}
                                >
                                  <XIcon className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormItem className="text-black dark:text-white">
                      <FormLabel>Upload Files</FormLabel>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <input
                          type="file"
                          id="file-upload"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              const newFiles = Array.from(e.target.files);
                              setUploadedFiles([...uploadedFiles, ...newFiles]);
                            }
                          }}
                          accept=".pdf,.doc,.docx,.txt,.md"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <div className="flex flex-col items-center">
                            <UploadIcon className="h-8 w-8 mb-2 text-muted-foreground" />
                            <p className="text-sm font-medium">
                              Drag & drop files or click to browse
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Supports PDF, Word, and text files (max 1.5MB each)
                            </p>
                          </div>
                        </label>
                      </div>
                      <div className="mt-2">
                        {uploadedFiles.map((file, i) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b">
                            <div className="flex items-center">
                              <FileIcon className="h-4 w-4 mr-2 text-muted-foreground text-black dark:text-white" />
                              <span className="text-sm text-black dark:text-white">{file.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newFiles = [...uploadedFiles];
                                newFiles.splice(i, 1);
                                setUploadedFiles(newFiles);
                              }}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </FormItem>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="enableVoicemailDetection"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 text-black dark:text-white">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base text-black dark:text-white">
                            Voicemail Detection
                            <Badge className="ml-2 text-black dark:text-white bg-amber-500/50 dark:bg-green-800/50 glass-morphism transform transition-transform duration-300 ease-in-out " variant="outline">PRO</Badge>
                          </FormLabel>
                          <p className="text-sm text-muted-foreground text-black dark:text-white">
                            Automatically detect and respond to voicemails (PRO feature only)
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            defaultChecked={false}
                            checked={field.value && props.userDetails?.subscription_tier === "pro"}
                            onCheckedChange={field.onChange}
                            disabled={props.userDetails?.subscription_tier !== "pro"}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="button" 
                    onClick={() => setActiveTab("voice")}
                    className="w-full"
                  >
                    Next: Voice & Personality
                  </Button>
                </TabsContent>
                
                <TabsContent value="voice" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="voiceId"
                    render={({ field }) => (
                      <FormItem className="text-black dark:text-white">
                        <FormLabel className="text-3xl font-bold">Choose Your AI Employee's Voice</FormLabel>
                        <p className="text-muted-foreground text-md">
                          Choose a voice that matches the personality of your agent. <br />Choosing a voice that fits your brand will help you build a strong relationship with your customers.
                        </p>
                        <Divider className="my-4" />
                        
                        {/* Default Voices - Open by default */}
                        <div className="py-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                              {voices
                                .filter((voice: any) => 
                                  voice.provider === "elevenlabs" && 
                                  voice.voice_id && 
                                  !voice.voice_id.startsWith("custom_voice_") && 
                                  !voice.voice_id.startsWith("custom-") && 
                                  !(voice.voice_avatar_url && voice.voice_avatar_url.includes("customvoice-icon.png"))
                                )
                                .map((voice: any) => (
                                  <div 
                                    key={voice.voice_id}
                                    className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all ${field.value === voice.voice_id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                                    onClick={() => field.onChange(voice.voice_id)}
                                  >
                                    <Avatar className="h-16 w-16 mb-2">
                                      {voice.avatar_url ? (
                                        <img src={voice.avatar_url} alt={voice.voice_name} className="h-full w-full object-cover" />
                                      ) : (
                                        <div className="bg-muted h-full w-full flex items-center justify-center text-lg font-semibold">
                                          {voice.voice_name?.charAt(0) || "?"}
                                        </div>
                                      )}
                                    </Avatar>
                                    <span className="text-sm font-medium text-center">{voice.voice_name}</span>
                                    <span className="text-xs text-muted-foreground">{voice.gender || "Voice"}</span>
                                    {voice.preview_audio_url && (
                                      <audio 
                                        className="mt-2 w-full h-6" 
                                        src={voice.preview_audio_url} 
                                        controls 
                                      />
                                    )}
                                  </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Custom Voices (Pro Members) - Collapsed by default --- {props.userDetails?.subscription_tier === "pro" && (*/}
                        <div className="py-4">
                          <details open={false}>
                            <summary className="text-md font-semibold mb-2 cursor-pointer hover:text-primary">
                              Custom Voices
                              <Badge className="ml-2 text-black dark:text-white bg-amber-500/50 dark:bg-green-800/50 glass-morphism transform transition-transform duration-300 ease-in-out " variant="outline">PRO</Badge>
                            </summary>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                              {voices
                                .filter((voice: any) => voice.provider === "elevenlabs" && voice.voice_id && (voice.voice_id.startsWith("custom_voice_") || voice.voice_id.startsWith("custom-") || (voice.voice_avatar_url && voice.voice_avatar_url.includes("customvoice-icon.png"))))
                                .map((voice: any) => (
                                  <div 
                                    key={voice.voice_id}
                                    className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                                      field.value === voice.voice_id 
                                        ? 'border-primary bg-primary/10' 
                                        : 'border-border hover:border-primary/50'
                                    } ${
                                      props.userDetails?.subscription_tier !== "pro" 
                                        ? 'opacity-70 cursor-not-allowed' 
                                        : 'cursor-pointer'
                                    }`}
                                    onClick={() => {
                                      if (props.userDetails?.subscription_tier === "pro") {
                                        field.onChange(voice.voice_id);
                                      }
                                    }}
                                  >
                                    <Avatar className="h-16 w-16 mb-2">
                                      {voice.avatar_url ? (
                                        <img src={voice.avatar_url} alt={voice.voice_name} className="h-full w-full object-cover" />
                                      ) : (
                                        <div className="bg-muted h-full w-full flex items-center justify-center text-lg font-semibold text-black dark:text-white">
                                          {voice.voice_name?.charAt(0) || "?"}
                                        </div>
                                      )}
                                    </Avatar>
                                    <span className="text-sm font-medium text-center text-black dark:text-white">{voice.voice_name}</span>
                                    <span className="text-xs text-muted-foreground text-black dark:text-white">{voice.gender || "Voice"}</span>
                                    {voice.preview_audio_url && (
                                      <audio 
                                        className="mt-2 w-full h-6" 
                                        src={voice.preview_audio_url} 
                                        controls 
                                      />
                                    )}
                                  </div>
                                ))}
                            </div>
                          </details>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="voiceModel"
                    render={({ field }) => (
                      <FormItem className="text-black dark:text-white">
                        <hr className="pb-8 text-black dark:text-white" />
                        <FormLabel className="text-3xl font-bold">Voice Settings</FormLabel>
                        <p className="text-muted-foreground text-md">
                          Choose the quality of your AI Employee's voice processing.
                        </p>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select voice quality" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {voiceModels.map((model) => (
                              <SelectItem key={model.id} value={model.id} className="text-black dark:text-white">
                                {model.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="voiceSpeed"
                      render={({ field }) => (
                        <FormItem className="text-black dark:text-white">
                          <FormLabel>Speaking Speed: {field.value.toFixed(2)}x</FormLabel>
                          <FormControl>
                            <Slider
                              min={0.5}
                              max={2}
                              step={0.01}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="voiceTemperature"
                      render={({ field }) => (
                        <FormItem className="text-black dark:text-white">
                          <FormLabel>Expressiveness: {(field.value * 100).toFixed(0)}%</FormLabel>
                          <FormControl>
                            <Slider
                              min={0}
                              max={1}
                              step={0.01}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="ambientSound"
                    render={({ field }) => (
                      <FormItem className="text-black dark:text-white">
                        <FormLabel>Background Environment</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                          <div 
                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${field.value === "" ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                            onClick={() => field.onChange("")}
                          >
                            <span className="text-xl mr-2">🔇</span>
                            <span className="text-sm font-medium">None</span>
                          </div>
                          {ambientSounds.map((sound) => (
                            <div 
                              key={sound.id}
                              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${field.value === sound.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                              onClick={() => field.onChange(sound.id)}
                            >
                              <span className="text-xl mr-2">{sound.icon}</span>
                              <span className="text-sm font-medium">{sound.name}</span>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab("basic")}
                      variant="outline"
                    >
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab("brain")}
                    >
                      Next: AI Brain
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="brain" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="llmModel"
                    render={({ field }) => (
                      <FormItem className="text-black dark:text-white">
                        <FormLabel>AI Brain Type</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          {llmModels.map((model) => (
                            <div 
                              key={model.id}
                              className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${field.value === model.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                              onClick={() => field.onChange(model.id)}
                            >
                              <div>
                                <p className="font-medium">{model.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {model.id === 'gpt-4o' && "Most popular for every-day tasks"}
                                  {model.id === 'gpt-4o-mini' && "Smaller and faster, good for simple tasks"}
                                  {model.id === 'claude-3.5-sonnet' && "Best Choice for Voice Agents with a human-like tone"}
                                  {model.id === 'claude-3.7 (coming soon)' && "Best Choice for complex tasks and multi-step conversations (COMING SOON!)"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="llmTemperature"
                    render={({ field }) => (
                      <FormItem className="text-black dark:text-white">
                        <FormLabel>Creativity Level: {(field.value * 100).toFixed(0)}%</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={1}
                            step={0.01}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          {field.value < 0.3 ? "Lower values make responses more focused and predictable" : 
                           field.value > 0.7 ? "Higher values make responses more creative and varied" :
                           "Balanced between focus and creativity"}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="generalPrompt"
                    render={({ field }) => (
                      <FormItem className="text-black dark:text-white">
                        <FormLabel>Agent Instructions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe how your agent should behave, what knowledge it should have, and how it should respond..."
                            className="h-32"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          Be specific about your agent's personality, knowledge, and how it should handle different situations.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab("voice")}
                      variant="outline"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isLoading}
                      className="font-semibold bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isLoading ? "Creating..." : "Create Voice Agent"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default NewVoiceAgentRT
