import { getUserDetails, getUser } from '@/utils/supabase/queries';

import { PromptContainer } from '@/components/dashboard/playground';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function Playground() {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect(`/dashboard/auth`);
  }

  return <PromptContainer 
    user={user}
    userDetails={userDetails} />;
}
