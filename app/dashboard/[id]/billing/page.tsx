import { getUserDetails, getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import BillingDashboard from '@/components/dashboard/billing';

export default async function Playground() {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect(`/dashboard/auth`);
  }

  return <BillingDashboard user={user} userDetails={userDetails} />
}
