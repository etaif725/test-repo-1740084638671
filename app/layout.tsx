import SupabaseProvider from './supabase-provider';
import { PropsWithChildren } from 'react';
import '@/styles/globals.css';
import { ThemeProvider } from './theme-provider';
import { AuthProvider } from '@/hooks/use-auth';

export const dynamic = 'force-dynamic';

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children
}: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>
          Dialwise - Create and manage your own AI Employees
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* <!--  Social tags   --> */}
        <meta
          name="keywords"
          content="Dialwise, GPT-4o, AI, Chatbot, Agent, Voice Agents, AI Employee, AI CRM"
        />
        <meta name="description" content="Dialwise is a platform that allows you to create and manage your own AI Employees." />
        {/* <!-- Schema.org markup for Google+ --> */}
        <meta itemProp="name" content="Dialwise" />
        <meta
          itemProp="description"
          content="Dialwise is a platform that allows you to create and manage your own AI Employees."
        />
        <meta
          itemProp="image"
          content="https://dialwise.ai/img/logo.png"
        />
        {/* <!-- Twitter Card data --> */}
        <meta name="twitter:card" content="product" />
        <meta
          name="twitter:title"
          content="Dialwise"
        />
        <meta
          name="twitter:description"
          content="Dialwise is a platform that allows you to create and manage your own AI Employees."
        />
        <meta
          name="twitter:image"
          content="https://dialwise.ai/img/logo.png"
        />
        {/* <!-- Open Graph data --> */}
        <meta
          property="og:title"
          content="Dialwise"
        />
        <meta property="og:type" content="product" />
        <meta property="og:url" content="https://dialwise.ai" />
        <meta
          property="og:image"
          content="https://dialwise.ai/img/logo.png"
        />
        <meta
          property="og:description"
          content="Dialwise is a platform that allows you to create and manage your own AI Employees."
        />
        <meta
          property="og:site_name"
          content="Dialwise"
        />
        <link rel="canonical" href="https://dialwise.ai" />
        <link rel="icon" href="/img/favicon.ico" />
      </head>
      <body id={'root'} className="loading bg-white dark:bg-zinc-900 text-black dark:text-white">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SupabaseProvider>
            <AuthProvider>
                <main id="skip">{children}</main>
            </AuthProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
