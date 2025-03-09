import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/types_db'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
if (!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) throw new Error('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY is required')

// Create a single supabase service client for server-side operations
let supabaseServiceClient: ReturnType<typeof createClient<Database>> | null = null

// Use a function to get the client to ensure it's only created once
const getServiceClient = () => {
  if (supabaseServiceClient === null) {
    supabaseServiceClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }
  return supabaseServiceClient
}

// Export a function that returns the service client to avoid multiple instances
export const supabaseService = getServiceClient()

// Export the function to create a service client for external use
export const createServiceClient = getServiceClient

// For services that need to use the client
export const supabaseServiceFunctions = {
  async getUserData(userId: string) {
    const client = getServiceClient()
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async updateUserCredits(userId: string, credits: number) {
    const client = getServiceClient()
    const { data, error } = await client
      .from('users')
      .update({ credits })
      .eq('id', userId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
}