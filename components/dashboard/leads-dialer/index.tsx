/*eslint-disable*/
'use client';

import DashboardLayout from '@/components/layout';
import { User } from '@supabase/supabase-js';
import { DialerDashboardRT } from './components/DialerDashboard-rt';
interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null | any;
}

export default function LeadsDialer(props: Props) {
  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="Leads Dialer"
      description="Let your leads dial themselves"
    >
      <div className="h-full w-full mt-12">
        <DialerDashboardRT />
      </div>
    </DashboardLayout>
  );
}
