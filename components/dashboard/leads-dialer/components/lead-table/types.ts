import type { Lead } from "@/types/types_db";

export interface CSVPreviewData {
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  timezone?: string;
}

export interface CSVDialogProps {
  previewData: CSVPreviewData[];
  onConfirm: (data: CSVPreviewData[]) => void;
  onCancel: () => void;
  open: boolean;
}

export interface LeadTableProps {
  initialLeads: Lead[];
}

export interface SortState {
  column: keyof Lead | null;
  direction: "asc" | "desc" | null;
}

export interface EditingCell {
  id: string;
  field: keyof Lead;
}

export interface LeadFormState {
  company_name?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  timezone?: string;
}
