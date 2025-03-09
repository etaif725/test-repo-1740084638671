import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import retellServices from '@/services/retellServices';
import { supabaseRetellService } from '@/services/supabaseRetellService';
import { Database } from '@/types/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    
    if (!action) {
      return NextResponse.json({ error: 'Missing action parameter' }, { status: 400 });
    }
    
    // Handle different actions
    switch (action) {
      case 'getAgents': {
        const agents = await supabaseRetellService.getRetellAgents(user.id);
        return NextResponse.json({ agents });
      }
      
      case 'getCalls': {
        const date = searchParams.get('date') || 'all';
        const agentId = searchParams.get('agentId') || 'all';
        
        // If specific filters are applied, get from API
        if (date !== 'all' || agentId !== 'all') {
          const callsResponse = await retellServices.listCalls(date, agentId);
          
          // Save calls to database
          await Promise.all(
            callsResponse.map(call => 
              supabaseRetellService.saveRetellCall(call, user.id)
            )
          );
          
          return NextResponse.json({ calls: callsResponse });
        }
        
        // Otherwise get from database
        const calls = await supabaseRetellService.getRetellCalls(user.id);
        return NextResponse.json({ calls });
      }
      
      case 'getCall': {
        const callId = searchParams.get('callId');
        if (!callId) {
          return NextResponse.json({ error: 'Missing callId parameter' }, { status: 400 });
        }
        
        // Try to get from database first
        try {
          const call = await supabaseRetellService.getRetellCallById(callId);
          return NextResponse.json({ call });
        } catch (error) {
          // If not in database, get from API
          const call = await retellServices.getCall(callId);
          await supabaseRetellService.saveRetellCall(call, user.id);
          return NextResponse.json({ call });
        }
      }
      
      case 'getTranscript': {
        const callId = searchParams.get('callId');
        if (!callId) {
          return NextResponse.json({ error: 'Missing callId parameter' }, { status: 400 });
        }
        
        const transcript = await retellServices.getCallTranscript(callId);
        return NextResponse.json({ transcript });
      }
      
      case 'syncAgents': {
        const agents = await retellServices.getAgents();
        
        // Save agents to database
        await Promise.all(
          agents.map(agent => supabaseRetellService.saveRetellAgent(agent, user.id))
        );
        
        return NextResponse.json({ agents });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { action } = body;
    
    if (!action) {
      return NextResponse.json({ error: 'Missing action parameter' }, { status: 400 });
    }
    
    // Handle different actions
    switch (action) {
      case 'createAgent': {
        const { agentData } = body;
        if (!agentData) {
          return NextResponse.json({ error: 'Missing agentData' }, { status: 400 });
        }
        
        // Create agent in Retell
        const agent = await retellServices.createAgent(agentData);
        
        // Save to database
        await supabaseRetellService.saveRetellAgent(agent, user.id);
        
        return NextResponse.json({ agent });
      }
      
      case 'updateAgent': {
        const { agentId, agentData } = body;
        if (!agentId || !agentData) {
          return NextResponse.json({ error: 'Missing agentId or agentData' }, { status: 400 });
        }
        
        // Update agent in Retell
        const agent = await retellServices.updateAgent(agentId, agentData);
        
        // Save to database
        await supabaseRetellService.saveRetellAgent(agent, user.id);
        
        return NextResponse.json({ agent });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 