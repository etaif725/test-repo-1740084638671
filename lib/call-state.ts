import { create } from 'zustand'
import Retell from 'retell-sdk'

export type CallState = 'idle' | 'connecting' | 'active' | 'error'

// Constants for timeouts and retries
const CALL_TIMEOUT_MS = 10000 // 10 seconds
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 1000 // 1 second

interface CallStateStore {
  // State
  state: CallState
  currentCallId: string | null
  error: Error | null
  activeButtonId: string | null
  client: Retell | null
  muted: boolean

  // Actions
  initiateCall: (
    buttonId: string,
    systemPrompt: string,
    context: { assistantName: string; companyName: string }
  ) => Promise<void>
  endCall: (buttonId: string) => Promise<void>
  handleError: (error: Error) => void
  resetState: () => void
  setMuted: (muted: boolean) => void
}

export const useCallState = create<CallStateStore>((set, get) => ({
  // Initial state
  state: 'idle',
  currentCallId: null,
  error: null,
  activeButtonId: null,
  client: null,
  muted: false,

  // Actions
  initiateCall: async (buttonId, systemPrompt, context) => {
    const { state, activeButtonId, client } = get()

    // Validate state
    if (state !== 'idle' && state !== 'error') {
      throw new Error('Cannot start a new call while another call is in progress')
    }
    if (state === 'error' && activeButtonId !== buttonId) {
      throw new Error('Only the button that encountered an error can retry')
    }

    let retryCount = 0
    let lastError: Error | null = null

    while (retryCount <= MAX_RETRIES) {
      try {
        // Update state to connecting
        set({ state: 'connecting', activeButtonId: buttonId, error: null })

        // Clean up existing client if any
        if (client) {
          await get().endCall(buttonId)
        }

        // Create new client using Retell SDK
        const newClient = new Retell({
          apiKey: process.env.RETELL_API_KEY!,
          baseURL: 'https://api.retell.ai'
        })
        set({ client: newClient })

        // Set up call timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Call initialization timed out')), CALL_TIMEOUT_MS)
        })

        // Create Retell LLM agent
        const llmResponse = await Promise.race([
          newClient.llm.create({
            model: 'gpt-4o',
            model_temperature: 0.7,
            general_prompt: systemPrompt,
            begin_message: `Hi, this is ${context.assistantName} from ${context.companyName}, is this the owner?`,
          }),
          timeoutPromise
        ])

        // Create web call with the LLM agent
        const callResponse = await Promise.race([
          newClient.call.createWebCall({
            agent_id: (llmResponse as any).llm_id?.toString() || '',
            metadata: {
              companyName: context.companyName
            }
          }),
          timeoutPromise
        ])

        set({ 
          state: 'active',
          currentCallId: (callResponse as any)?.call_id?.toString() || ''
        })
        return

      } catch (error) {
        lastError = error as Error
        retryCount++

        if (retryCount <= MAX_RETRIES) {
          // Clean up and wait before retry
          await get().resetState()
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
        }
      }
    }

    // All retries failed
    get().handleError(lastError || new Error('Failed to start call after retries'))
  },

  endCall: async (buttonId) => {
    const { state, activeButtonId, client, currentCallId } = get()

    if (state === 'idle') {
      return
    }

    if (activeButtonId !== buttonId) {
      throw new Error('Only the active button can end the call')
    }

    try {
      if (client && currentCallId) {
        await client.call.delete(currentCallId)
      }
    } catch (error) {
      console.error('Error stopping call:', error)
    } finally {
      get().resetState()
    }
  },

  handleError: (error: Error) => {
    set({ state: 'error', error })
  },

  resetState: () => {
    const { client, currentCallId } = get()
    
    // Clean up client if it exists
    if (client && currentCallId) {
      try {
        client.call.delete(currentCallId)
      } catch (error) {
        console.error('Error cleaning up client:', error)
      }
    }

    set({
      state: 'idle', 
      currentCallId: null,
      error: null,
      activeButtonId: null,
      client: null
    })
  },

  setMuted: (muted: boolean) => {
    const { client, currentCallId } = get()
    if (client && currentCallId) {
      // TODO: Implement mute functionality when available in Retell client
    }
    set({ muted })
  }
}))
