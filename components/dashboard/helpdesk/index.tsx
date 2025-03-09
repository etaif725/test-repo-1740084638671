"use client"

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, AlertCircle, Paperclip } from 'lucide-react';
import DashboardLayout from '@/components/layout';
import { User } from '@supabase/supabase-js';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

export default function HelpdeskDashboard(props: Props) {
  const supabase = createClient();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLDivElement>(null);
  const [formHeight, setFormHeight] = useState<number>(0);

  useEffect(() => {
    const updateHeight = () => {
      if (formRef.current) {
        setFormHeight(formRef.current.offsetHeight)
      }
    }
    
    updateHeight()
    const initialTimer = setTimeout(updateHeight, 100)
    
    window.addEventListener('resize', updateHeight)
    
    const observer = new MutationObserver(updateHeight)
    if (formRef.current) {
      observer.observe(formRef.current, { 
        subtree: true, 
        childList: true,
        attributes: true 
      })
    }
    
    return () => {
      window.removeEventListener('resize', updateHeight)
      observer.disconnect()
      clearTimeout(initialTimer)
    }
  }, [])

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    if (!props.user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', props.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!props.user) return;
    setSubmitting(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([
          {
            user_id: props.user.id,
            subject,
            category,
            priority: priority.toLowerCase(),
            description,
            status: 'open'
          }
        ]);

      if (error) throw error;

      // Reset form and refresh tickets
      setSubject('');
      setCategory('');
      setPriority('Medium');
      setDescription('');
      setAttachment(null);
      await fetchTickets();

    } catch (err: any) {
      console.error('Error submitting ticket:', err);
      setError(err.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="Help Center"
      description="Submit and track support tickets"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div ref={formRef}>
          <div className="bg-[hsl(var(--card))] rounded-lg p-8 shadow-sm border border-[hsl(var(--border))]">
            <h2 className="text-2xl font-semibold mb-2">Submit a Support Ticket</h2>
            <p className="text-[hsl(var(--muted-foreground))] mb-8">
              We're here to help! Fill the form below and we'll get back to you as soon as possible.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-shadow"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-shadow"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing</option>
                    <option value="feature">Feature Request</option>
                    <option value="integration">Integration Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-shadow"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-shadow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Attachment</label>
                <div className="flex items-center gap-2 w-full px-4 py-2 rounded-md border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--background))]">
                  <Paperclip className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <input
                    type="file"
                    onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-3 rounded-md font-semibold bg-green-600 hover:bg-green-700 text-white transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button> 
            </form>
          </div>
        </div>

        <div className="mt-0 lg:mt-0 lg:pl-0 flex flex-col" style={{ height: formHeight ? `${formHeight}px` : 'auto' }}>
          <div className="bg-[hsl(var(--card))] rounded-lg p-8 shadow-sm border border-[hsl(var(--border))]">
            <h2 className="text-2xl font-semibold mb-6">My Tickets</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                {error}
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                No tickets found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))]">
                      <th className="text-left py-3 px-4">Subject</th>
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-left py-3 px-4">Priority</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr 
                        key={ticket.id} 
                        className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors"
                      >
                        <td className="py-4 px-4">{ticket.subject}</td>
                        <td className="py-4 px-4 capitalize">{ticket.category}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            ticket.priority === 'high' 
                              ? 'bg-red-100 text-red-700' 
                              : ticket.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-4 px-4 capitalize">{ticket.status}</td>
                        <td className="py-4 px-4">{new Date(ticket.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}