import { getUserDetails, getUser } from '@/utils/supabase/queries';
import Bgdark from '@/public/img/dark/ai-chat/bg-image.png';
import Bg from '@/public/img/light/ai-chat/bg-image.png';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import DashboardLayout from '@/components/layout';
import { User } from '@supabase/supabase-js';
import { useTheme } from 'next-themes';
import { KbUpload } from './components/kb-upload';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

export default async function KnowledgeBase() {
  const supabase = await createClient();
  const { theme, setTheme } = useTheme();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  if (!user) {
    return redirect('/dashboard/auth');
  }

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title="Knowledge Base"
      description="Explore our knowledge base for helpful articles and resources"
    >
      <div className="relative flex w-full flex-col pt-[20px] md:pt-0">
        <img
          width="340"
          height="181"
          src={theme === 'dark' ? Bgdark.src : Bg.src}
          className="absolute left-[20%] top-[50%] z-[-2] w-[200px] translate-y-[-50%] md:left-[35%] lg:left-[38%] xl:left-[38%] xl:w-[350px] z-[0]"
          alt=""
        />
          {/* Main Box */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <KbUpload user={user} userDetails={userDetails} />
            </div>
            <div className="mt-0 lg:mt-0 lg:pl-0 flex flex-col">
            </div>
          </div>
        </div>
    </DashboardLayout>
  )
}
