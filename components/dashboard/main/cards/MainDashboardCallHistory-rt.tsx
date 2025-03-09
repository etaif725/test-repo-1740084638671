import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  PaginationState,
  createColumnHelper,
  useReactTable,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender
} from '@tanstack/react-table';
import { Clock, Phone, User, X, MessageSquare, PlayCircle, DollarSign, PhoneCall, PhoneIncoming, PhoneOutgoing } from 'lucide-react';
import React from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { BsThreeDots } from 'react-icons/bs';

type CallRecord = {
  checked?: string;
  call_id: string;
  agent_id: string;
  call_type: string;
  from_number: string;
  to_number: string;
  direction: string;
  disconnection_reason: string;
  start_timestamp: number;
  end_timestamp: number;
  transcript: string;
  transcript_object: Array<{
    role: string;
    content: string;
    words: Array<{
      word: string;
      start: number;
      end: number;
    }>;
  }>;
  recording_url: string;
  call_status: string;
  call_analysis: {
    call_summary: string;
    user_sentiment: string;
    agent_sentiment: string;
    call_successful: boolean;
  };
  call_cost: {
    combined_cost: number;
    total_duration_seconds: number;
  };
  menu?: string;
};

function CallHistoryTable() {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [callData, setCallData] = React.useState<CallRecord[]>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [selectedCallId, setSelectedCallId] = React.useState<string | null>(null);
  const [selectedCall, setSelectedCall] = React.useState<CallRecord | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  // Add new state for filters
  const [filters, setFilters] = React.useState({
    agent_id: [],
    call_status: [],
    in_voicemail: [],
    disconnection_reason: [],
    call_type: [],
    direction: [],
    user_sentiment: [],
    call_successful: []
  });

  // Add pagination state
  const [paginationKey, setPaginationKey] = React.useState("");
  const [hasMore, setHasMore] = React.useState(true);

  React.useEffect(() => {
    // Fetch call history data from Retell API
    const fetchCallHistory = async () => {
      try {
        const response = await fetch('https://api.retellai.com/v2/list-calls', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_RETELL_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            limit: 1000,
            pagination_key: paginationKey,
            sort_order: "descending",
            filter_criteria: {
              ...filters,
              // Only include non-empty filter arrays
              ...Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value.length > 0)
              )
            }
          })
        });
        
        // Check if response is ok before parsing JSON
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text(); // Get response as text first
        
        try {
          const data = JSON.parse(text); // Try to parse as JSON
          
          // Update pagination key and hasMore flag
          if (data.pagination_key) {
            setPaginationKey(data.pagination_key);
            setHasMore(true);
          } else {
            setHasMore(false);
          }

          // Transform the data to ensure all required fields exist with default values
          const transformedCalls = (data.calls || []).map(call => ({
            ...call,
            call_analysis: call.call_analysis || {
              call_summary: '',
              user_sentiment: 'unknown',
              agent_sentiment: 'unknown',
              call_successful: false
            },
            call_cost: call.call_cost || {
              combined_cost: 0,
              total_duration_seconds: 0
            },
            transcript_object: call.transcript_object || [],
            recording_url: call.recording_url || ''
          }));

          // Append new data to existing data if paginating
          setCallData(prevData => 
            paginationKey ? [...prevData, ...transformedCalls] : transformedCalls
          );

        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          console.log('Raw response:', text);
        }
        
      } catch (error) {
        console.error('Error fetching call history:', error);
      }
    };

    fetchCallHistory();
  }, [filters, paginationKey]); // Add filters and paginationKey as dependencies

  // Add filter handling functions
  const updateFilter = (filterType: keyof typeof filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: Array.isArray(prev[filterType]) 
        ? prev[filterType].includes(value)
          ? prev[filterType].filter(v => v !== value)
          : [...prev[filterType], value]
        : [value]
    }));
    setPaginationKey(""); // Reset pagination when filters change
  };

  // Add load more function
  const loadMore = () => {
    if (hasMore) {
      // The useEffect will trigger with the new paginationKey
      setPaginationKey(paginationKey);
    }
  };

  const columns = [
    columnHelper.accessor('call_id', {
      id: 'call_id',
      header: () => (
        <p className="text-xs font-semibold text-black dark:text-white">
          CALL ID
        </p>
      ),
      cell: (info) => (
        <p className="text-sm font-medium text-black dark:text-white">
          {info.getValue()}
        </p>
      )
    }),
    columnHelper.accessor('start_timestamp', {
      id: 'start_time',
      header: () => (
        <p className="text-xs font-semibold text-black dark:text-white">
          START TIME
        </p>
      ),
      cell: (info) => (
        <p className="text-sm font-medium text-black dark:text-white max-w-sm">
          {new Date(info.getValue()).toLocaleString()}
        </p>
      )
    }),
    columnHelper.accessor('call_type', {
      id: 'call_type',
      header: () => (
        <p className="text-xs font-semibold text-black dark:text-white">
          CALL TYPE
        </p>
      ),
      cell: (info) => {
        const callType = info.getValue();
        const callTypeMap = {
          "phone_call": "Phone",
          "web_call": "Web"
        };
        const callTypeClasses = {
          "phone_call": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
          "web_call": "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400"
        }[callType] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";

        return (
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${callTypeClasses}`}>
            {callTypeMap[callType] || callType}
          </span>
        );
      }
    }),
    columnHelper.accessor('direction', {
      id: 'direction',
      header: () => (
        <p className="text-xs font-semibold text-black dark:text-white">
          DIRECTION
        </p>
      ),
      cell: (info) => {
        const direction = info.getValue();
        const directionMap = {
          "outbound": "Outbound",
          "inbound": "Inbound"
        };
        const directionClasses = {
          "outbound": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
          "inbound": "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400"
        }[direction] || "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";

        return (
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${directionClasses}`}>
            {directionMap[direction] || direction}
          </span>
        );
      }
    }),
    columnHelper.accessor('disconnection_reason', {
      id: 'disconnection_reason',
      header: () => (
        <p className="text-xs font-semibold text-black dark:text-white">
          ENDED REASON
        </p>
      ),
      cell: (info) => {
        const disconnectionReason = info.getValue();
        const reasonCategories = {
          // Normal endings
          normal: {
            reasons: ["user_hangup", "agent_hangup", "call_transfer", "voicemail_reached"],
            class: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
          },
          // System limits
          limits: {
            reasons: ["inactivity", "max_duration_reached", "concurrency_limit_reached", "no_valid_payment", "registered_call_timeout"],
            class: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
          },
          // Connection issues
          connection: {
            reasons: ["dial_busy", "dial_failed", "dial_no_answer", "error_no_audio_received"],
            class: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
          },
          // Technical errors
          technical: {
            reasons: ["error_llm_websocket_open", "error_llm_websocket_lost_connection", "error_llm_websocket_runtime", 
                     "error_llm_websocket_corrupt_payload", "error_frontend_corrupted_payload", "error_twilio", 
                     "error_asr", "error_retell", "error_unknown", "error_user_not_joined"],
            class: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
          },
          // Security
          security: {
            reasons: ["scam_detected", "machine_detected"],
            class: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
          }
        };

        const getReasonCategory = (reason: string) => {
          for (const [category, data] of Object.entries(reasonCategories)) {
            if (data.reasons.includes(reason)) {
              return data.class;
            }
          }
          return reasonCategories.technical.class; // Default fallback
        };

        const formatReason = (reason: string) => {
          return reason
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        };

        return (
          <span className={`text-sm font-medium px-3 py-1 rounded-full max-w-xl ${getReasonCategory(disconnectionReason)}`}>
            {formatReason(disconnectionReason)}
          </span>
        );
      }
    }),
    columnHelper.accessor('call_analysis.call_summary', {
      id: 'summary',
      header: () => (
        <p className="text-xs font-semibold text-black dark:text-white">
          SUMMARY
        </p>
      ),
      cell: (info) => (
        <p className="text-sm font-medium text-black dark:text-white max-w-sm">
          {info.getValue() || 'No summary available'}
        </p>
      )
    }),
    columnHelper.accessor('call_analysis.user_sentiment', {
      id: 'sentiment',
      header: () => (
        <p className="text-xs font-semibold text-black dark:text-white">
          SENTIMENT
        </p>
      ),
      cell: (info) => {
        const sentiment = info.getValue() || 'unknown';
        const sentimentClasses = {
          unknown: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          neutral: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          negative: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          positive: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
        }[sentiment.toLowerCase()] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";

        return (
          <span className={`text-sm font-medium px-3 py-1 rounded-full max-w-sm ${sentimentClasses}`}>
            {sentiment}
          </span>
        );
      }
    }),
    columnHelper.accessor('menu', {
      id: 'menu',
      header: () => (
        <p className="text-xs font-semibold text-black dark:text-white"></p>
      ),
      cell: (info) => (
        <Button onClick={() => setSelectedCall(info.row.original)} className="bg-transparent text-black hover:bg-transparent active:bg-transparent dark:text-white dark:hover:bg-transparent dark:active:bg-transparent">
          <p className="text-2xl hover:cursor-pointer">
            <BsThreeDots />
          </p>
        </Button>
      )
    })
  ];

  const [{ pageIndex, pageSize }, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize
    }),
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: callData,
    columns,
    state: {
      columnFilters,
      globalFilter,
      pagination
    },
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  });

  return (
    <>
      <Card
        className={
          'h-full w-full border-zinc-200 p-0 dark:border-zinc-800 sm:overflow-auto'
        }
      >
        <div className="overflow-x-scroll xl:overflow-x-hidden">
          <Table className="w-full">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableHeader
                key={headerGroup.id}
                className="border-b-[1px] border-zinc-200 p-6 dark:border-zinc-800"
              >
                <tr className="dark:border-zinc-800">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        onClick={header.column.getToggleSortingHandler()}
                        className="cursor-pointer border-zinc-200 pl-4 pr-4 py-2 text-start dark:border-zinc-800"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: '',
                          desc: ''
                        }[header.column.getIsSorted() as string] ?? null}
                      </TableHead>
                    );
                  })}
                </tr>
              </TableHeader>
            ))}
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.slice(0, 7).map((row) => {
                  return (
                    <TableRow
                      key={row.id}
                      className="px-6 dark:hover:bg-gray-900 cursor-pointer"
                    >
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <TableCell
                            key={cell.id}
                            className="w-max border-b-[1px] border-zinc-200 py-5 pl-5 pr-4 dark:border-white/10"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-4">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {/* pagination */}
          <div className="mt-2 flex h-20 w-full items-center justify-between px-6">
            {/* left side */}
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-black dark:text-white">
                Showing {table.getRowModel().rows?.length ?? 0} calls
              </p>
            </div>
            {/* right side */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className={`flex items-center justify-center rounded-lg bg-transparent p-2 text-lg text-black transition duration-200 hover:bg-transparent active:bg-transparent dark:text-white dark:hover:bg-transparent dark:active:bg-transparent`}
              >
                <MdChevronLeft />
              </Button>
              <Button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className={`flex min-w-[34px] items-center justify-center rounded-lg bg-transparent p-2 text-lg text-black transition duration-200 hover:bg-transparent active:bg-transparent dark:text-white dark:hover:bg-transparent dark:active:bg-transparent`}
              >
                <MdChevronRight />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Call Details Sliding Panel */}
        <div
          className={`fixed inset-y-0 right-0 w-full sm:w-96 transform transition-transform duration-300 ease-in-out ${
            selectedCall ? 'translate-x-0' : 'translate-x-full'
          } z-50`}
        >
        {selectedCall && (
          <div className="h-full flex flex-col bg-white dark:bg-black border-l border-zinc-200 dark:border-zinc-800">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-black dark:text-white">Call Details</h3>
                <button
                  onClick={() => {
                    setSelectedCall(null);
                    if (audioRef.current) {
                      audioRef.current.pause();
                      setIsPlaying(false);
                    }
                  }}
                  className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
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
                      {selectedCall.from_number} → {selectedCall.to_number}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-500">
                    Started: {new Date(selectedCall.start_timestamp).toLocaleString()}
                  </div>
                </div>

                {/* Audio Player Section */}
                {selectedCall.recording_url && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-black dark:text-white">Recording</h4>
                      <Button
                        onClick={() => {
                          if (audioRef.current) {
                            if (isPlaying) {
                              audioRef.current.pause();
                            } else {
                              audioRef.current.play();
                            }
                            setIsPlaying(!isPlaying);
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="text-black dark:text-white"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        {isPlaying ? 'Pause' : 'Play'}
                      </Button>
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
                        {selectedCall.call_cost?.total_duration_seconds 
                          ? Math.round(selectedCall.call_cost.total_duration_seconds / 60) 
                          : Math.round((selectedCall.end_timestamp - selectedCall.start_timestamp) / 1000 / 60)}m
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">Duration</p>
                  </div>
                  <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-zinc-500" />
                      <span className="text-sm font-medium text-black dark:text-white">
                        ${selectedCall.call_cost?.combined_cost?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">Cost</p>
                  </div>
                </div>

                {/* Call Analysis */}
                {selectedCall.call_analysis && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-black dark:text-white">Analysis</h4>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="text-xs text-zinc-500 mb-1">Summary</h5>
                        <p className="text-sm text-black dark:text-white">{selectedCall.call_analysis.call_summary || 'No summary available'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                          <h5 className="text-xs text-zinc-500 mb-1">User Sentiment</h5>
                          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                            {
                              unknown: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                              neutral: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                              negative: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                              positive: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            }[selectedCall.call_analysis.user_sentiment?.toLowerCase() || 'unknown']
                          }`}>
                            {selectedCall.call_analysis.user_sentiment || 'Unknown'}
                          </span>
                        </div>
                        <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                          <h5 className="text-xs text-zinc-500 mb-1">Agent Sentiment</h5>
                          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                            {
                              unknown: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                              neutral: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                              negative: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                              positive: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            }[selectedCall.call_analysis.agent_sentiment?.toLowerCase() || 'unknown']
                          }`}>
                            {selectedCall.call_analysis.agent_sentiment || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h5 className="text-xs text-zinc-500 mb-1">Call Outcome</h5>
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                          selectedCall.call_analysis.call_successful
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {selectedCall.call_analysis.call_successful ? 'Successful' : 'Unsuccessful'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transcript */}
                {selectedCall.transcript_object && selectedCall.transcript_object.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-black dark:text-white">Transcript</h4>
                    <div className="space-y-4">
                      {selectedCall.transcript_object.map((entry, index) => (
                        <div key={index} className={`flex ${entry.role === 'agent' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-lg p-3 ${
                            entry.role === 'agent' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white'
                          }`}>
                            <div className="text-xs opacity-75 mb-1">
                              {entry.role === 'agent' ? 'Agent' : 'Customer'}
                            </div>
                            <div className="text-sm">{entry.content}</div>
                            {entry.words && entry.words.length > 0 && (
                              <div className="text-xs opacity-75 mt-1">
                                {Math.floor(entry.words[0].start)}s - {Math.ceil(entry.words[entry.words.length - 1].end)}s
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CallHistoryTable;
const columnHelper = createColumnHelper<CallRecord>();
