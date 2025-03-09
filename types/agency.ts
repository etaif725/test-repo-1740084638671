// Client and Agency Types
export interface Client {
  created_at: any;
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  company?: string;
  business_name?: string;
  status?: string;
  subscription?: {
    next_billing_date: any;
    plan_name?: string;
    current_period_end?: string;
  };
}

export interface Plan {
  id: string;
  name: string;
  price_per_month: number;
  voice_minutes_included: number;
  email_notifications_included: number;
  cbot_messages_included: number;
  overage_voice_rate: number;
  overage_email_rate: number;
  overage_cbot_rate: number;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone_number: string;
  company: string;
  plan_id: string;
  password: string;
}

export interface AgencyConfig {
  company_name?: string;
  logo_url?: string;
  favicon_url?: string;
}

export interface UsageData {
  voice_minutes_used: number;
  email_notifications_sent: number;
  cbot_messages_sent: number;
}

export interface Transaction {
  id: string;
  created_at: string;
  transaction_type: string;
  resource_type: string;
  amount: number;
} 