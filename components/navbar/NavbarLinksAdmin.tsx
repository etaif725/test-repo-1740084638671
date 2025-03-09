'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { OpenContext } from '@/contexts/layout';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';
import { FiAlignJustify } from 'react-icons/fi';
import {
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineArrowRightOnRectangle
} from 'react-icons/hi2';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function HeaderLinks(props: { [x: string]: any }) {
  const { open, setOpen } = useContext(OpenContext);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const supabase = createClientComponentClient();
  
  const onOpen = () => {
    setOpen(true);
  };

  // Ensures this component is rendered only on the client
  useEffect(() => {
    setMounted(true);
    
    // Check if user is authenticated
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    checkUser();
  }, [supabase]);

  const handleSignOut = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  if (!mounted) return null;
  
  return (
      <div className="relative flex items-center justify-end min-w-max gap-1 rounded-full md:px-2 md:py-2 md:pl-3 xl:gap-2 z-50">
        <Button
          variant="outline"
          className="flex h-9 min-w-9 cursor-pointer rounded-full border-zinc-200 p-0 text-xl text-zinc-950 dark:border-zinc-800 dark:text-white md:min-h-10 md:min-w-10 xl:hidden"
          onClick={onOpen}
        >
          <FiAlignJustify className="h-4 w-4 stroke-2" />
        </Button>
        <Button
          variant="outline"
          className="flex h-9 min-w-9 cursor-pointer rounded-full border-zinc-200 p-0 text-xl text-zinc-950 dark:border-zinc-800 dark:text-white md:min-h-10 md:min-w-10"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'light' ? (
            <HiOutlineMoon className="h-4 w-4 stroke-2" />
          ) : (
            <HiOutlineSun className="h-5 w-5 stroke-2" />
          )}
        </Button>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-full">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex flex-col p-2">
                <div className="mb-2 px-2 text-sm">{user.email}</div>
                <Button 
                  variant="ghost" 
                  className="justify-start" 
                  onClick={handleSignOut}
                >
                  <HiOutlineArrowRightOnRectangle className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="outline"
            className="hidden sm:flex"
            onClick={() => router.push('/dashboard/auth')}
          >
            Sign In
          </Button>
        )}
      </div>
  );
}
