/*eslint-disable*/
import DashboardLayout from '@/components/layout';
import { User } from '@supabase/supabase-js';
import Contacts from '@/app/dashboard/[id]/contacts/page';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null | any;
}

export default function ContactsPage(props: Props) {
  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="Contacts"
      description="Manage your contacts"
    >
      <div className="h-full w-full mt-12">
        
      </div>
    </DashboardLayout>
  );
}
