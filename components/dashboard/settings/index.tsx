/*eslint-disable*/
'use client';

import DashboardLayout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User } from '@supabase/supabase-js';
import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/utils/supabase/client';
import { getURL, getStatusRedirect } from '@/utils/helpers';
import Notifications from './components/notification-settings';
import { Input } from '@/components/ui/input';
import Credentials from '@/components/credentials';
import LeadsDialerSettings from './components/leadsdialer-settings';
import { AuthContext } from '@/hooks/use-auth';

const supabase = createClient();

export default function Settings() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  
  // Input States
  const [nameError, setNameError] = useState<{
    status: boolean;
    message: string;
  }>();
  console.log(user);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    // Check if the new email is the same as the old email
    if (e.currentTarget.newEmail.value === user?.email) {
      e.preventDefault();
      setIsSubmitting(false);
      return;
    }
    // Get form data
    const newEmail = e.currentTarget.newEmail.value.trim();
    const callbackUrl = getURL(
      getStatusRedirect(
        `/dashboard/${user?.id}/settings`,
        'Success!',
        `Your email has been updated.`
      )
    );
    e.preventDefault();
    const { error } = await supabase.auth.updateUser(
      { email: newEmail },
      {
        emailRedirectTo: callbackUrl
      }
    );
    router.push(`/dashboard/${user?.id}/settings`);
    setIsSubmitting(false);
  };

  const handleSubmitName = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    // Check if the new name is the same as the old name
    if (e.currentTarget.fullName.value === user?.user_metadata.full_name) {
      e.preventDefault();
      setIsSubmitting(false);
      return;
    }
    // Get form data
    const fullName = e.currentTarget.fullName.value.trim();

    const { error } = await supabase
      .from('users')
      .update({ full_name: fullName })
      .eq('id', user?.id);
    if (error) {
      console.log(error);
    }
    e.preventDefault();
    supabase.auth.updateUser({
      data: { full_name: fullName }
    });
    router.push(`/dashboard/${user?.id}/settings`);
    setIsSubmitting(false);
  };

  return (
    <DashboardLayout
      title="Account Settings"
      description="Profile settings."
    >
      <div className="w-full h-full">
        <div className="w-full h-full">
          <Card
            className={
              'mb-5 flex items-center justify-start w-full py-8 px-4 dark:border-zinc-800'
            }
          >
            <Avatar className="min-h-[68px] min-w-[68px]">
              <AvatarImage src={user?.user_metadata.avatar_url} />
              <AvatarFallback className="text-2xl font-bold text-black dark:text-zinc-950">
                {user?.user_metadata.full_name
                  ? `${user?.user_metadata.full_name[0].toUpperCase()}`
                  : `${user?.email[0].toUpperCase()}`}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-extrabold text-zinc-950 leading-[100%] text-black dark:text-white pl-4 md:text-3xl">
                {user?.user_metadata.full_name}
              </p>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 md:mt-2 pl-4 md:text-base">
                Account Tier: {user?.user_metadata?.tier ? user?.user_metadata?.tier : 'Trial'}
              </p>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 md:mt-2 pl-4 md:text-base">
                Account ID: {user?.id}
              </p>
            </div>
          </Card>
          <Card
            className={
              'mb-5 w-full pt-8 pb-6 px-6 dark:border-zinc-800'
            }
          >
            <p className="text-xl font-extrabold text-zinc-950 dark:text-white md:text-3xl">
              Account Details
            </p>
            <p className="mb-6 mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 md:mt-4 md:text-base">
              Here you can change your account information
            </p>
            <label
              className="mb-3 flex cursor-pointer px-2.5 font-bold leading-none text-zinc-950 dark:text-white"
              htmlFor={'name'}
            >
              Your Name
              <p className="ml-1 mt-[1px] text-sm font-medium leading-none text-zinc-500 dark:text-zinc-400">
                (30 characters maximum)
              </p>
            </label>
            <div className="mb-8 flex flex-col md:flex-row">
              <form
                className="w-full"
                id="nameForm"
                onSubmit={(e) => handleSubmitName(e)}
              >
                <Input
                  type="text"
                  name="fullName"
                  defaultValue={user?.user_metadata.full_name ?? ''}
                  placeholder="Please enter your full name"
                  className={`mb-2 mr-4 flex h-full w-full px-4 py-4 outline-none md:mb-0`}
                />
              </form>
              <Button
                className="flex h-full max-h-full w-full items-center justify-center rounded-lg px-4 py-4 text-base font-medium md:ms-4 md:w-[300px] text-white font-semibold bg-green-600 hover:bg-green-700"
                form="nameForm"
                type="submit"
              >
                Update name
              </Button>
              <div className="mt-8 h-px w-full max-w-[90%] self-center bg-zinc-200 dark:bg-white/10 md:mt-0 md:hidden" />
            </div>
            <p
              className={`mb-5 px-2.5 text-red-500 md:px-9 ${
                nameError?.status ? 'block' : 'hidden'
              }`}
            >
              {nameError?.message}
            </p>
            <label
              className="mb-3 ml-2.5 flex cursor-pointer px-2.5 font-bold leading-none text-zinc-950 dark:text-white"
              htmlFor={'email'}
            >
              Your Email
              <p className="ml-1 mt-[1px] text-sm font-medium leading-none text-zinc-500 dark:text-zinc-400">
                (Please contact support to change your email)
              </p>
            </label>

            <div className="mb-8 flex flex-col md:flex-row">
              <form
                className="w-full"
                id="emailForm"
                onSubmit={(e) => handleSubmitEmail(e)}
              >
                <Input
                  placeholder="Please enter your email"
                  defaultValue={user?.email ?? ''}
                  type="text"
                  name="newEmail"
                  className={`mr-4 flex h-full max-w-full w-full items-center justify-center px-4 py-4 outline-none`}
                />
              </form>
              <Button
                className="flex h-full max-h-full w-full items-center justify-center rounded-lg px-4 py-4 text-base md:ms-4 font-medium md:w-[300px] text-white font-semibold bg-zinc-600 hover:bg-zinc-700"
                type="submit"
                form="emailForm"
                disabled={true}
              >
                Update email
              </Button>
            </div>
          </Card>
          {/* <Notifications notifications={notifications} /> */}
          <Credentials />
          {/* Leads Dialer Settings */}
          <LeadsDialerSettings />
        </div>
      </div>
    </DashboardLayout>
  );
}
