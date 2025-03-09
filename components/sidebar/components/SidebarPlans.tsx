'use client';

import { Button } from '@/components/ui/button';
import SidebarImage from '@/public/SidebarBadge.png';
import Image from 'next/image';
import Link from 'next/link';
import { HiSparkles } from 'react-icons/hi2';
import { AuthContext } from '@/hooks/use-auth';
import { useEffect, useState, useContext } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SidebarPlans() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const isAuthenticated = auth?.isAuthenticated || false;
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching subscription:', error);
        } else {
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error in subscription fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchSubscriptionData();
    }
  }, [user, isAuthenticated, supabase]);

  // Don't show upgrade prompt for users who already have a subscription
  if (subscription && ['active', 'trial'].includes(subscription.status)) {
    return null;
  }

  return (
    <div className="relative flex flex-col items-center rounded-lg border border-zinc-200 px-3 py-4 dark:border-white/10">
      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-tl from-green-500 to-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-800 bg-gradient-to-tl from-green-500/10 to-zinc-500/10">
        <HiSparkles className="w-8 h-8 text-black dark:text-white" />
      </div>
      <div className="mb-6 flex w-full flex-col">
        <p className="mb-2.5 text-center text-lg font-bold text-zinc-950 dark:text-white">
          Ready to go PRO?
        </p>
        <p className="text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 focus:dark:!bg-white/20 active:dark:!bg-white/20">
          Upgrade to our Pro/Business plans to unlock bulk-credit discounts, custom tools & integrations, higher limits, and more!
        </p>
      </div>
      <Link
        href="/dashboard/billing"
      >
        <Button className="mt-auto flex h-full w-[200px] items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-black dark:bg-white dark:text-black">
          Upgrade Your Plan
        </Button>
      </Link>
    </div>
  );
}
