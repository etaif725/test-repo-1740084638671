import { getUserDetails, getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import LeadsDialer from '@/components/dashboard/leads-dialer';

export default async function LeadsDialerPage() {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect(`/dashboard/auth`);
  }

  return (
    <LeadsDialer user={user} userDetails={userDetails} />
  )
}