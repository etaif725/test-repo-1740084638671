import { getUserDetails, getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { NewVoiceAgentRT } from '@/components/dashboard/ai-employees/voice-agents/create/rt';

export default async function aiEmployeesVoiceAgents() {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect(`/dashboard/auth`);
  }

  return <NewVoiceAgentRT user={user} userDetails={userDetails} />
}
