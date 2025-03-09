'use client';

import { Button } from '../ui/button';
import Links from '@/components/sidebar/components/Links';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { IRoute, User } from '@/types/types';
import { useRouter } from 'next/navigation';
import React, { PropsWithChildren, useContext, useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import { HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import { UserContext, UserDetailsContext, WalletContext } from '@/contexts/layout';
import SidebarBalances from './components/SidebarBalances';
import SidebarPlans from '@/components/sidebar/components/SidebarPlans';
import Link from 'next/link';
import { OpenContext } from '@/contexts/layout';
import { Divider, useTheme } from '@mui/material';
import { AuthContext } from '@/hooks/use-auth';

export interface SidebarProps extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
  setOpen: (open: boolean) => void;
  userDetails: User | null;
}

function Sidebar(props: SidebarProps) {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;
  const { routes } = props;
  const defaultAvatar = '/assets/default-user.webp';
  const { open, setOpen } = useContext(OpenContext);
  
  // Use the auth hook to access authentication data
  const auth = useContext(AuthContext);
  const isLoading = auth?.isLoading || false;
  
  // Use auth user details as the primary source
  const userDetails = auth?.userDetails || props.userDetails;

  const [avatar, setAvatar] = useState(defaultAvatar);
  
  const theme = useTheme();
  const [BrandIcon, setBrandIcon] = useState('/img/light/brand/favicon.webp');

  useEffect(() => {
    if (theme.palette.mode === 'dark') {
      setBrandIcon('/img/light/brand/favicon.webp');
    } else {
      setBrandIcon('/img/dark/brand/favicon.webp');
    }
  }, [theme]);

  const handleSignOut = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    try {
      await auth?.signOut();
      // The router.push is handled in the signOut function of useAuth
    } catch (error) {
      console.error('Error signing out:', error);
      // You might want to show a toast notification here
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="fixed h-[100vh] w-[300px] transition-all">
        <Card className="h-full w-full overflow-hidden !rounded-lg border-zinc-200 pe-4 text-black dark:text-white dark:border-zinc-800 sm:my-4 sm:mr-4 md:m-5 md:mr-[-50px] bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl glass-morphism">
          <div className="flex h-full items-center justify-center">
            <div className="animate-pulse">Loading...</div>
          </div>
        </Card>
      </div>
    );
  }
  
  // SIDEBAR
  return (
    <div
      className={`lg:!z-99 fixed !z-[99] h-[100vh] w-[300px] transition-all md:!z-[99] xl:!z-0
        transition-all ${
        props.variant === 'auth' ? 'xl:hidden' : 'xl:block'
      } ${open ? '' : '-translate-x-[100%] xl:translate-x-[unset]'}`}   
    >
      <Card
        className={`h-full w-full overflow-hidden !rounded-lg border-zinc-200 pe-4 text-black dark:text-white dark:border-zinc-800 sm:my-4 sm:mr-4 md:m-5 md:mr-[-50px] bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl glass-morphism transform transition-transform duration-300 ease-in-out`}
      >
          <div className="flex h-full flex-col justify-between ml-4">
            <div>
              <div className={`mt-6 flex items-center justify-between md:justify-center`}>
                <div className="me-2 flex h-[40px] w-[40px] items-center justify-center rounded-md text-white dark:text-zinc-950">
                  <img src={BrandIcon} alt="DialWise AI" className="h-full w-full" />
                </div>
                <h5 className="me-2 text-4xl font-black leading-2 text-zinc-950 dark:text-white">
                  DIALWISE
                </h5>
                <span
                className="p-2 items-center rounded-full dark:bg-black dark:hover:bg-zinc-700/60 bg-gray-100 hover:bg-gray-200 block cursor-pointer text-black dark:text-white xl:hidden"
                onClick={() => setOpen(false)}
              >
                <HiX />
              </span>
              </div>

              <Divider className="mt-4 mb-2" sx={{borderColor: 'inherit'}} />
              {/* Nav item */}
              <ul>
                <Links routes={routes} />
              </ul>
            </div>
            {/* Card */}
            <div className="mb-9 mt-7">
              <div className="flex justify-center">
                <SidebarBalances />
              </div>
              <div className="hidden md:block mt-5 flex justify-center">
                <SidebarPlans />
              </div>

              {/* Sidebar profile info */}
              <div className="mt-5 flex w-full items-center rounded-lg border p-4 border-zinc-200 dark:border-white/10 text-black dark:text-white text-sm font-medium focus:dark:!bg-white/20 active:dark:!bg-white/20">
                <Link href={`/dashboard/${userDetails?.id}/settings`}>
                  <Avatar className="min-h-10 min-w-10">
                    <AvatarImage src={avatar} className="h-10 w-10" />
                    <AvatarFallback className="font-bold dark:text-black">
                      {userDetails?.full_name?.split(' ')[0]
                        ? `${userDetails?.full_name?.split(' ')[0][0]}`
                        : `${userDetails?.id}`
                      }
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Link href={`/dashboard/${userDetails?.id}/settings`}>
                  <p className="ml-2 mr-3 flex items-center text-sm font-semibold leading-none text-black dark:text-white">
                    {userDetails?.full_name || 'User'}
                  </p>
                </Link>
                <Button
                  onClick={(e) => handleSignOut(e)}
                  variant="outline"
                  className="ml-auto flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full p-0 text-center text-sm font-medium hover:dark:text-white"
                  type="submit"
                >
                  <HiOutlineArrowRightOnRectangle
                    className="h-4 w-4 stroke-2 text-zinc-950 dark:text-white"
                    width="16px"
                    height="16px"
                    color="inherit"
                  />
                </Button>
              </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Sidebar;
