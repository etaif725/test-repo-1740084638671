"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout"
import { User } from "@supabase/supabase-js"
import { useTheme } from "next-themes"
import { createClient } from '@supabase/supabase-js'
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/ui/combobox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "@/hooks/use-toast"
import { vapiService } from "@/TEMP/vapiService"
import { Agent } from "@/types/vapi"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const STORAGE_KEY = "voice-agent-form"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Sample voice profiles - replace with actual data from your API
const voiceProfiles = [
  { id: "voice1", name: "Rachel", avatar: "/voices/rachel.png", voiceId: "21m00Tcm4TlvDq8ikWAM" },
  { id: "voice2", name: "Michael", avatar: "/voices/michael.png", voiceId: "AZnzlk1XvdvUeBnXmlld" },
  { id: "voice3", name: "Sarah", avatar: "/voices/sarah.png", voiceId: "EXAVITQu4vr4xnSDxMaL" },
  // Add more voice profiles
]

const formSchema = z.object({
  name: z.string().min(1, "Agent name is required"),
  voiceId: z.string().min(1, "Voice ID is required"),
  voiceModel: z.string().min(1, "Voice model is required"),
  voiceStability: z.number().min(0).max(1),
  voiceSimilarityBoost: z.number().min(0).max(1), 
  voiceStyle: z.number().min(0).max(1),
  voiceProvider: z.string(),
  modelProvider: z.string(),
  modelName: z.string(),
  modelMaxTokens: z.number(),
  modelTemperature: z.number().min(0).max(1),
  transcriberProvider: z.string(),
  transcriberModel: z.string(),
  transcriberLanguage: z.string(),
  firstMessage: z.string().min(1, "First message is required"),
  endCallMessage: z.string(),
  maxDurationSeconds: z.number().min(60).max(7200),
  backgroundSound: z.string(),
  serverUrl: z.string().url().optional(),
  hipaaEnabled: z.boolean(),
  backchannelingEnabled: z.boolean(),
  pciEnabled: z.boolean(),
  recordingEnabled: z.boolean(),
  videoRecordingEnabled: z.boolean(),
  pcapEnabled: z.boolean(),
  pcapS3PathPrefix: z.string(),
  assistantName: z.string(),
  userName: z.string(),
  idleTimeoutSeconds: z.number(),
  silenceTimeoutMessage: z.string(),
  acknowledgementPhrases: z.array(z.string()),
  interruptionPhrases: z.array(z.string()),
  listenEnabled: z.boolean(),
  controlEnabled: z.boolean(),
  disablePartialTranscripts: z.boolean(),
  endUtteranceSilenceThreshold: z.number(),
  wordBoost: z.array(z.string()),
  emotionRecognitionEnabled: z.boolean(),
  knowledgeBaseId: z.string().optional(),
  numFastTurns: z.number(),
  toolIds: z.array(z.string()),
  speed: z.number(),
  backgroundDenoisingEnabled: z.boolean(),
  modelOutputInMessagesEnabled: z.boolean()
})

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

export function NewVoiceAgentVP(props: Props) {
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<string>("")

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      voiceId: "",
      voiceModel: "eleven_turbo_v2_5",
      voiceStability: 0.4,
      voiceSimilarityBoost: 0.7,
      voiceStyle: 0.2,
      voiceProvider: "11labs",
      modelProvider: "anthropic",
      modelName: "claude-3-5-sonnet-20241022",
      modelMaxTokens: 300,
      modelTemperature: 0.7,
      transcriberProvider: "deepgram",
      transcriberModel: "nova-3-general", 
      transcriberLanguage: "en",
      firstMessage: "Hello! How can I help you today?",
      endCallMessage: "Have a great rest of your day! Goodbye.",
      maxDurationSeconds: 600,
      backgroundSound: "off",
      serverUrl: "",
      hipaaEnabled: false,
      backchannelingEnabled: true,
      pciEnabled: false,
      recordingEnabled: true,
      videoRecordingEnabled: false,
      pcapEnabled: true,
      pcapS3PathPrefix: "/pcaps",
      assistantName: "AI Assistant",
      userName: "User",
      idleTimeoutSeconds: 30,
      silenceTimeoutMessage: "I haven't heard from you in a while. Are you still there?",
      acknowledgementPhrases: ["I understand", "I see", "Got it"],
      interruptionPhrases: ["stop", "wait", "hold on"],
      listenEnabled: false,
      controlEnabled: false,
      disablePartialTranscripts: true,
      endUtteranceSilenceThreshold: 1.1,
      wordBoost: [],
      emotionRecognitionEnabled: true,
      knowledgeBaseId: "",
      numFastTurns: 1,
      toolIds: [],
      speed: 1.0,
      backgroundDenoisingEnabled: false,
      modelOutputInMessagesEnabled: false
    }
  })

  useEffect(() => {
    setMounted(true)
    
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      form.reset(parsedData)
      setSelectedVoice(parsedData.voiceId)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      const values = form.getValues()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
    }
  }, [form.watch()])

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId)
    form.setValue("voiceId", voiceId)
  }

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      const agentData = {
        name: values.name,
        voice: {
          model: values.voiceModel,
          voiceId: values.voiceId,
          provider: values.voiceProvider,
          stability: values.voiceStability,
          similarityBoost: values.voiceSimilarityBoost,
          style: values.voiceStyle,
          useSpeakerBoost: true,
          optimizeStreamingLatency: 2
        },
        model: {
          provider: values.modelProvider,
          model: values.modelName,
          maxTokens: values.modelMaxTokens,
          temperature: values.modelTemperature,
          emotionRecognitionEnabled: values.emotionRecognitionEnabled
        },
        transcriber: {
          provider: values.transcriberProvider,
          model: values.transcriberModel,
          language: values.transcriberLanguage
        },
        firstMessage: values.firstMessage,
        endCallMessage: values.endCallMessage,
        maxDurationSeconds: values.maxDurationSeconds,
        backgroundSound: values.backgroundSound,
        serverUrl: values.serverUrl,
        hipaaEnabled: values.hipaaEnabled,
        backchannelingEnabled: values.backchannelingEnabled,
        pciEnabled: values.pciEnabled,
        recordingEnabled: values.recordingEnabled,
        videoRecordingEnabled: values.videoRecordingEnabled,
        pcapEnabled: values.pcapEnabled,
        pcapS3PathPrefix: values.pcapS3PathPrefix,
        assistantName: values.assistantName,
        userName: values.userName,
        idleTimeoutSeconds: values.idleTimeoutSeconds,
        silenceTimeoutMessage: values.silenceTimeoutMessage,
        acknowledgementPhrases: values.acknowledgementPhrases,
        interruptionPhrases: values.interruptionPhrases,
        listenEnabled: values.listenEnabled,
        controlEnabled: values.controlEnabled,
        disablePartialTranscripts: values.disablePartialTranscripts,
        endUtteranceSilenceThreshold: values.endUtteranceSilenceThreshold,
        wordBoost: values.wordBoost,
        knowledgeBaseId: values.knowledgeBaseId,
        numFastTurns: values.numFastTurns,
        toolIds: values.toolIds,
        speed: values.speed,
        backgroundDenoisingEnabled: values.backgroundDenoisingEnabled,
        modelOutputInMessagesEnabled: values.modelOutputInMessagesEnabled,
        startSpeakingPlan: {
          waitSeconds: 0.1,
          smartEndpointingEnabled: true
        },
        stopSpeakingPlan: {
          numWords: 2,
          voiceSeconds: 0.1,
          backoffSeconds: 2
        }
      }

      const response = await vapiService.createAgent(agentData as unknown as Partial<Agent>)
      
      await supabase.from('voice_agents').insert([{
        user_id: props.user?.id,
        agent_id: response.id,
        config: agentData
      }])

      toast({
        title: "Success",
        description: "Voice agent created successfully"
      })

      localStorage.removeItem(STORAGE_KEY)

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
      user={props.user}
      userDetails={props.userDetails}
      title="New Voice Agent"
      description="Create a new AI voice agent"
    >
      <div className="max-w-full mx-auto">
        <Card className="p-8 w-full h-full bg-white dark:bg-zinc-950 text-black dark:text-white">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Basic Information</h2>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter agent name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="voiceModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voice Model</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select voice model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="eleven_turbo_v2_5">Eleven Labs Turbo v2.5</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="modelProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Provider</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select model provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anthropic">Anthropic</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="modelName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Name</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="claude-3-5-sonnet-20241022">Claude 3 Sonnet</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transcriberProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transcriber Provider</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transcriber provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deepgram">Deepgram</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transcriberModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transcriber Model</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transcriber model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nova-3-general">Nova 3 General</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transcriberLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transcriber Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <Label>Select Voice Profile</Label>
                  <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                    <div className="flex w-max space-x-4 p-4">
                      {voiceProfiles.map((voice) => (
                        <div
                          key={voice.id}
                          className={cn(
                            "flex flex-col items-center space-y-2 cursor-pointer p-2 rounded-lg",
                            selectedVoice === voice.voiceId ? "bg-blue-100 dark:bg-blue-900" : ""
                          )}
                          onClick={() => handleVoiceSelect(voice.voiceId)}
                        >
                          <Avatar className="h-20 w-20">
                            <AvatarImage src={voice.avatar} alt={voice.name} />
                            <AvatarFallback>{voice.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{voice.name}</span>
                        </div>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mt-8">Voice Settings</h2>
                  <FormField
                    control={form.control}
                    name="voiceStability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voice Stability</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={1}
                            step={0.1}
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
                    name="voiceSimilarityBoost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voice Similarity Boost</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={1}
                            step={0.1}
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
                    name="voiceStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voice Style</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={1}
                            step={0.1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mt-8">Model Settings</h2>
                  <FormField
                    control={form.control}
                    name="modelMaxTokens"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Tokens</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="modelTemperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperature</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={1}
                            step={0.1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mt-8">Conversation Settings</h2>
                  <FormField
                    control={form.control}
                    name="firstMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Message</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter the first message your agent will say" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endCallMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Call Message</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter the message your agent will say before ending the call" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxDurationSeconds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Call Duration (seconds)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="backgroundSound"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Background Sound</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select background sound" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="off">Off</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mt-8">Advanced Settings</h2>
                  <FormField
                    control={form.control}
                    name="hipaaEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>HIPAA Compliance</FormLabel>
                          <p className="text-sm text-gray-500">Enable HIPAA compliance for healthcare use cases</p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="backchannelingEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Backchanneling</FormLabel>
                          <p className="text-sm text-gray-500">Enable natural conversation acknowledgments</p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serverUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Webhook URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Used for Zapier/Make.com/Custom Servers. This sends custom data (post-call only) for further workflow automations." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full font-semibold bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? "Creating..." : "Create Voice Agent"}
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default NewVoiceAgentVP