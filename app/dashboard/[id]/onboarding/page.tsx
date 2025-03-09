import { redirect } from 'next/navigation';
import { getUserDetails, getUser } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';
import NewUserBoarding from '@/components/dashboard/settings/user-boarding';

export default async function Onboarding() {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect(`/dashboard/auth`);
  }

  if (userDetails?.onboarding_completed) {
    return redirect(`/dashboard/main`);
  }

  return (
    <NewUserBoarding user={user} userDetails={userDetails} />
  );
}
