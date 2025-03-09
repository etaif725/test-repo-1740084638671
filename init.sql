/** 
* USERS
* Note: This table contains user data. Users should only be able to view and update their own data.
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('sudo', 'owner', 'admin', 'user');
CREATE TYPE subscription_tier AS ENUM ('starter', 'professional', 'enterprise', 'trial');
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

create table users (
  -- UUID from auth.users
  id uuid references auth.users not null primary key,
  full_name text,
  email text not null unique,
  phone text,
  avatar_url text,
  credits bigint DEFAULT 0,
  trial_credits bigint DEFAULT 10,
  -- The customer's billing address, stored in JSON format.
  billing_address jsonb,
  -- Stores your customer's payment instruments.
  payment_method jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
alter table users enable row level security;
 
/**
* This trigger automatically creates a user entry when a new user signs up via Supabase Auth.
*/ 
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, full_name, email)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', ''), 
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

/**
* CUSTOMERS
* Note: this is a private table that contains a mapping of user IDs to Stripe customer IDs.
*/
create table customers (
  -- UUID from auth.users
  id uuid references auth.users not null primary key,
  -- The user's customer ID in Stripe. User must not be able to update this.
  stripe_customer_id text
);
alter table customers enable row level security;

/** 
* PRODUCTS
* Note: products are created and managed in Stripe and synced to our DB via Stripe webhooks.
*/
create table products (
  -- Product ID from Stripe, e.g. prod_1234.
  id text primary key,
  -- Whether the product is currently available for purchase.
  active boolean,
  -- The product's name, meant to be displayable to the customer. Whenever this product is sold via a subscription, name will show up on associated invoice line item descriptions.
  name text,
  -- The product's description, meant to be displayable to the customer. Use this field to optionally store a long form explanation of the product being sold for your own rendering purposes.
  description text,
  -- A URL of the product image in Stripe, meant to be displayable to the customer.
  image text,
  -- Set of key-value pairs, used to store additional information about the object in a structured format.
  metadata jsonb
);
alter table products enable row level security;

/**
* PRICES
* Note: prices are created and managed in Stripe and synced to our DB via Stripe webhooks.
*/
create type pricing_type as enum ('one_time', 'recurring');
create type pricing_plan_interval as enum ('day', 'week', 'month', 'year');
create table prices (
  -- Price ID from Stripe, e.g. price_1234.
  id text primary key,
  -- The ID of the prduct that this price belongs to.
  product_id text references products, 
  -- Whether the price can be used for new purchases.
  active boolean,
  -- A brief description of the price.
  description text,
  -- The unit amount as a positive integer in the smallest currency unit (e.g., 100 cents for US$1.00 or 100 for ¥100, a zero-decimal currency).
  unit_amount bigint,
  -- Three-letter ISO currency code, in lowercase.
  currency text check (char_length(currency) = 3),
  -- One of `one_time` or `recurring` depending on whether the price is for a one-time purchase or a recurring (subscription) purchase.
  type pricing_type,
  -- The frequency at which a subscription is billed. One of `day`, `week`, `month` or `year`.
  interval pricing_plan_interval,
  -- The number of intervals (specified in the `interval` attribute) between subscription billings. For example, `interval=month` and `interval_count=3` bills every 3 months.
  interval_count integer,
  -- Default number of trial days when subscribing a customer to this price using [`trial_from_plan=true`](https://stripe.com/docs/api#create_subscription-trial_from_plan).
  trial_period_days integer,
  -- Set of key-value pairs, used to store additional information about the object in a structured format.
  metadata jsonb
);
alter table prices enable row level security;

/**
* SUBSCRIPTIONS
* Note: subscriptions are created and managed in Stripe and synced to our DB via Stripe webhooks.
*/
create type subscription_status as enum ('trial', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');
create table subscriptions (
  -- Subscription ID from Stripe, e.g. sub_1234.
  id text primary key,
  user_id uuid references auth.users not null,
  -- The status of the subscription object, one of subscription_status type above.
  status subscription_status,
  -- Set of key-value pairs, used to store additional information about the object in a structured format.
  metadata jsonb,
  -- ID of the price that created this subscription.
  price_id text references prices,
  -- Quantity multiplied by the unit amount of the price creates the amount of the subscription. Can be used to charge multiple seats.
  quantity integer,
  -- If true the subscription has been canceled by the user and will be deleted at the end of the billing period.
  cancel_at_period_end boolean,
  -- Time at which the subscription was created.
  created timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Start of the current period that the subscription has been invoiced for.
  current_period_start timestamp with time zone default timezone('utc'::text, now()) not null,
  -- End of the current period that the subscription has been invoiced for. At the end of this period, a new invoice will be created.
  current_period_end timestamp with time zone default timezone('utc'::text, now()) not null,
  -- If the subscription has ended, the timestamp of the date the subscription ended.
  ended_at timestamp with time zone default timezone('utc'::text, now()),
  -- A date in the future at which the subscription will automatically get canceled.
  cancel_at timestamp with time zone default timezone('utc'::text, now()),
  -- If the subscription has been canceled, the date of that cancellation. If the subscription was canceled with `cancel_at_period_end`, `canceled_at` will still reflect the date of the initial cancellation request, not the end of the subscription period when the subscription is automatically moved to a canceled state.
  canceled_at timestamp with time zone default timezone('utc'::text, now()),
  -- If the subscription has a trial, the beginning of that trial.
  trial_start timestamp with time zone default timezone('utc'::text, now()),
  -- If the subscription has a trial, the end of that trial.
  trial_end timestamp with time zone default timezone('utc'::text, now())
);
alter table subscriptions enable row level security;

/**
 * REALTIME SUBSCRIPTIONS
 * Only allow realtime listening on public tables.
 */
drop publication if exists supabase_realtime;
create publication supabase_realtime for table products, prices;

-- API Integration table to store API credentials
CREATE TABLE integrations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  dashboard_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  private_api_key uuid DEFAULT uuid_generate_v4() NOT NULL,
  public_api_key uuid DEFAULT uuid_generate_v4() NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Wallet table for tracking balance and usage
CREATE TABLE wallets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  balance BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Wallet usage tracking
CREATE TABLE wallet_usage (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  wallet_id uuid REFERENCES wallets NOT NULL,
  amount BIGINT NOT NULL,
  description TEXT,
  transaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE wallet_usage ENABLE ROW LEVEL SECURITY;

-- Agency relationships
CREATE TABLE agencies (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id uuid REFERENCES auth.users NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

-- Client-Agency relationships
CREATE TABLE agency_clients (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id uuid REFERENCES agencies NOT NULL,
  client_id uuid REFERENCES auth.users NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(agency_id, client_id)
);
CREATE TRIGGER update_agency_clients_updated_at BEFORE UPDATE ON agency_clients 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE agency_clients ENABLE ROW LEVEL SECURITY;

-- Affiliate program tables
CREATE TABLE affiliate_links (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  affiliate_id uuid NOT NULL,
  name TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  unique_code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  total_clicks INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_affiliate_links_updated_at BEFORE UPDATE ON affiliate_links 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;

-- Affiliate conversions
CREATE TABLE affiliate_conversions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  affiliate_link_id uuid REFERENCES affiliate_links NOT NULL,
  referred_user_id uuid REFERENCES auth.users,
  amount DECIMAL(10, 2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_affiliate_conversions_updated_at BEFORE UPDATE ON affiliate_conversions 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- Chatbot configuration
CREATE TABLE chatbot_configs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  connected BOOLEAN DEFAULT false,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);
CREATE TRIGGER update_chatbot_configs_updated_at BEFORE UPDATE ON chatbot_configs 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE chatbot_configs ENABLE ROW LEVEL SECURITY;

-- Calendar integration
CREATE TABLE calendar_integrations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  api_key TEXT NOT NULL,
  provider TEXT DEFAULT 'cal.com',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);
CREATE TRIGGER update_calendar_integrations_updated_at BEFORE UPDATE ON calendar_integrations 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Create integrations for new users automatically
CREATE OR REPLACE FUNCTION public.create_user_integration() 
RETURNS TRIGGER AS $$
BEGIN
  -- Create integration record
  INSERT INTO public.integrations (
    user_id, 
    dashboard_id, 
    organization_id, 
    private_api_key,
    public_api_key,
    type,
    status
  )
  VALUES (
    NEW.id, 
    uuid_generate_v4(), 
    uuid_generate_v4(), 
    uuid_generate_v4(),
    uuid_generate_v4(),
    'voice-assistant',
    'active'
  );
  
  -- Create wallet record
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and continue
    RAISE NOTICE 'Error in create_user_integration: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_create_integration
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_user_integration();

-- Store Retell agents
CREATE TABLE retell_agents (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  agent_id text NOT NULL UNIQUE,
  agent_name text,
  voice_id text NOT NULL,
  llm_websocket_url text NOT NULL,
  configuration jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_retell_agents_updated_at BEFORE UPDATE ON retell_agents 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE retell_agents ENABLE ROW LEVEL SECURITY;
   
-- Store Retell calls
CREATE TABLE retell_calls (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  agent_id text REFERENCES retell_agents(agent_id),
  call_id text NOT NULL UNIQUE,
  call_status text,
  call_type text,
  start_timestamp bigint,
  end_timestamp bigint,
  duration_seconds integer,
  call_cost numeric,
  recording_url text,
  transcript text,
  call_analysis jsonb,
  metadata jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_retell_calls_updated_at BEFORE UPDATE ON retell_calls 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE retell_calls ENABLE ROW LEVEL SECURITY;

-- User access policies
CREATE POLICY "Users can view their own data" ON users 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users 
  FOR UPDATE USING (auth.uid() = id);

-- Customer access policies
CREATE POLICY "Users can view their own customer data" ON customers 
  FOR SELECT USING (auth.uid() = id);

-- Products and prices are readable by all authenticated users
CREATE POLICY "Products are viewable by all authenticated users" ON products 
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Prices are viewable by all authenticated users" ON prices 
  FOR SELECT USING (auth.role() = 'authenticated');

-- Subscription access policies
CREATE POLICY "Users can view their own subscriptions" ON subscriptions 
  FOR SELECT USING (auth.uid() = user_id);

-- Integration access policies
CREATE POLICY "Users can view their own integrations" ON integrations 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own integrations" ON integrations 
  FOR UPDATE USING (auth.uid() = user_id);

-- Wallet access policies
CREATE POLICY "Users can view their own wallet" ON wallets 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own wallet usage" ON wallet_usage 
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM wallets WHERE wallets.id = wallet_usage.wallet_id AND wallets.user_id = auth.uid()
  ));

-- Agency access policies
CREATE POLICY "Agency owners can manage their agencies" ON agencies 
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Users can view agencies they belong to" ON agency_clients 
  FOR SELECT USING (auth.uid() = client_id OR 
    EXISTS (SELECT 1 FROM agencies WHERE agencies.id = agency_clients.agency_id AND agencies.owner_id = auth.uid()));

-- Affiliate access policies
CREATE POLICY "Users can manage their own affiliate links" ON affiliate_links 
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own conversions" ON affiliate_conversions 
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM affiliate_links WHERE affiliate_links.id = affiliate_conversions.affiliate_link_id AND affiliate_links.user_id = auth.uid()
  ));

-- Chatbot and calendar access policies
CREATE POLICY "Users can manage their own chatbot config" ON chatbot_configs 
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own calendar integration" ON calendar_integrations 
  FOR ALL USING (auth.uid() = user_id);

-- Retell access policies
CREATE POLICY "Users can manage their own Retell agents" ON retell_agents 
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own Retell calls" ON retell_calls 
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE retell_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE retell_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own Retell agents" ON retell_agents 
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own Retell calls" ON retell_calls 
  FOR SELECT USING (auth.uid() = user_id);

-- More permissive policy for testing (be careful with this in production)
CREATE POLICY "Allow all authenticated users to view agents"
ON retell_agents FOR SELECT
TO authenticated
USING (true);