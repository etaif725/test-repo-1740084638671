import DefaultAuth from '@/components/auth';
import AuthUI from '@/components/auth/AuthUI';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import {
  getAuthTypes,
  getViewTypes,
  getDefaultSignInView,
  getRedirectMethod
} from '@/utils/auth-helpers/settings';

export default async function SignIn({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { disable_button: boolean; error?: string; error_description?: string };
}) {
  // Await params and searchParams
  const awaitedParams = await params;
  const awaitedSearchParams = await searchParams;
  
  const { allowOauth, allowEmail, allowPassword } = getAuthTypes();
  const viewTypes = getViewTypes();
  const redirectMethod = getRedirectMethod();

  // Declare 'viewProp' and initialize with the default value
  let viewProp: string;

  // Assign url id to 'viewProp' if it's a valid string and ViewTypes includes it
  if (typeof awaitedParams.id === 'string' && viewTypes.includes(awaitedParams.id)) {
    viewProp = awaitedParams.id;
  } else {
    const preferredSignInView =
      (await cookies()).get('preferredSignInView')?.value || null;
    viewProp = getDefaultSignInView(preferredSignInView);
    return redirect(`/dashboard/auth/${viewProp}`);
  }

  // Check if the user is already logged in and redirect to the account page if so
  const supabase = createClient();

  const {
    data: { user }
  } = await (await supabase).auth.getUser();

  if (user && viewProp !== 'update_password') {
    return redirect(`/dashboard/`);
  } else if (!user && viewProp === 'update_password') {
    return redirect(`/dashboard/auth`);
  }

  return (
    <DefaultAuth viewProp={viewProp}>
      <div>
        <AuthUI
          viewProp={viewProp}
          user={user}
          allowPassword={allowPassword}
          allowEmail={allowEmail}
          redirectMethod={redirectMethod}
          allowOauth={allowOauth}
        />
      </div>
    </DefaultAuth>
  );
}
