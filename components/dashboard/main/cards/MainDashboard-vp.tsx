"use client";

import React, { useEffect, useState, useRef } from 'react';
import { format, isValid, parseISO, differenceInSeconds } from 'date-fns';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Divider,
  Drawer,
  Stack,
  Button,
} from '@mui/material';
import {
  Refresh,
  Phone as PhoneIcon,
  PhoneMissed as PhoneMissedIcon,
  Timer as TimerIcon,
  Close as CloseIcon,
  CreditCardTwoTone,
  ArrowDownward,
  ArrowUpward
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { MdChevronRight } from 'react-icons/md';
import { MdChevronLeft } from 'react-icons/md';
import { BsThreeDots } from 'react-icons/bs';
import { PhoneIncoming, PhoneOutgoing, CalendarIcon, BarChart, CalendarCheck2Icon, Clock, CalendarXIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Grid from '@mui/material/Grid';
import { useAuth } from '@/hooks/use-auth';
import { useRetell } from '@/hooks/use-retell';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Define types based on our actual database structure
type Call = {
  id: string;
  call_id: string;
  agent_id: string;
  call_status: string;
  call_type: string;
  start_timestamp: number;
  end_timestamp?: number;
  duration_seconds?: number;
  call_cost?: number;
  recording_url?: string;
  transcript?: string;
  metadata: {
    customer_number?: string;
  };
  disconnection_reason?: string;
};

type SortConfig = {
  key: keyof Call;
  direction: 'asc' | 'desc';
};

export const MainDashboardCallHistory = () => {
  const { user, userDetails } = useAuth();
  const supabase = createClientComponentClient();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredCalls, setFilteredCalls] = useState<Call[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [showOnlyRecorded, setShowOnlyRecorded] = useState(false);
  const [hideNoAnswer, setHideNoAnswer] = useState(false);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'start_timestamp', direction: 'desc' });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [callTranscript, setCallTranscript] = useState<string | null>(null);

  const fetchCalls = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('voice_agents_vp_calls')
        .select('*')
        .eq('user_id', user.id)
        .order('start_timestamp', { ascending: false });
      
      if (startDate) {
        const startTimestamp = startDate.startOf('day').unix() * 1000;
        query = query.gte('start_timestamp', startTimestamp);
      }
      
      if (endDate) {
        const endTimestamp = endDate.endOf('day').unix() * 1000;
        query = query.lte('start_timestamp', endTimestamp);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      setCalls(data || []);
    } catch (error) {
      console.error('Error fetching calls:', error);
      setError('Error loading calls. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTranscript = async (callId: string) => {
    if (!user) return;
    
    try {
      setIsLoadingTranscript(true);
      
      const { data, error } = await supabase
        .from('voice_agents_vp_calls')
        .select('transcript')
        .eq('call_id', callId)
        .single();
      
      if (error) throw error;
      
      setCallTranscript(data?.transcript || null);
    } catch (error) {
      console.error('Error fetching transcript:', error);
      setCallTranscript(null);
    } finally {
      setIsLoadingTranscript(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCalls();
    }
  }, [user]);

  useEffect(() => {
    setFilteredCalls(calls);
  }, [calls]);

  useEffect(() => {
    filterCalls();
  }, [startDate, endDate, showOnlyRecorded, hideNoAnswer, calls]);

  useEffect(() => {
    if (selectedCall?.call_id) {
      fetchTranscript(selectedCall.call_id);
    }
  }, [selectedCall]);

  const filterCalls = () => {
    let filtered = [...calls];

    if (startDate) {
      filtered = filtered.filter(call => 
        dayjs.unix(call.start_timestamp / 1000).isAfter(startDate.startOf('day'))
      );
    }

    if (endDate) {
      filtered = filtered.filter(call => 
        dayjs.unix(call.start_timestamp / 1000).isBefore(endDate.endOf('day'))
      );
    }

    if (showOnlyRecorded) {
      filtered = filtered.filter(call => call.recording_url);
    }

    if (hideNoAnswer) {
      filtered = filtered.filter(call => 
        call.disconnection_reason !== 'dial_no_answer' && 
        call.disconnection_reason !== 'dial_busy' && 
        call.disconnection_reason !== 'dial_failed' && 
        call.disconnection_reason !== 'machine_detected' && 
        call.disconnection_reason !== 'concurrency_limit_reached' && 
        call.disconnection_reason !== 'error_twilio' && 
        call.disconnection_reason !== 'inactivity'
      );
    }

    setFilteredCalls(filtered);
    setPage(0); // Reset to first page when filters change
  };

  const handleSort = (key: keyof Call) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const formatDate = (timestamp: number | undefined) => {
    try {
      if (!timestamp) {
        return 'Invalid date';
      }
      const date = new Date(timestamp);
      if (!isValid(date)) {
        return 'Invalid date';
      }
      return format(date, 'PPpp');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getSortedCalls = () => {
    return [...filteredCalls].sort((a, b) => {
      if (sortConfig.key === 'start_timestamp') {
        return sortConfig.direction === 'asc' 
          ? a.start_timestamp - b.start_timestamp
          : b.start_timestamp - a.start_timestamp;
      }
      return 0; 
    });
  };

  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setShowOnlyRecorded(false);
    setHideNoAnswer(false);
  };

  const getCallStats = () => {
    const totalCalls = filteredCalls.length;
    const unansweredCalls = filteredCalls.filter(call => 
      call.disconnection_reason === 'dial_no_answer' || 
      call.disconnection_reason === 'dial_busy' || 
      call.disconnection_reason === 'dial_failed' || 
      call.disconnection_reason === 'machine_detected' || 
      call.disconnection_reason === 'concurrency_limit_reached' || 
      call.disconnection_reason === 'error_twilio' || 
      call.disconnection_reason === 'inactivity'
    ).length;
    const longCalls = filteredCalls.filter(call => {
      return call.duration_seconds ? call.duration_seconds > 20 : false;
    }).length;
    const totalCost = filteredCalls.reduce((sum, call) => sum + (call.call_cost || 0), 0);

    // Calculate percentages
    const unansweredPercentage = totalCalls > 0 
      ? ((unansweredCalls / totalCalls) * 100).toFixed(1)
      : '0';
    const longCallsPercentage = totalCalls > 0 
      ? ((longCalls / totalCalls) * 100).toFixed(1)
      : '0';

    return {
      totalCalls,
      unansweredCalls,
      unansweredPercentage,
      longCalls,
      longCallsPercentage,
      totalCost
    };
  };

  const stats = getCallStats();

  // Get paginated data
  const sortedAndPaginatedCalls = getSortedCalls().slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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

  const CallDetailsDrawer = () => {
    if (!selectedCall) return null;

    return (
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedCall(null);
          if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
        }}
        PaperProps={{
          sx: { width: { xs: '100%', sm: '500px' } }
        }}
      >
        <div className="h-full flex flex-col border-zinc-200 pe-4 text-black dark:text-white dark:border-zinc-800 bg-white dark:bg-zinc-950 transform transition-transform duration-300 ease-in-out">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-black dark:text-white">Call Details</h3>
              <button
                onClick={() => {
                  setSelectedCall(null);
                  setIsDrawerOpen(false);
                  if (audioRef.current) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                  }
                }}
                className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-8">
              {/* Call Info Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {selectedCall.call_type === 'inbound' ? (
                    <PhoneIncoming className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <PhoneOutgoing className="h-5 w-5 text-sky-500" />
                  )}
                  <span className="text-sm font-medium text-black dark:text-white">
                    {selectedCall.metadata?.customer_number || 'Unknown'}
                  </span>
                </div>
                <div className="text-sm text-zinc-500">
                  Started: {formatDate(selectedCall.start_timestamp)}
                </div>
              </div>

              {/* Audio Player Section */}
              {selectedCall.recording_url && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-black dark:text-white">Recording</h4>
                  </div>
                  <audio ref={audioRef} className="w-full" controls>
                    <source src={selectedCall.recording_url} type="audio/wav" />
                  </audio>
                </div>
              )}

              {/* Call Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm font-medium text-black dark:text-white">
                      {selectedCall.duration_seconds ? (() => {
                        const diffInSeconds = selectedCall.duration_seconds;
                        const hours = Math.floor(diffInSeconds / 3600);
                        const minutes = Math.floor((diffInSeconds % 3600) / 60);
                        const seconds = diffInSeconds % 60;
                        
                        const parts = [];
                        if (hours > 0) parts.push(`${hours}h`);
                        if (minutes > 0) parts.push(`${minutes}m`);
                        if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
                        
                        return parts.join(' ');
                      })() : '0s'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">Duration</p>
                </div>
                <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center space-x-2">
                    <CreditCardTwoTone className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm font-medium text-black dark:text-white">
                      {(selectedCall.call_cost || 0).toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">Credits Used</p>
                </div>
              </div>

              {/* Transcript */}
              {isLoadingTranscript ? (
                <div className="flex flex-col space-y-2 justify-center items-center h-full w-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg p-6 transform transition-transform duration-300 ease-in-out">
                  <p className="text-lg text-zinc-600 dark:text-zinc-400 pb-4">Loading Call Analysis...</p>
                  <CircularProgress size={36} style={{color: 'inherit', filter: 'invert(1)', margin: 'auto'}} />
                </div>
              ) : callTranscript ? (
                <div className="space-y-4 h-full w-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg p-6">
                  <h4 className="items-center justify-center text-sm font-medium text-black dark:text-white">Transcript</h4>
                  <Divider className="my-4" sx={{borderColor: 'inherit'}} />
                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col gap-4">
                      {callTranscript.split('\n').map((line, index) => {
                        const isAgent = line.startsWith('AI:');
                        const isUser = line.startsWith('User:');
                        const message = line.replace(/(AI:|User:)/, '').trim();

                        if (!isAgent && !isUser) return null;

                        return (
                          <div 
                            key={index}
                            className={`flex text-black dark:text-white ${isAgent ? 'justify-start' : 'justify-end'}`}
                          >
                            <div 
                              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                isAgent 
                                  ? 'bg-zinc-100 dark:bg-zinc-800' 
                                  : 'bg-gradient-to-tl from-green-500 to-yellow-500 dark:to-transparent text-white'
                              }`}
                            >
                              <div className="text-xs font-medium mb-1">
                                {isAgent ? 'AI Employee' : 'Customer'}
                              </div>
                              <div className="text-sm">{message}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Drawer>
    );
  };

  return (
    <>
      <Box sx={{ mt: -6, mx: 2 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Calls Made"
              value={`${stats.totalCalls} Calls`}
              icon={<PhoneIcon />}
              color="inherit"
              className="shadow-md shadow-blue-800/25 hover:shadow-lg hover:shadow-blue-500/40 border border-blue-200/50 dark:border-blue-800/10 rounded-lg bg-gradient-to-b from-zinc-100/60 to-zinc-200/90 dark:from-black/80 dark:to-black dark:group-hover:from-black/70 dark:group-hover:to-black/95 transition-all duration-300"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Unanswered Calls"
              value={`${stats.unansweredCalls} / ${stats.totalCalls} Calls`}
              subvalue={`${stats.unansweredPercentage}% of total`}
              icon={<PhoneMissedIcon />}
              color="inherit"
              className="shadow-md shadow-green-800/25 hover:shadow-lg hover:shadow-green-500/40 border border-green-200/50 dark:border-green-800/10 rounded-lg bg-gradient-to-b from-zinc-100/60 to-zinc-200/90 dark:from-zinc-950/80 dark:to-black dark:group-hover:from-black/70 dark:group-hover:to-black/95 transition-all duration-300"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Long Calls (>20s)"
              value={`${stats.longCalls} / ${stats.totalCalls} Calls`}
              subvalue={`${stats.longCallsPercentage}% of total`}
              icon={<TimerIcon />}
              color="inherit"
              className="shadow-md shadow-yellow-800/25 hover:shadow-lg hover:shadow-yellow-500/40 border border-yellow-200/50 dark:border-yellow-800/10 rounded-lg bg-gradient-to-b from-zinc-100/60 to-zinc-200/90 dark:from-zinc-950/80 dark:to-black dark:group-hover:from-black/70 dark:group-hover:to-black/95 transition-all duration-300"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Credits Used"
              value={`${stats.totalCost.toFixed(2)} Credits`}
              icon={<CreditCardTwoTone />}
              color="inherit"
              className="shadow-md shadow-red-800/25 hover:shadow-lg hover:shadow-red-500/40 border border-red-200/50 dark:border-red-800/10 rounded-lg bg-gradient-to-b from-zinc-100/60 to-zinc-200/90 dark:from-black/80 dark:to-black dark:group-hover:from-black/70 dark:group-hover:to-black/95 transition-all duration-300"
            />
          </Grid>
        </Grid>

        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          <Divider className="my-4" sx={{borderColor: 'inherit'}} />
        </span>

        {/* Appointments Section */}
        <Box sx={{ display: 'flex', flexDirection: {xs: 'column', md: 'row'}, justifyContent: 'space-between', alignItems: {xs: 'flex-start', md: 'center'}, gap: 4, mb: 4 }}>
          {/* Appointments */}
          <div className="flex flex-row justify-start items-start gap-3 h-full max-w-xl">
            <div className="flex items-center gap-3 mt-4">
              <CalendarIcon className="h-16 w-16 md:mr-4 text-black dark:text-white" /> 
              <div>
                <h2 className="text-3xl py-2 font-bold leading-6 text-zinc-950 dark:text-white">
                  Appointments
                </h2>
                <p className="text-md text-zinc-500 dark:text-zinc-400">
                  Quickly view and filter appointments by date.
                </p>
              </div>
            </div>
          </div>

          {/* Appointments Main Content */}
          <div className="flex flex-col justify-start items-center gap-3 mt-4 h-full max-w-1/2">
            <div className="flex flex-row justify-start items-center gap-3 mt-4">
              <CalendarCheck2Icon className="h-12 w-12 md:mr-4 text-black dark:text-white" /> 
              <h2 className="flex flex-row justify-start items-center text-xl py-2 font-bold leading-6 text-zinc-950 dark:text-white">
                Upcoming Appointments
              </h2>
              <p className="flex flex-row justify-start items-center text-md text-zinc-500 dark:text-zinc-400">
                View all already scheduled and upcoming appointments.
              </p>
            </div>
            <div className="flex flex-col justify-start items-start gap-3 mt-4 h-full w-full">
              <Card className="max-h-[350px] overflow-y-auto w-full border border-zinc-200 dark:border-zinc-700 p-6 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl glass-morphism transform transition-transform duration-300 ease-in-out [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                <div className="overflow-x-auto">
                  <Box>
                    <div className="flex flex-col justify-start items-start gap-3 mt-4 border border-zinc-200 dark:border-zinc-700 p-4 bg-gray-200 dark:bg-zinc-950 backdrop-blur-xl glass-morphism transform transition-transform duration-300 ease-in-out rounded-lg hover:bg-gray-300 hover:dark:bg-zinc-900 dark:hover:shadow-zinc-600">
                      <h2 className="text-lg font-medium text-black dark:text-white">
                        Appointment with <b>John Doe</b>  
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Appointment Details:
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        <span className="font-medium text-black dark:text-white mr-3">
                          Date:
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          2025-01-01
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400 mx-2">
                          10:00 AM
                        </span>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                          <span className="font-medium text-black dark:text-white mr-3">
                            Location:
                          </span>
                          <span className="text-zinc-500 dark:text-zinc-400">
                            <Button variant="contained" color="primary" className="rounded-lg border border-zinc-500 dark:border-gray-700 text-white bg-blue-500 hover:bg-blue-600">
                              Zoom Link
                            </Button>
                          </span>
                        </span>
                      </p>
                    </div>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      <Divider className="my-4" sx={{borderColor: 'inherit'}} />
                    </span>
                    <div className="flex flex-col justify-start items-start gap-3 mt-4 border border-zinc-200 dark:border-zinc-700 p-4 bg-gray-200 dark:bg-zinc-950 backdrop-blur-xl glass-morphism transform transition-transform duration-300 ease-in-out rounded-lg hover:bg-gray-300 hover:dark:bg-zinc-900 dark:hover:shadow-zinc-600">
                      <h2 className="text-lg font-medium text-black dark:text-white">
                        Appointment with <b>John Doe</b>  
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Appointment Details:
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        <span className="font-medium text-black dark:text-white mr-3">
                          Date:
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          2025-01-01
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400 mx-2">
                          10:00 AM
                        </span>
                      </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                          <span className="font-medium text-black dark:text-white mr-3">
                            Location:
                          </span>
                          <span className="text-zinc-500 dark:text-zinc-400">
                            <Button variant="contained" color="primary" className="rounded-lg border border-zinc-500 dark:border-gray-700 text-white bg-red-500 hover:bg-red-600">
                              Google Meet Link
                            </Button>
                          </span>
                        </p>
                    </div>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      <Divider className="my-4" sx={{borderColor: 'inherit'}} />
                    </span>
                    <div className="flex flex-col justify-start items-start gap-3 mt-4 border border-zinc-200 dark:border-zinc-700 p-4 bg-gray-200 dark:bg-zinc-950 backdrop-blur-xl glass-morphism transform transition-transform duration-300 ease-in-out rounded-lg hover:bg-gray-300 hover:dark:bg-zinc-900 dark:hover:shadow-zinc-600">
                      <h2 className="text-lg font-medium text-black dark:text-white">
                          Appointment with <b>John Doe</b>  
                        </h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          Appointment Details:
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          <span className="font-medium text-black dark:text-white mr-3">
                            Date:
                          </span>
                          <span className="text-zinc-500 dark:text-zinc-400">
                            2025-01-01
                          </span>
                          <span className="text-zinc-500 dark:text-zinc-400 mx-2">
                            10:00 AM
                          </span>
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                          <span className="font-medium text-black dark:text-white mr-3">
                            Location:
                          </span>
                          <span className="text-zinc-500 dark:text-zinc-400">
                            <Button variant="contained" color="primary" className="rounded-lg border border-zinc-500 dark:border-gray-700 text-white bg-indigo-500 hover:bg-indigo-600">
                              Microsoft Teams Link
                            </Button>
                          </span>
                        </p>
                    </div>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      <Divider className="my-4" sx={{borderColor: 'inherit'}} />
                    </span>
                    <div className="flex flex-col justify-start items-start gap-3 mt-4 border border-zinc-200 dark:border-zinc-700 p-4 bg-gray-200 dark:bg-zinc-950 backdrop-blur-xl glass-morphism transform transition-transform duration-300 ease-in-out rounded-lg hover:bg-gray-300 hover:dark:bg-zinc-900 dark:hover:shadow-zinc-600">
                      <h2 className="text-lg font-medium text-black dark:text-white">
                          Appointment with <b>John Doe</b>  
                        </h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          Appointment Details:
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          <span className="font-medium text-black dark:text-white mr-3">
                            Date:
                          </span>
                          <span className="text-zinc-500 dark:text-zinc-400">
                            2025-01-01
                          </span>
                          <span className="text-zinc-500 dark:text-zinc-400 mx-2">
                            10:00 AM
                          </span>
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                          <span className="font-medium text-black dark:text-white mr-3">
                            Location:
                          </span>
                          <span className="text-zinc-500 dark:text-zinc-400">
                            <Button variant="contained" color="primary" className="rounded-lg border border-zinc-500 dark:border-gray-700 text-white bg-black hover:bg-zinc-800 dark:bg-gray-800 dark:hover:bg-gray-700">
                              Phone Call
                            </Button>
                          </span>
                        </p>
                    </div>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      <Divider className="my-4" sx={{borderColor: 'inherit'}} />
                    </span>
                  </Box>
                </div>
              </Card>
            </div>
          </div>
          <div className="flex flex-col justify-start items-center gap-3 mt-4 h-full max-w-1/2">
            <div className="flex flex-row justify-start items-center gap-3 mt-4">
              <CalendarXIcon className="h-12 w-12 md:mr-4 text-black dark:text-white" /> 
              <h2 className="flex flex-row justify-start items-center text-xl py-2 font-bold leading-6 text-zinc-950 dark:text-white">
                Cancelled Appointments
              </h2>
              <p className="flex flex-row justify-start items-center text-md text-zinc-500 dark:text-zinc-400">
                Cancelled appointments. Follow up with the customer to reschedule.
              </p>
            </div>
            <div className="flex flex-col justify-start items-start gap-3 mt-4 h-full w-full">
              <Card className="max-h-[350px] overflow-y-auto w-full border border-zinc-200 dark:border-zinc-700 p-6 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl glass-morphism transform transition-transform duration-300 ease-in-out [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div className="overflow-x-auto">
                  <Box>
                    <div className="flex flex-col justify-start items-start gap-3 mt-4 border border-zinc-200 dark:border-zinc-700 p-4 bg-gray-200 dark:bg-zinc-950 backdrop-blur-xl glass-morphism transform transition-transform duration-300 ease-in-out rounded-lg hover:bg-gray-300 hover:dark:bg-zinc-900 dark:hover:shadow-zinc-600">
                      <h2 className="text-lg font-medium text-black dark:text-white">
                        Appointment with <b>John Doe</b>  
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Appointment Details:
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        <span className="font-medium text-black dark:text-white">
                          Date: &nbsp;
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          2025-01-01
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          &nbsp;10:00 AM
                        </span>
                      </p>
                    </div>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      <Divider className="my-4" sx={{borderColor: 'inherit'}} />
                    </span>
                    <div className="flex flex-col justify-start items-start gap-3 mt-4 border border-zinc-200 dark:border-zinc-700 p-4 bg-gray-200 dark:bg-zinc-950 backdrop-blur-xl glass-morphism transform transition-transform duration-300 ease-in-out rounded-lg hover:bg-gray-300 hover:dark:bg-zinc-900 dark:hover:shadow-zinc-600">
                      <h2 className="text-lg font-medium text-black dark:text-white">
                        Appointment with <b>John Doe</b>  
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Appointment Details:
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        <span className="font-medium text-black dark:text-white">
                          Date: &nbsp;
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          2025-01-01
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          &nbsp;10:00 AM
                        </span>
                      </p>
                    </div>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      <Divider className="my-4" sx={{borderColor: 'inherit'}} />
                    </span>
                    <div className="flex flex-col justify-start items-start gap-3 mt-4 border border-zinc-200 dark:border-zinc-700 p-4 bg-gray-200 dark:bg-zinc-950 backdrop-blur-xl glass-morphism transform transition-transform duration-300 ease-in-out rounded-lg hover:bg-gray-300 hover:dark:bg-zinc-900 dark:hover:shadow-zinc-600">
                      <h2 className="text-lg font-medium text-black dark:text-white">
                        Appointment with <b>John Doe</b>  
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Appointment Details:
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        <span className="font-medium text-black dark:text-white">
                          Date: &nbsp;
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          2025-01-01
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          &nbsp;10:00 AM
                        </span>
                      </p>
                    </div>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      <Divider className="my-4" sx={{borderColor: 'inherit'}} />
                    </span>
                    <div className="flex flex-col justify-start items-start gap-3 mt-4 border border-zinc-200 dark:border-zinc-700 p-4 bg-gray-200 dark:bg-zinc-950 backdrop-blur-xl glass-morphism transform transition-transform duration-300 ease-in-out rounded-lg hover:bg-gray-300 hover:dark:bg-zinc-900 dark:hover:shadow-zinc-600">
                      <h2 className="text-lg font-medium text-black dark:text-white">
                        Appointment with <b>John Doe</b>  
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Appointment Details:
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        <span className="font-medium text-black dark:text-white">
                          Date: &nbsp;
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          2025-01-01
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          &nbsp;10:00 AM
                        </span>
                      </p>
                    </div>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      <Divider className="my-4" sx={{borderColor: 'inherit'}} />
                    </span>
                  </Box>
                </div>
              </Card>
            </div>
          </div>
        </Box>

        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          <Divider className="my-4" sx={{borderColor: 'inherit'}} />
        </span>

        {/* Call History Filter */}
        <Box sx={{ display: 'flex', flexDirection: {xs: 'column', md: 'row'}, justifyContent: 'space-between', alignItems: {xs: 'flex-start', md: 'center'}, gap: 4, mb: 4 }}>
          <div className="flex items-center gap-3 mt-4">
            <BarChart className="h-16 w-16 md:mr-4 text-black dark:text-white" /> 
            <div>
              <h2 className="text-3xl py-2 font-bold leading-6 text-zinc-950 dark:text-white">
                Call History
              </h2>
              <p className="text-md text-zinc-500 dark:text-zinc-400">
                View all calls made by your AI Employees.<br />Click each row for detailed call analysis.
              </p>
            </div>
          </div>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4 rounded-lg px-4 py-3">
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      sx: {
                        '& .MuiInputBase-root': {
                          color: 'inherit',
                          backgroundColor: 'inherit',
                          borderRadius: '8px',
                          '& fieldset': {
                            borderColor: 'inherit',
                            borderWidth: '1px',
                            borderRadius: '8px'
                          },
                          '& input': {
                            color: 'inherit',
                            fontSize: '14px',
                            padding: '8px 14px'
                          },
                          '& .MuiSvgIcon-root': {
                            color: 'gray',
                            fontSize: '20px'
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'inherit',
                          fontSize: '14px',
                          fontWeight: '600'
                        }
                      }
                    }
                  }}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  minDate={startDate || undefined}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      sx: {
                        '& .MuiInputBase-root': {
                          color: 'inherit',
                          backgroundColor: 'inherit',
                          borderRadius: '8px',
                          '& fieldset': {
                            borderColor: 'inherit',
                            borderWidth: '1px',
                            borderRadius: '8px'
                          },
                          '& input': {
                            color: 'inherit',
                            fontSize: '14px',
                            padding: '8px 14px'
                          },
                          '& .MuiSvgIcon-root': {
                            color: 'gray',
                            fontSize: '20px'
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'inherit',
                          fontSize: '14px',
                          fontWeight: '600'
                        }
                      }
                    }
                  }}
                />
                <Button 
                  onClick={fetchCalls}
                  disabled={loading}
                  color="secondary"
                  className="h-full w-full sm:w-auto min-w-[150px] transform transition-transform duration-300 ease-in-out"
                >
                  <span className="text-sm font-semibold text-white dark:text-black rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-900 dark:bg-white glass-morphism backdrop-blur-xl w-full h-full flex items-center justify-center gap-2 px-4 py-2">
                    {loading ? <CircularProgress size={16} style={{color: 'inherit'}} /> : <><Refresh fontSize="small" /> Refresh</>}
                  </span>
                </Button>
              </div>
          </LocalizationProvider>
        </Box>

        <Card className="h-full w-full border border-zinc-200 dark:border-zinc-700 p-6 backdrop-blur-xl glass-morphism transform transition-transform duration-300 ease-in-out">
          {/* <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showOnlyRecorded}
                    onChange={(e) => setShowOnlyRecorded(e.target.checked)}
                    className="text-black dark:text-white"
                  />
                }
                label="Show only recorded"
                className="text-sm text-black dark:text-white"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hideNoAnswer}
                    onChange={(e) => setHideNoAnswer(e.target.checked)}
                    className="text-black dark:text-white"
                  />
                }
                label="Hide unanswered"
                className="text-sm text-black dark:text-white"
              />
              <IconButton 
                onClick={handleClearFilters}
                className="text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Refresh className="h-4 w-4" />
              </IconButton>
            </div> 
          </div> */}

          <div className="overflow-x-auto">
            <Table>
              <TableHead className="text-black dark:text-white">
                <TableRow>
                  <TableCell 
                    onClick={() => handleSort('start_timestamp')}
                    className="cursor-pointer text-black dark:text-white"
                  >
                    <div className="flex items-center">
                      Started At
                      {sortConfig.key === 'start_timestamp' && (
                        sortConfig.direction === 'asc' ? <ArrowUpward fontSize="small" className="ml-3"/> : <ArrowDownward fontSize="small" className="ml-3"/>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-black dark:text-white">Agent</TableCell>
                  <TableCell className="text-black dark:text-white">Inbound/Outbound</TableCell>
                  <TableCell className="text-black dark:text-white">Status</TableCell>
                  <TableCell className="text-black dark:text-white">End Reason</TableCell>
                  <TableCell className="text-black dark:text-white">Call Duration</TableCell>
                  <TableCell className="text-right text-black dark:text-white">Credits Used</TableCell>
                  <TableCell className="w-10"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedAndPaginatedCalls.map((call) => (
                  <TableRow
                    key={call.call_id}
                    onClick={() => {
                      setSelectedCall(call);
                      setIsDrawerOpen(true);
                    }}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer"
                  >
                    <TableCell className="text-black dark:text-white">{call.metadata.customer_number || 'N/A'}</TableCell>
                    <TableCell className="text-black dark:text-white">{formatDate(call.start_timestamp)}</TableCell>
                    <TableCell className="text-black dark:text-white">{call.agent_id || 'N/A'}</TableCell>
                    <TableCell className="text-black dark:text-white">{call.call_type || 'N/A'}</TableCell>
                    <TableCell className="text-black dark:text-white">
                      <Chip 
                        label={call.call_status}
                        color={call.call_status === 'ended' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {call.disconnection_reason && (
                        <Chip 
                          label={call.disconnection_reason}
                          color="default"
                          size="small"
                          className="text-gray-600 dark:text-white bg-gray-200/50 dark:bg-zinc-400/50"
                        />
                      )}
                    </TableCell>
                    <TableCell className="text-black dark:text-white">   
                      <span className="text-sm font-medium text-black dark:text-white">
                      {call.end_timestamp ? (() => {
                        const diffInSeconds = differenceInSeconds(
                          new Date(call.end_timestamp), 
                          new Date(call.start_timestamp)
                        );
                        const hours = Math.floor(diffInSeconds / 3600);
                        const minutes = Math.floor((diffInSeconds % 3600) / 60);
                        const seconds = diffInSeconds % 60;
                        
                        const parts = [];
                        if (hours > 0) parts.push(`${hours}h`);
                        if (minutes > 0) parts.push(`${minutes}m`);
                        if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
                        
                        return parts.join(' ');
                      })() : '0s'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-black dark:text-white">{(call.call_cost || 0).toFixed(2)} Credits</TableCell>
                    <TableCell>
                      <BsThreeDots className="h-4 w-4 text-black dark:text-white" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between px-4">
            <div className="flex items-center gap-2 text-sm text-black dark:text-white">
              <span>Rows per page:</span>
              <select 
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="h-8 w-[70px] rounded-md border border-input bg-transparent px-2 py-1 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {[10, 20, 50, 100, 200, 500, 1000].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <IconButton
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="text-black dark:text-white"
              >
                <MdChevronLeft className="h-8 w-8 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-md p-1" />
              </IconButton>
              <span className="text-sm text-black dark:text-white">
                Page {page + 1} of {Math.ceil(filteredCalls.length / rowsPerPage)}
              </span>
              <IconButton
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(filteredCalls.length / rowsPerPage) - 1}
                className="text-black dark:text-white"
              >
                <MdChevronRight className="h-8 w-8 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-md p-1" />
              </IconButton>
            </div>
          </div>
        </Card>
      </Box>

      <CallDetailsDrawer />
    </>
  );
};