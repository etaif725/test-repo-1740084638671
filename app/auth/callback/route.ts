import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';

export async function GET(request: NextRequest) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the `@supabase/ssr` package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/dashboard/auth`,
          error.name,
          "Sorry, we weren't able to log you in. Please try again."
        )
      );
    }

    // Redirect to the user-specific dashboard
    if (data?.user) {
      return NextResponse.redirect(
        getStatusRedirect(
          `${requestUrl.origin}/dashboard/${data.user.id}/main`,
          'Success!',
          'You are now signed in.'
        )
      );
    }
  }

  return NextResponse.redirect(
    getErrorRedirect(
      `${requestUrl.origin}/dashboard/auth`,
      'Auth Error',
      'No code provided'
    )
  );
}
