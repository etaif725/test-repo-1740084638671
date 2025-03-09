import { createBrowserClient } from '@supabase/ssr';
import { CookieOptions } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'sb-auth',
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
      cookieEncoding: 'base64url',
    }
  );
}

// Debug auth state
const supabase = createClient();

supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase Auth State Change:', { 
    event, 
    hasSession: !!session,
    accessToken: session?.access_token ? 'present' : 'missing',
  });
});

// Export a function to check auth state
export const getAuthDebugInfo = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  const { data: { user } } = await supabase.auth.getUser();
  
  return {
    session,
    user,
    error,
    hasValidSession: !!session?.access_token,
    accessToken: session?.access_token ? 'present' : 'missing',
  };
};
