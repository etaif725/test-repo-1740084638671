"use client"

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, PhoneCall, MessageSquare, Calendar, Settings, Users, HeadphonesIcon, PlusCircle, CheckCircle, Link } from 'lucide-react';
import DashboardLayout from '@/components/layout';
import { User } from '@supabase/supabase-js';
import { Paper, Typography, Grid, Box, Card, Avatar, Button } from '@mui/material';
import { Agent } from '@/types/retell';
import retellServices from '@/services/retellServices';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

const StatCard = ({ title, value, subvalue, icon, color, className }: {
  title: string;
  value: string | number;
  subvalue?: string;
  icon: React.ReactNode;
  color: string;
  className?: string;
}) => (
  <Paper
    className={className}
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      bgcolor: `${color}.main`,
      color: 'inherit',
      '& .MuiSvgIcon-root': {
        color: 'inherit',
      }
    }}
  >
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      mb: 1,
      '& .MuiTypography-root': {
        color: 'inherit',
        opacity: 0.9
      }
    }}>
      {icon}
      <Typography 
        variant="h6" 
        component="div" 
        sx={{ ml: 1 }}
        className='text-black dark:text-white'
      >
        {title}
      </Typography>
    </Box>
    <Typography 
      variant="h4" 
      component="div" 
      sx={{ 
        fontWeight: 'bold',
        color: 'inherit'
      }}
      className='text-black dark:text-white'
    >
      {value}
    </Typography>
    {subvalue && (
      <Typography 
        variant="subtitle1" 
        component="div" 
        sx={{ 
          color: 'inherit',
          opacity: 0.9,
          mt: 0.5
        }}
        className='text-black dark:text-white'
      >
        {subvalue}
      </Typography>
    )}
  </Paper>
);

export default function AIEmployeesDashboardRT(props: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [userAgents, setUserAgents] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalCalls: 0,
    successRate: '0',
    status: ''
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch additional agent details from Retell API
        let retellAgents: Agent[] = [];
        try {
          retellAgents = await retellServices.getAgents();
          setAgents(retellAgents);
          
          // Since we can't access the database tables directly due to permissions,
          // we'll use the data from the Retell API only
          const enrichedAgents = retellAgents.map(agent => {
            return {
              ...agent,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              name: agent.agent_name || agent.agent_id.substring(0, 8),
              id: agent.agent_id,
              totalCalls: 0,
              successfulCalls: 0,
              status: 'active'
            };
          }) || [];
          
          setUserAgents(enrichedAgents);
          
          // Set default stats since we can't access call data
          setStats({
            totalAgents: enrichedAgents.length,
            activeAgents: enrichedAgents.length,
            totalCalls: 0,
            successRate: '0',
            status: 'success'
          });
          
        } catch (retellError) {
          console.error('Error fetching agents from Retell API:', retellError);
          setError('Failed to load agents data from Retell API');
          setAgents([]);
          setUserAgents([]);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load agents and call data');
        setAgents([]);
        setUserAgents([]);
        setCalls([]);
      } finally {
        setLoading(false);
      }
    };

    if (props.user?.id) {
      fetchData();
    }
  }, [props.user?.id]);

  if (loading) {
    return (
      <DashboardLayout
        user={props.user}
        userDetails={props.userDetails}
        title="AI Employees"
        description="Your virtual workforce powered by DialWise AI"
      >
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!userAgents.length || !props.user) {
    return (
      <DashboardLayout
        user={props.user}
        userDetails={props.userDetails}
        title="AI Employees"
        description="Your virtual workforce powered by DialWise AI"
      >
        <div className="relative flex flex-col min-w-0 break-words border border-zinc-200 dark:border-zinc-700 bg-gradient-to-b from-gray-100/60 to-gray-200/90 dark:from-zinc-800/60 dark:to-zinc-800/60 transition-all duration-300 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Welcome to AI Employees!</h2>
          <p className="text-lg text-black dark:text-white opacity-80 mb-6">
            Get started by creating your first AI agent to help with sales, customer success, or support. <br />
            Click the button below to create your first AI agent, or select a template to get started.
          </p>
          <Button href={`/dashboard/${props.user?.id}/ai-employees/voice-agents/create/`} aria-label="Create Your First Voice Agent" className="mx-auto px-8 py-3 text-md font-bold leading-normal text-center text-white bg-gradient-to-tl from-green-500 to-zinc-800 align-middle transition-all ease-in border border-green-800 rounded-lg cursor-pointer hover:opacity-75">
            Create Your First Voice Agent →
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="AI Employees"
      description="Your virtual workforce powered by DialWise AI"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white">Your AI Employees</h2>
        <Button href={`/dashboard/${props.user?.id}/ai-employees/voice-agents/create/`} aria-label="Create New Voice Agent" className="px-4 py-2 text-md font-medium text-white bg-gradient-to-tl from-green-500 to-zinc-800 align-middle transition-all ease-in border border-green-800 rounded-lg cursor-pointer hover:opacity-75">
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Agent
        </Button>
      </div>
      
      <Grid container spacing={3} className="pt-4 text-black dark:text-white">
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total AI Employees"
            subvalue={`${stats.totalAgents} AI Voice Agents`}
            value={stats.totalAgents}
            icon={<Users className="h-5 w-5" />}
            color="inherit"
            className="shadow-md shadow-blue-800/25 hover:shadow-lg hover:shadow-blue-500/40 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-gradient-to-b from-gray-100/60 to-gray-200/90 dark:from-black/60 dark:to-black/90 dark:group-hover:from-black/70 dark:group-hover:to-black/95 transition-all duration-300"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active AI Voice Agents"
            value={stats.activeAgents}
            subvalue={`${stats.activeAgents} out of ${stats.totalAgents}`}
            icon={<HeadphonesIcon className="h-5 w-5" />}
            color="inherit"
            className="shadow-md shadow-green-500/25 hover:shadow-lg hover:shadow-green-500/40 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-gradient-to-b from-gray-100/60 to-gray-200/90 dark:from-black/60 dark:to-black/90 dark:group-hover:from-black/70 dark:group-hover:to-black/95 transition-all duration-300"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Calls"
            value={stats.totalCalls}
            subvalue="Last 30 days"
            icon={<PhoneCall className="h-5 w-5" />}
            color="inherit"
            className="shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/40 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-gradient-to-b from-gray-100/60 to-gray-200/90 dark:from-black/60 dark:to-black/90 dark:group-hover:from-black/70 dark:group-hover:to-black/95 transition-all duration-300"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            subvalue="Successful calls"
            icon={<CheckCircle className="h-5 w-5" />}
            color="inherit"
            className="shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/40 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-gradient-to-b from-gray-100/60 to-gray-200/90 dark:from-black/60 dark:to-black/90 dark:group-hover:from-black/70 dark:group-hover:to-black/95 transition-all duration-300"
          />
        </Grid>
      </Grid>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {userAgents.map((agent) => (
          <div
            key={agent.id}
            className="relative group overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700 bg-gradient-to-b from-gray-100/60 to-gray-200/90 dark:from-black/60 dark:to-black/90 hover:shadow-lg transition-all duration-300"
          >
            <div className="relative p-6 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-4">
                <Avatar
                  alt={agent.name}
                  className="w-16 h-16 border-2 border-zinc-200 dark:border-zinc-700"
                  src={agent.avatar_url || ""}
                >
                  {agent.name?.charAt(0)}
                </Avatar>
                <div>
                  <h3 className="font-semibold text-xl text-black dark:text-white">{agent.name}</h3>
                  <div className="flex items-center mt-1">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${agent.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                    <p className="text-zinc-600 dark:text-zinc-400">{agent.status === 'active' ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>
              
              <div className="text-zinc-600 dark:text-zinc-400 text-sm space-y-2">
                <p><strong>Voice:</strong> {agent.voice_id || "Standard"}</p>
                <p><strong>LLM:</strong> {agent.configuration?.llm_model || "GPT-4o"}</p>
                <p><strong>Created:</strong> {new Date(agent.createdAt).toLocaleDateString()}</p>
                <p><strong>Total Calls:</strong> {agent.totalCalls || 0}</p>
                <p><strong>Success Rate:</strong> {agent.totalCalls ? ((agent.successfulCalls / agent.totalCalls) * 100).toFixed(1) + '%' : 'N/A'}</p>
              </div>

              <div className="mt-auto pt-6 flex gap-2">
                <Button 
                  href={`/dashboard/${props.user?.id}/ai-employees/${agent.id}`}
                  className="flex-1 px-4 py-2 text-center rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  View Details
                </Button>
                <Button 
                  href={`/dashboard/${props.user?.id}/ai-employees/${agent.id}/edit`}
                  className="flex-1 px-4 py-2 text-center rounded-lg text-sm font-medium text-blue-600 border border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  Edit
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}