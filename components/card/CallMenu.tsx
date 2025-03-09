import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import React from 'react';
import { BsThreeDots } from 'react-icons/bs';
import { X, Clock, User, Phone, PlayCircle, MessageSquare } from 'lucide-react';

function CardMenu(props: { transparent?: boolean; vertical?: boolean }) {
  const { transparent, vertical } = props;
  const [open, setOpen] = React.useState(false);
  const [selectedCall, setSelectedCall] = React.useState<any>(null);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            onClick={() => setOpen(!open)}
            className={`flex items-center text-xl hover:cursor-pointer ${
              transparent
                ? 'bg-transparent text-white hover:bg-transparent active:bg-transparent'
                : vertical
                ? 'bg-transparent text-zinc-950 hover:bg-transparent active:bg-transparent dark:text-white dark:hover:bg-transparent dark:active:bg-transparent'
                : 'bg-lightPrimary text-brand-500 p-2 hover:bg-gray-100 dark:bg-zinc-950 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/10'
            } justify-center rounded-lg font-bold transition duration-200`}
          >
            {vertical ? (
              <p className="text-2xl hover:cursor-pointer">
                <BsThreeDots />
              </p>
            ) : (
              <BsThreeDots className="h-6 w-6" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-[80] w-40 border-zinc-200 dark:border-zinc-800">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setSelectedCall({})}>
              <p className="flex cursor-pointer items-center gap-2 text-zinc-800 hover:font-medium hover:text-zinc-950 dark:text-zinc-200 dark:hover:text-white">
                <span>
                  <MessageSquare className="h-4 w-4" />
                </span>
                View Details
              </p>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <p className="mt-2 flex cursor-pointer items-center gap-2 pt-1 text-zinc-950 hover:font-medium hover:text-zinc-950 dark:text-zinc-200 dark:hover:text-white">
                <span>
                  <PlayCircle className="h-4 w-4" />
                </span>
                Play Recording
              </p>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Call Details Sliding Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-96 glass-morphism transform transition-transform duration-300 ease-in-out ${
          selectedCall ? 'translate-x-0' : 'translate-x-full'
        } z-50`}
      >
        {selectedCall && (
          <div className="h-full flex flex-col bg-[hsl(var(--background))] border-l border-[hsl(var(--border))]">
            <div className="px-4 py-6 bg-[hsl(var(--muted))]/50 backdrop-blur-sm border-b border-[hsl(var(--border))]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Call Details</h3>
                <button
                  onClick={() => setSelectedCall(null)}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors p-2 rounded-full hover:bg-[hsl(var(--accent))]/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="rounded-lg p-4 transition-all duration-200">
                  <h4 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Basic Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-[hsl(var(--foreground))]">
                      <Clock className="h-4 w-4 mr-2 text-[hsl(var(--primary))]" />
                      Start Time: {selectedCall.start_timestamp}
                    </div>
                    <div className="flex items-center text-sm text-[hsl(var(--foreground))]">
                      <User className="h-4 w-4 mr-2 text-[hsl(var(--primary))]" />
                      Agent ID: {selectedCall.agent_id}
                    </div>
                    <div className="flex items-center text-sm text-[hsl(var(--foreground))]">
                      <Phone className="h-4 w-4 mr-2 text-[hsl(var(--primary))]" />
                      Call Status: {selectedCall.call_status}
                    </div>
                  </div>
                </div>

                {/* Call Analysis */}
                <div className="rounded-lg p-4 transition-all duration-200">
                  <h4 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Call Analysis</h4>
                  <div className="space-y-2">
                    <div className="text-sm text-[hsl(var(--foreground))]">
                      <span className="font-medium">Summary:</span> {selectedCall.call_analysis?.call_summary}
                    </div>
                    <div className="text-sm text-[hsl(var(--foreground))]">
                      <span className="font-medium">User Sentiment:</span> {selectedCall.call_analysis?.user_sentiment}
                    </div>
                    <div className="text-sm text-[hsl(var(--foreground))]">
                      <span className="font-medium">Agent Sentiment:</span> {selectedCall.call_analysis?.agent_sentiment}
                    </div>
                  </div>
                </div>

                {/* Transcript */}
                <div className="rounded-lg p-4 transition-all duration-200">
                  <h4 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Transcript</h4>
                  <div className="text-sm text-[hsl(var(--foreground))] whitespace-pre-wrap">
                    {selectedCall.transcript}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CardMenu;
