import { getUserDetails, getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { KbUpload } from '@/components/dashboard/knowledge-base/components/kb-upload';

export default async function KnowledgeBase() {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect(`/dashboard/auth`);
  }

  return (
    <KbUpload 
      user={user}
      userDetails={userDetails}
    />
  )
}