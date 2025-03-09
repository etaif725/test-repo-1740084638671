'use client';

import { LeadTable } from './lead-table';
import type { Lead } from '@/types/types_db';

export function ClientLeadTable({ initialLeads }: { initialLeads: Lead[] }) {
  return <LeadTable initialLeads={initialLeads} />;
}
