import { getUserDetails, getUser } from '@/utils/supabase/queries';

import Chat from '@/components/dashboard/ai-chat';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function AiChat() {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect(`/dashboard/auth`);
  }

  return <Chat user={user} userDetails={userDetails} apiKey={userDetails?.api_key} model={userDetails?.model} />;
}
