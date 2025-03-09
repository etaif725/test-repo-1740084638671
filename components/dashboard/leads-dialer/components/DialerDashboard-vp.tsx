"use client";

import React, { useEffect, useState, useRef } from 'react';
import { format, isValid, parseISO, differenceInSeconds } from 'date-fns';
import {
  Box,
  Container,
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
  FormGroup,
  Drawer,
  Stack,
  Button,
  Checkbox,
  FormControlLabel,
  CardHeader,
  CardContent,
} from '@mui/material';
import {
  Refresh,
  Phone as PhoneIcon,
  PhoneMissed as PhoneMissedIcon,
  Timer as TimerIcon,
  AttachMoney as MoneyIcon,
  ArrowUpward,
  ArrowDownward,
  Close as CloseIcon,
  CreditCardTwoTone,
  Contacts,
  WarningOutlined,
  AnalyticsTwoTone,
  AnalyticsOutlined,
  ContactsOutlined
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Call, CallTranscriptResponse } from '@/types/vapi';
import { vapiService } from '@/services/vapiService.txt';
import { MdChevronRight } from 'react-icons/md';
import { MdChevronLeft } from 'react-icons/md';
import { BsThreeDots } from 'react-icons/bs';
import { PhoneIncoming, PhoneOutgoing, BarChart, Clock, Link, CheckCircle } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import Grid from '@mui/material/Grid';
import { ClientLeadTable } from './client-lead-table';
import { AutomationControl } from './automation-control';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { IoAnalyticsOutline } from 'react-icons/io5';

type SortConfig = {
  key: keyof Call;
  direction: 'asc' | 'desc';
};

type AgentStats = {
  [agentId: string]: {
    totalCalls: number;
    answeredCalls: number;
    unansweredCalls: number;
    longCalls: number;
    totalCost: number;
    unansweredPercentage: string;
    answeredPercentage: string;
    longCallsPercentage: string;
    successRate: string;
  }
};

export const DialerDashboardVP = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [showOnlyRecorded, setShowOnlyRecorded] = useState(false);
  const [hideNoAnswer, setHideNoAnswer] = useState(false);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'startedAt', direction: 'desc' });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [transcript, setTranscript] = useState<CallTranscriptResponse | null>(null);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('24h');
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [agents, setAgents] = useState<Array<{id: string, name: string, orgId: string, createdAt: string, updatedAt: string}>>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [agentStats, setAgentStats] = useState<AgentStats>({});

  const calculateSuccessRate = (calls: Call[]) => {
    const successfulCalls = calls.filter(call => {
      // Check if call duration is over 20 seconds
      const duration = call.endedAt ? 
        differenceInSeconds(new Date(call.endedAt), new Date(call.startedAt)) : 0;
      
      // Exclude error cases
      const excludedReasons = [
        'error',
        'telephony-error',
        'voicemail-detected',
        'customer-did-not-answer',
        'customer-hung-up'
      ];
      
      return duration > 20 && !excludedReasons.includes(call.endedReason || '');
    });

    return successfulCalls.length > 0 ? 
      ((successfulCalls.length / calls.length) * 100).toFixed(1) : '0';
  };

  const fetchCalls = async (dateRange: string) => {
    setLoading(true);
    setError(null);
    setSelectedDateRange(dateRange === 'all' ? 'all' : dateRange);
    try {
      const response = await vapiService.listCalls(dateRange);
      if (response) {
        setCalls(response);
        setFilteredCalls(response);
        calculateAgentStats(response);
      }
    } catch (error) {
      console.error('Error fetching calls:', error);
      setError('Error loading calls. Please try again.');
      setCalls([]);
      setFilteredCalls([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTranscript = async (callId: string) => {
    setIsLoadingTranscript(true);
    try {
      const response = await vapiService.getCallTranscript(callId);
      setTranscript(response);
    } catch (error) {
      console.error('Error fetching transcript:', error);
      setTranscript(null);
    } finally {
      setIsLoadingTranscript(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const agentsData = await vapiService.getAgents();
      const agentList = agentsData.map((agent) => ({
        id: agent.id,
        name: agent.name || agent.id.substring(0, 8),
        orgId: agent.orgId,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt
      }));
      setAgents(agentList);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    }
  };

  const calculateAgentStats = (callsData: Call[]) => {
    const stats: AgentStats = {};
    
    // Group calls by agent
    callsData.forEach(call => {
      const agentId = call.assistantId;
      
      if (!stats[agentId]) {
        stats[agentId] = {
          totalCalls: 0,
          answeredCalls: 0,
          unansweredCalls: 0,
          longCalls: 0,
          totalCost: 0,
          unansweredPercentage: '0',
          answeredPercentage: '0',
          longCallsPercentage: '0',
          successRate: '0'
        };
      }
      
      // Increment total calls
      stats[agentId].totalCalls += 1;
      
      // Check if call was answered
      if (call.endedReason !== 'customer-did-not-answer' && call.endedReason !== 'customer-did-not-reach') {
        stats[agentId].answeredCalls += 1;
      } else {
        stats[agentId].unansweredCalls += 1;
      }
      
      // Check if it was a long call (>30s)
      const duration = call.endedAt ? 
        differenceInSeconds(new Date(call.endedAt), new Date(call.startedAt)) : 0;
      if (duration > 30) {
        stats[agentId].longCalls += 1;
      }
      
      // Add cost
      stats[agentId].totalCost += call.cost;
    });
    
    // Calculate percentages and success rate
    Object.keys(stats).forEach(agentId => {
      const agentStat = stats[agentId];
      const agentCalls = callsData.filter(call => call.assistantId === agentId);
      
      if (agentStat.totalCalls > 0) {
        agentStat.unansweredPercentage = ((agentStat.unansweredCalls / agentStat.totalCalls) * 100).toFixed(1);
        agentStat.answeredPercentage = ((agentStat.answeredCalls / agentStat.totalCalls) * 100).toFixed(1);
        agentStat.longCallsPercentage = ((agentStat.longCalls / agentStat.totalCalls) * 100).toFixed(1);
        agentStat.successRate = calculateSuccessRate(agentCalls);
      }
    });
    
    setAgentStats(stats);
  };

  useEffect(() => {
    fetchAgents();
    fetchCalls('all');
    // Set up auto-refresh interval
    const refreshInterval = setInterval(() => {
      fetchCalls(selectedDateRange);
    }, 6000000); // Refresh every 600 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    filterCalls();
  }, [startDate, endDate, showOnlyRecorded, hideNoAnswer, calls, selectedAgentId, selectedDateRange]);

  useEffect(() => {
    if (selectedCall?.id) {
      fetchTranscript(selectedCall.id);
    }
  }, [selectedCall]);

  const filterCalls = () => {
    let filtered = [...calls];

    if (startDate) {
      filtered = filtered.filter(call => 
        dayjs(call.startedAt).isAfter(startDate.startOf('day'))
      );
    }

    if (endDate) {
      filtered = filtered.filter(call => 
        dayjs(call.startedAt).isBefore(endDate.endOf('day'))
      );
    }

    if (showOnlyRecorded) {
      filtered = filtered.filter(call => call.recordingUrl);
    }

    if (hideNoAnswer) {
      filtered = filtered.filter(call => call.endedReason !== 'customer-did-not-answer');
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

  const formatDate = (dateString: string | undefined) => {
    try {
      if (!dateString) {
        return 'Invalid date';
      }
      const date = parseISO(dateString);
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
      if (sortConfig.key === 'startedAt') {
        return sortConfig.direction === 'asc' 
          ? new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
          : new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
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
    const answeredCalls = filteredCalls.filter(call => 
      call.endedReason !== 'customer-did-not-answer' && call.endedReason !== 'customer-did-not-reach'
    ).length;
    const unansweredCalls = filteredCalls.filter(call => 
      call.endedReason === 'customer-did-not-answer' || call.endedReason === 'customer-did-not-reach'
    ).length;
    const longCalls = filteredCalls.filter(call => {
      const duration = call.endedAt ? 
        differenceInSeconds(new Date(call.endedAt), new Date(call.startedAt)) : 0;
      return duration > 30;
    }).length;
    const totalCost = filteredCalls.reduce((sum, call) => sum + call.cost, 0);

    // Calculate percentages
    const unansweredPercentage = totalCalls > 0 
      ? ((unansweredCalls / totalCalls) * 100).toFixed(1)
      : '0';
    const longCallsPercentage = totalCalls > 0 
      ? ((longCalls / totalCalls) * 100).toFixed(1)
      : '0';
    const answeredPercentage = totalCalls > 0 
      ? ((answeredCalls / totalCalls) * 100).toFixed(1)
      : '0';

    const successRate = calculateSuccessRate(filteredCalls);

    return {
      totalCalls,
      answeredCalls,
      unansweredCalls,
      unansweredPercentage,
      longCalls,
      longCallsPercentage,
      totalCost,
      answeredPercentage,
      successRate
    };
  };

  const stats = getCallStats();

  // Get paginated data
  const sortedAndPaginatedCalls = getSortedCalls().slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate billable talk time based on filtered calls and selected agent
  const calculateBillableTalkTime = () => {
    // Use filteredCalls instead of sortedAndPaginatedCalls to include all calls that match filters
    const relevantCalls = filteredCalls.filter(call => {
      // Filter by agent if one is selected
      if (selectedAgentId && call.assistantId !== selectedAgentId) {
        return false;
      }
      
      // Only include calls with valid start and end times
      if (!call.endedAt || !call.startedAt) {
        return false;
      }
      
      // Only include calls that lasted at least 1 second
      const diffInSeconds = differenceInSeconds(
        new Date(call.endedAt), 
        new Date(call.startedAt)
      );
      return diffInSeconds >= 1;
    });
    
    // Sum up the duration of all relevant calls
    const totalSeconds = relevantCalls.reduce((total, call) => {
      const diffInSeconds = differenceInSeconds(
        new Date(call.endedAt), 
        new Date(call.startedAt)
      );
      return total + diffInSeconds;
    }, 0);
    
    // Format the result
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
    
    return parts.join(' ');
  };

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
          setTranscript(null);
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
                  setTranscript(null);
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
                  {selectedCall.direction === 'inbound' ? (
                    <PhoneIncoming className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <PhoneOutgoing className="h-5 w-5 text-sky-500" />
                  )}
                  <span className="text-sm font-medium text-black dark:text-white">
                    {selectedCall.customer?.number || 'Unknown'}
                  </span>
                </div>
                <div className="text-sm text-zinc-500">
                  Started: {formatDate(selectedCall.startedAt)}
                </div>
              </div>

              {/* Audio Player Section */}
              {selectedCall.recordingUrl && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-black dark:text-white">Recording</h4>
                  </div>
                  <audio ref={audioRef} className="w-full" controls>
                    <source src={selectedCall.recordingUrl} type="audio/wav" />
                  </audio>
                </div>
              )}

              {/* Call Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm font-medium text-black dark:text-white">
                      {selectedCall.endedAt ? (() => {
                        const diffInSeconds = differenceInSeconds(
                          new Date(selectedCall.endedAt), 
                          new Date(selectedCall.startedAt)
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
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">Duration</p>
                </div>
                <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center space-x-2">
                    <CreditCardTwoTone className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm font-medium text-black dark:text-white">
                      {selectedCall.cost ? (4.5 * selectedCall.cost).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">Credits Used</p>
                </div>
              </div>

              {/* Transcript Summary and Sentiment */}
              {transcript && transcript.summary && (
                <div className="space-y-4 h-full w-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg p-6">
                  <h5 className="text-sm font-medium text-black dark:text-white mb-2">Summary</h5>
                  <Divider className="my-4" sx={{borderColor: 'inherit'}} />
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    {transcript.summary}
                  </div>
                </div>
              )}
              {transcript && transcript.sentiment && (
                <div className="space-y-4 h-full w-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg p-6">
                  <h5 className="text-sm font-medium text-black dark:text-white mb-2">Sentiment</h5>
                  <Divider className="my-4" sx={{borderColor: 'inherit'}} />
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    {transcript.sentiment}
                  </div>
                </div>
              )}

              {/* Transcript */}
              {isLoadingTranscript ? (
                <div className="flex flex-col space-y-2 justify-center items-center h-full w-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg p-6 transform transition-transform duration-300 ease-in-out">
                  <p className="text-lg text-zinc-600 dark:text-zinc-400 pb-4">Loading Call Analysis...</p>
                  <CircularProgress size={36} style={{color: 'inherit', filter: 'invert(1)', margin: 'auto'}} />
                </div>
              ) : transcript ? (
                <div className="space-y-4 h-full w-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg p-6">
                  <h4 className="items-center justify-center text-sm font-medium text-black dark:text-white">Transcript</h4>
                  <Divider className="my-4" sx={{borderColor: 'inherit'}} />
                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col gap-4">
                      {transcript.transcript.split('\n').map((line, index) => {
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
        <Grid>
          <Grid item sx={{ display: 'flex', flexDirection: {xs: 'column', md: 'row'}, justifyContent: 'space-between', alignItems: {xs: 'flex-center', md: 'center'}, gap: 4, mb: 4 }} className="justify-between gap-3 my-6">
            <div className="flex flex-row items-center justify-start">
              <IoAnalyticsOutline className="h-16 w-16 mr-4 text-black dark:text-white" /> 
              <div>
                <h2 className="text-3xl pt-6 pb-2 font-bold leading-6 text-zinc-950 dark:text-white">
                  Auto-Dialer Analytics
                </h2>
                <p className="text-md text-zinc-500 dark:text-zinc-400">
                  Track your Auto-Dialer performance.
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-zinc-300/50 dark:bg-zinc-800 p-2 flex flex-row space-x-2 items-center justify-self-end">
              <Button className={`w-full rounded-lg font-semibold hover:font-bold p-2 transition-all duration-300 ${selectedDateRange === '24h' ? 'bg-gradient-to-b from-transparent to-green-500 dark:from-green-500 dark:to-transparent text-black dark:text-white hover:shadow-lg hover:translate-y-[-6px]' : 'bg-gradient-to-b from-transparent to-green-500 dark:from-green-500 dark:to-transparent text-black dark:text-white hover:shadow-lg hover:translate-y-[-6px]'}`} onClick={() => fetchCalls('24h')} variant="outlined" color="inherit">24h</Button>
              <Button className={`w-full rounded-lg font-semibold hover:font-bold p-2 transition-all duration-300 ${selectedDateRange === '7d' ?  'bg-gradient-to-b from-transparent to-green-500 dark:from-green-500 dark:to-transparent text-black dark:text-white hover:shadow-lg hover:translate-y-[-6px]' : 'bg-gradient-to-b from-transparent to-green-500 dark:from-green-500 dark:to-transparent text-black dark:text-white hover:shadow-lg hover:translate-y-[-6px]'}`} onClick={() => fetchCalls('7d')} variant="outlined" color="inherit">7d</Button>
              <Button className={`w-full rounded-lg font-semibold hover:font-bold p-2 transition-all duration-300 ${selectedDateRange === '30d' ? 'bg-gradient-to-b from-transparent to-green-500 dark:from-green-500 dark:to-transparent text-black dark:text-white hover:shadow-lg hover:translate-y-[-6px]' : 'bg-gradient-to-b from-transparent to-green-500 dark:from-green-500 dark:to-transparent text-black dark:text-white hover:shadow-lg hover:translate-y-[-6px]'}`} onClick={() => fetchCalls('30d')} variant="outlined" color="inherit">30d</Button>
              <Button className={`w-full rounded-lg font-semibold hover:font-bold p-2 transition-all duration-300 ${selectedDateRange === '90d' ? 'bg-gradient-to-b from-transparent to-green-500 dark:from-green-500 dark:to-transparent text-black dark:text-white hover:shadow-lg hover:translate-y-[-6px]' : 'bg-gradient-to-b from-transparent to-green-500 dark:from-green-500 dark:to-transparent text-black dark:text-white hover:shadow-lg hover:translate-y-[-6px]'}`} onClick={() => fetchCalls('90d')} variant="outlined" color="inherit">90d</Button>
              <Button className={`w-full rounded-lg font-semibold hover:font-bold p-2 transition-all duration-300 ${selectedDateRange === 'all' ? 'bg-gradient-to-b from-transparent to-green-500 dark:from-green-500 dark:to-transparent text-black dark:text-white hover:shadow-lg hover:translate-y-[-6px]' : 'bg-gradient-to-b from-transparent to-green-500 dark:from-green-500 dark:to-transparent text-black dark:text-white hover:shadow-lg hover:translate-y-[-6px]'}`} onClick={() => fetchCalls('all')} variant="outlined" color="inherit">All</Button>
            
              <div className="text-xs px-6 max-w-[96px] md:max-w-[164px] md:px-16 md:w-full rounded-lg bg-zinc-300/50 dark:bg-zinc-800 p-2 flex flex-row items-center justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <span className="w-full rounded-lg text-black dark:text-white font-semibold hover:font-bold transition-all duration-300">
                      {selectedAgentId ? agents.find(a => a.id === selectedAgentId)?.name || 'Select AI Employees' : 'Select AI Employees'}
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="mr-10 rounded-lg w-72 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-zinc-100 dark:scrollbar-track-zinc-800">
                    <DropdownMenuItem onClick={() => setSelectedAgentId(null)} className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <div className="w-full">
                        <div className="text-lg font-semibold text-black dark:text-white">All AI Employees</div>
                        <div className="text-xs text-zinc-500 dark:text-gray-500">View data from all AI employees</div>
                      </div>
                    </DropdownMenuItem>
                    {agents && agents.length > 0 ? (
                      agents.map((agent) => (
                        <DropdownMenuItem key={agent.id} onClick={() => setSelectedAgentId(agent.id)} className="p-3 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          <div className="max-w-full">
                            <div className="text-md font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">{agent.name}</div>
                            <div className="text-xs text-zinc-500 pt-1"><b>Agent ID:</b> {agent.id}</div>
                            <div className="text-xs text-zinc-500 pt-1"><b>Created At:</b> {formatDate(agent.createdAt)}</div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem>
                        <span>Oops! No AI employees available</span>
                        <Link href={`/dashboard/[id]/ai-employees/create/vp`} className="text-blue-500 hover:text-blue-600">Create an AI Employee</Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Grid>
        </Grid>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Calls Made"
              value={`${selectedAgentId ? agentStats[selectedAgentId]?.totalCalls || 0 : stats.totalCalls} Calls`}
              icon={<PhoneIcon />}
              color="inherit"
              className="shadow-md shadow-blue-800/25 hover:shadow-lg hover:shadow-blue-500/40 border border-blue-200/50 dark:border-blue-800/10 rounded-lg bg-gradient-to-b from-zinc-100/60 to-zinc-200/90 dark:from-zinc-950/80 dark:to-black dark:group-hover:from-black/70 dark:group-hover:to-black/95 transition-all duration-300"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Unanswered Calls"
              value={`${selectedAgentId ? agentStats[selectedAgentId]?.unansweredCalls || 0 : stats.unansweredCalls} / ${selectedAgentId ? agentStats[selectedAgentId]?.totalCalls || 0 : stats.totalCalls} Calls`}
              subvalue={`${selectedAgentId ? agentStats[selectedAgentId]?.unansweredPercentage || 0 : stats.unansweredPercentage}% of total`}
              icon={<PhoneMissedIcon />}
              color="inherit"
              className="shadow-md shadow-green-800/25 hover:shadow-lg hover:shadow-green-500/40 border border-green-200/50 dark:border-green-800/10 rounded-lg bg-gradient-to-b from-zinc-100/60 to-zinc-200/90 dark:from-zinc-950/80 dark:to-black dark:group-hover:from-black/70 dark:group-hover:to-black/95 transition-all duration-300"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Answered Calls"
              value={`${selectedAgentId ? agentStats[selectedAgentId]?.answeredCalls || 0 : stats.answeredCalls} / ${selectedAgentId ? agentStats[selectedAgentId]?.totalCalls || 0 : stats.totalCalls} Calls`}
              subvalue={`${selectedAgentId ? agentStats[selectedAgentId]?.answeredPercentage || 0 : stats.answeredPercentage}% of total`}
              icon={<PhoneMissedIcon />}
              color="inherit"
              className="shadow-md shadow-green-800/25 hover:shadow-lg hover:shadow-green-500/40 border border-green-200/50 dark:border-green-800/10 rounded-lg bg-gradient-to-b from-zinc-100/60 to-zinc-200/90 dark:from-zinc-950/80 dark:to-black dark:group-hover:from-black/70 dark:group-hover:to-black/95 transition-all duration-300"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Long Calls (>30s)"
              value={`${selectedAgentId ? agentStats[selectedAgentId]?.longCalls || 0 : stats.longCalls} / ${selectedAgentId ? agentStats[selectedAgentId]?.totalCalls || 0 : stats.totalCalls} Calls`}
              subvalue={`${selectedAgentId ? agentStats[selectedAgentId]?.longCallsPercentage || 0 : stats.longCallsPercentage}% of total`}
              icon={<TimerIcon />}
              color="inherit"
              className="shadow-md shadow-yellow-800/25 hover:shadow-lg hover:shadow-yellow-500/40 border border-yellow-200/50 dark:border-yellow-800/10 rounded-lg bg-gradient-to-b from-zinc-100/60 to-zinc-200/90 dark:from-zinc-950/80 dark:to-black dark:group-hover:from-black/70 dark:group-hover:to-black/95 transition-all duration-300"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Credits Used"
              value={`${selectedAgentId ? (agentStats[selectedAgentId]?.totalCost ? (4.5 * agentStats[selectedAgentId].totalCost).toFixed(2) : '0.00') : (4.5 * stats.totalCost).toFixed(2)} Credits`}
              subvalue={`This represent the total amount of credits used for all calls made`}
              icon={<CreditCardTwoTone />}
              color="inherit"
              className="shadow-md shadow-red-800/25 hover:shadow-lg hover:shadow-red-500/40 border border-red-200/50 dark:border-red-800/10 rounded-lg bg-gradient-to-b from-zinc-100/60 to-zinc-200/90 dark:from-zinc-950/80 dark:to-black dark:group-hover:from-black/70 dark:group-hover:to-black/95 transition-all duration-300"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Billable Talk Time"
              value={`${
                selectedAgentId 
                  ? sortedAndPaginatedCalls
                      .filter(call => call.assistantId === selectedAgentId)
                      .filter(call => call.endedAt && call.startedAt)
                      .filter(call => {
                        const diffInSeconds = differenceInSeconds(
                          new Date(call.endedAt), 
                          new Date(call.startedAt)
                        );
                        return diffInSeconds >= 1;
                      })
                      .reduce((total, call) => {
                        const diffInSeconds = differenceInSeconds(
                          new Date(call.endedAt), 
                          new Date(call.startedAt)
                        );
                        return total + diffInSeconds;
                      }, 0)
                  : sortedAndPaginatedCalls
                      .filter(call => call.endedAt && call.startedAt)
                      .filter(call => {
                        const diffInSeconds = differenceInSeconds(
                          new Date(call.endedAt), 
                          new Date(call.startedAt)
                        );
                        return diffInSeconds >= 1;
                      })
                      .reduce((total, call) => {
                        const diffInSeconds = differenceInSeconds(
                          new Date(call.endedAt), 
                          new Date(call.startedAt)
                        );
                        return total + diffInSeconds;
                      }, 0)
              } minutes`}
              subvalue={`This represent the number of total minutes that the AI Employee/s were talking to a customer`}
              icon={<TimerIcon />}
              color="inherit"
              className="shadow-md shadow-purple-800/25 hover:shadow-lg hover:shadow-purple-500/40 border border-purple-200/50 dark:border-purple-800/10 rounded-lg bg-gradient-to-b from-zinc-100/60 to-zinc-200/90 dark:from-zinc-950/80 dark:to-black dark:group-hover:from-black/70 dark:group-hover:to-black/95 transition-all duration-300"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Success Rate"
              value={`${
                selectedAgentId 
                  ? ((sortedAndPaginatedCalls
                      .filter(call => call.assistantId === selectedAgentId)
                      .filter(call => call.endedAt && call.startedAt)
                      .filter(call => call.status === 'ended' && call.endedReason !== 'customer-did-not-give-microphone-permission' && call.endedReason !== 'customer-did-not-answer')
                      .length / 
                      sortedAndPaginatedCalls
                      .filter(call => call.assistantId === selectedAgentId)
                      .filter(call => call.endedAt && call.startedAt)
                      .length) * 100).toFixed(1)
                  : ((sortedAndPaginatedCalls
                      .filter(call => {
                        const diffInSeconds = differenceInSeconds(
                          new Date(call.endedAt),
                          new Date(call.startedAt)
                        );
                        return call.endedAt && call.startedAt && diffInSeconds >= 30;
                      })
                      .filter(call => call.status === 'ended' && call.endedReason !== 'customer-did-not-give-microphone-permission' && call.endedReason !== 'customer-did-not-answer')
                      .length /
                      sortedAndPaginatedCalls
                      .filter(call => call.endedAt && call.startedAt)
                      .length) * 100).toFixed(1)
              }%`}
              subvalue={`This represent the number of calls that were answered and exceeded 30 seconds (excluding 'No Answer' or 'Hung Up' calls)`}
              icon={<CheckCircle />}
              color="inherit"
              className="shadow-md shadow-green-800/25 hover:shadow-lg hover:shadow-green-500/40 border border-green-200/50 dark:border-green-800/10 rounded-lg bg-gradient-to-b from-zinc-100/60 to-zinc-200/90 dark:from-zinc-950/80 dark:to-black dark:group-hover:from-black/70 dark:group-hover:to-black/95 transition-all duration-300"
            />
          </Grid>
        </Grid>

        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          <Divider className="my-4" sx={{borderColor: 'inherit'}} />
        </span>

        {/* Leads Dialer Section */}
        <Box sx={{ display: 'flex', flexDirection: {xs: 'column', md: 'row'}, justifyContent: 'space-between', alignItems: {xs: 'flex-start', md: 'center'}, gap: 4, mb: 4 }}>
          <div className="flex items-center gap-3">
            <ContactsOutlined className="h-16 w-16 md:mr-4 text-black dark:text-white" /> 
            <div>
              <h2 className="text-3xl py-2 font-bold leading-6 text-zinc-950 dark:text-white">
                Leads Dialer
              </h2>
              <p className="text-md text-zinc-500 dark:text-zinc-400 pb-4">
                Let your leads dial themselves.<br />Click each row for detailed call analysis.
              </p>
              <Card className="w-full h-full border border-yellow-500 dark:border-yellow-700">
                <CardContent className="rounded-t-lg">
                  <p className="text-xs font-bold text-black dark:text-white">Uploading a leads manualy is available, however not recommended if the leads aren't already in your CRM.</p>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="h-full w-full">
            {/* Statistics */}
            <div className="mb-5 flex gap-5 flex-col xl:flex-row w-full">
              {/* <Dialer Automation Control /> */}
              <AutomationControl initialSettings={null} onSettingsUpdate={() => {}} />
            </div>
            {/* Charts */}
            <div className="mb-5 flex gap-5 flex-col xl:flex-row w-full">
            </div>
            {/* Leads Table */}
            <div className="mb-5 h-full w-full rounded-lg ">
              <ClientLeadTable initialLeads={[]} />
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
          {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                  onClick={() => fetchCalls(startDate, endDate)}
                  disabled={loading}
                  color="secondary"
                  className="h-full w-full sm:w-auto min-w-[150px] transform transition-transform duration-300 ease-in-out"
                >
                  <span className="text-sm font-semibold text-white dark:text-black rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-900 dark:bg-white glass-morphism backdrop-blur-xl w-full h-full flex items-center justify-center gap-2 px-4 py-2">
                    {loading ? <CircularProgress size={16} style={{color: 'inherit'}} /> : <><Refresh fontSize="small" /> Refresh</>}
                  </span>
                </Button>
              </div>
          </LocalizationProvider> */}
        </Box>

        <Card className="h-full w-full border border-zinc-200 dark:border-zinc-700 p-6 backdrop-blur-xl glass-morphism transform transition-transform duration-300 ease-in-out">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
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
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHead className="text-black dark:text-white">
                <TableRow>
                  <TableCell 
                    onClick={() => handleSort('customer')}
                    className="cursor-pointer text-black dark:text-white"
                  >
                    <div className="flex items-center">
                      Customer Phone #
                      {sortConfig.key === 'customer' && (
                        sortConfig.direction === 'asc' ? <ArrowUpward fontSize="small" className="ml-3"/> : <ArrowDownward fontSize="small" className="ml-3"/>
                      )}
                    </div>
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('startedAt')}
                    className="cursor-pointer text-black dark:text-white"
                  >
                    <div className="flex items-center">
                      Started At
                      {sortConfig.key === 'startedAt' && (
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
                {sortedAndPaginatedCalls
                  .filter(call => !selectedAgentId || call.assistantId === selectedAgentId)
                  .map((call) => (
                  <TableRow
                    key={call.id}
                    onClick={() => {
                      setSelectedCall(call);
                      setIsDrawerOpen(true);
                    }}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer"
                  >
                    <TableCell className="text-black dark:text-white">{call.customer?.number || 'N/A'}</TableCell>
                    <TableCell className="text-black dark:text-white">{formatDate(call.startedAt)}</TableCell>
                    <TableCell className="text-black dark:text-white">{call.assistantId || 'N/A'}</TableCell>
                    <TableCell className="text-black dark:text-white">{call.direction || 'N/A'}</TableCell>
                    <TableCell className="text-black dark:text-white">
                      <Chip 
                        label={call.status}
                        color={call.status === 'ended' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {call.endedReason && (
                        <Chip 
                          label={call.endedReason}
                          color="default"
                          size="small"
                          className="text-gray-600 dark:text-white bg-gray-200/50 dark:bg-zinc-400/50"
                        />
                      )}
                    </TableCell>
                    <TableCell className="text-black dark:text-white">   
                      <span className="text-sm font-medium text-black dark:text-white">
                      {call.endedAt ? (() => {
                        const diffInSeconds = differenceInSeconds(
                          new Date(call.endedAt), 
                          new Date(call.startedAt)
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
                    <TableCell className="text-right text-black dark:text-white">
                      {call.endedAt ? (() => {
                        const diffInSeconds = differenceInSeconds(
                          new Date(call.endedAt),
                          new Date(call.startedAt)
                        );
                        return diffInSeconds === 0 ? '0.00' : call.cost ? (4.5 * call.cost).toFixed(2) : '0.00';
                      })() : '0.00'} Credits
                    </TableCell>
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
                Page {page + 1} of {Math.ceil((selectedAgentId ? 
                  filteredCalls.filter(call => call.assistantId === selectedAgentId).length : 
                  filteredCalls.length) / rowsPerPage)}
              </span>
              <IconButton
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil((selectedAgentId ? 
                  filteredCalls.filter(call => call.assistantId === selectedAgentId).length : 
                  filteredCalls.length) / rowsPerPage) - 1}
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