# DialWise AI-EMS (Artificial Intelligence Employee Management System)

## 🚀 Tech Stack
### Frontend
- **Next.js 14** - React framework with App Router
- **Horizon UI** - Re-usable components built using Radix UI and Tailwind CSS
- **Shadcn UI** - Re-usable components built using Radix UI and Tailwind CSS
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Static type checking
- **React Hook Form** - Form validation
- **Zod** - Schema validation

### Backend & Database
- **Supabase** - Open source Firebase alternative
  - Authentication & JWT session management
  - PostgreSQL Database
  - Row Level Security
  - Real-time subscriptions
  - CRUD operations
  - CRON jobs
- **VAPI** - AI voice agents
  - List agents by Organization
  - Create, Edit, Delete agents
  - Save custom prompts for each agents (agent profiles + custom prompts saved in our database)
  - Save custom webhooks for each agents (agent profiles + custom webhooks saved in our database)
  - Save custom tools (functions) for each agents (agent profiles + custom tools saved in our database)
  - Save custom variables for each agents (agent profiles + custom variables saved in our database)
  - Save custom voiceId, language, name, description for each agents (agent profiles + custom voiceId, language, name, description saved in our database)
- **Retell** - AI voice agents (will be used only as a backup for VAPI - we will not use this for now)
  - List agents by Organization
  - Create, Edit, Delete agents
  - Save custom prompts for each agents (agent profiles + custom prompts saved in our database)
  - Save custom webhooks for each agents (agent profiles + custom webhooks saved in our database)
  - Save custom tools (functions) for each agents (agent profiles + custom tools saved in our database)
  - Save custom variables for each agents (agent profiles + custom variables saved in our database)
- **Stripe** - Payment processing
- **RESEND** - Email service
- **VoiceFlow Chatbot** - Chatbot builder & Widgets system (customization and prompt engineering) + integration with Supabase + integration with META / WhatsApp / Telegram / SMS / Discord
- **Twilio** - Phone/SMS service (API phone crate/import phone numbers + SIP trunking)
- **Telnyx** - Phone/SMS service (API phone crate/import phone numbers + SIP trunking)
- **Vonage** - Phone/SMS service (API phone crate/import phone numbers + SIP trunking)
- **cal.com** - Booking system
- **make.com** - Automation system (we will be using this for custom webhooks for clients to automate their own workflows outside of our platform)
- **Zapier** - Automation system (we will be using this for custom webhooks for clients to automate their own workflows outside of our platform)

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Commitlint** - Commit message linting

## 🎨 Design Rules

### Component Architecture
- Follows Atomic Design Principles
- Uses Shadcn UI component patterns
- Consistent spacing and layout system
- Responsive design first approach

### Styling Guidelines
- Tailwind CSS utility classes
- Custom theme configuration
- Dark mode support
- Consistent color palette

## 🛠 Features

### Authentication & Authorization
- Email/Password authentication
- Social auth providers
- Role-based access control
- Protected routes

### User Management
- User profiles
- Subscription tiers
  - Trial
  - Starter
  - Professional
  - Enterprise
- Credits system
  - Credits are used to pay for the services
  - Credits are purchased in packages
  - Credits are added to the user's balance
  - Credits are debited from the user's balance when a service is consumed
  - Credits are not transferrable between users
  - Credits are not refundable to avoid fraud
- Billing management
  - Billing address
  - Payment method
  - Subscription status
  - Subscription end date
  - Subscription start date
  - Subscription renewal date
  - Subscription cancellation date
### Subscription System
- Stripe integration
  - Stripe integration is used to handle the payment of the services
  - Stripe integration is used to handle the subscription of the services
  - Stripe integration is used to handle the billing of the services
  - Stripe integration is used to handle the cancellation of the services
  - Stripe integration is used to handle the renewal of the services
  - Stripe integration is used to handle the payment method of the services
  - Multiple pricing plans
    - Starter
    - Professional
    - Enterprise
  - Trial periods
    - 7 days trial
  - Usage tracking
    - Usage is tracked by the services
    - Usage is tracked by the users
    - Usage is tracked by the organizations

### Lead Management
- Lead tracking
  - Leads are tracked by the services
  - Leads are tracked by the users
  - Leads are tracked by the organizations
- Call logging
  - Call logging is tracked by the services
  - Call logging is tracked by the users
  - Call logging is tracked by the organizations
- Automated follow-ups
  - Automated follow-ups are tracked by the services
  - Automated follow-ups are tracked by the users
  - Automated follow-ups are tracked by the organizations
- Timezone handling
  - Timezone is handled by the services
  - Timezone is handled by the users
  - Timezone is handled by the organizations
- Booking system integration
  - Booking system is integrated with the services
  - Booking system is integrated with the users
  - Booking system is integrated with the organizations
- CRM integrations
  - CRM integrations are integrated with the services
  - CRM integrations are integrated with the users
  - CRM integrations are integrated with the organizations
- Webhooks
  - Webhooks are integrated with the services
  - Webhooks are integrated with the users
  - Webhooks are integrated with the organizations
- Email notifications
  - Email notifications are integrated with the services
  - Email notifications are integrated with the users
  - Email notifications are integrated with the organizations
- SMS notifications
  - SMS notifications are integrated with the services
  - SMS notifications are integrated with the users
  - SMS notifications are integrated with the organizations


## 🗺 Roadmap
- [ ] Enhanced analytics dashboard (based on our database and our own analytics with our own AI agents and chatbots)
- [ ] Advanced reporting features (based on our database and our own analytics with our own AI agents and chatbots)
- [ ] Multi-language support (English, Spanish, French, German, Italian, Portuguese, Dutch, Russian, Turkish, Arabic, Chinese, Japanese, Korean, Vietnamese, Hindi, etc.)
- [ ] Team collaboration features (based on our database and our own analytics with our own AI agents and chatbots)
- [ ] Custom workflow builder (based on our database and our own analytics with our own AI agents and chatbots)
- [ ] Integration marketplace (based on our database and our own analytics with our own AI agents and chatbots)
- [ ] AI-powered insights (based on our database and our own analytics with our own AI agents and chatbots)
- [ ] Advanced automation features (based on our database and our own analytics with our own AI agents and chatbots)
- [ ] Custom branding options (based on our database and our own analytics with our own AI agents and chatbots)

## 📄 Database Schema

\`\`\`sql
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
  id uuid references auth.users not null primary key,
  full_name text,
  email text,
  phone text,
  role user_role DEFAULT 'user',
  tier subscription_tier DEFAULT 'trial',
  avatar_url text,
  credits bigint DEFAULT 0,
  trial_credits bigint DEFAULT 10,
  billing_address jsonb,
  payment_method jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Additional tables (customers, products, prices, subscriptions, leads, etc.)
-- For complete schema, please refer to init.sql
\`\`\`

## 🔒 Security Features

- Row Level Security (RLS) policies
- Secure authentication flow
- Protected API routes
- Environment variable management
- CORS configuration
- XSS protection
- CSRF protection

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Set up environment variables
4. Run development server: \`npm run dev\`
5. Build for production: \`npm run build\`

## 📝 License
PRIVATE PROJECT