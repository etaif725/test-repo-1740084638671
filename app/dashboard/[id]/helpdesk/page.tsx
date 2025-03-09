import { getUserDetails, getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import HelpdeskDashboard from '@/components/dashboard/helpdesk';

export default async function Playground() {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect(`/dashboard/auth`);
  }

  return <HelpdeskDashboard user={user} userDetails={userDetails} />
}
