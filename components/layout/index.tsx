"use client"

import Footer from '@/components/footer/FooterAdmin';
import Navbar from '@/components/navbar/NavbarAdmin';
import { routes } from '@/components/routes';
import Sidebar from '@/components/sidebar/Sidebar';
import { Toaster } from '@/components/ui/toaster';
import { getActiveRoute } from '@/utils/navigation';
import { usePathname } from 'next/navigation';
import {
  OpenContext,
  UserContext,
  UserDetailsContext,
  WalletContext
} from '@/contexts/layout';
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/hooks/use-auth';

interface Props {
  children: React.ReactNode;
  title: string;
  description: string;
}

const DashboardLayout: React.FC<Props> = (props: Props) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const userDetails = auth?.userDetails;
  const walletBalance = auth?.walletBalance || 0;
  const isLoading = auth?.isLoading || false;
  const [isLoadingState, setIsLoadingState] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setIsLoadingState(false);
    }
  }, [isLoading]);

  if (isLoadingState) {
    return <div>Loading...</div>;
  }

  // Create a wallet object that matches our context type
  const wallet = user ? {
    id: '',
    user_id: user.id,
    balance: walletBalance,
    created_at: '',
    updated_at: ''
  } : null;

  return (
    <UserContext.Provider value={user}>
      <UserDetailsContext.Provider value={userDetails}>
        <WalletContext.Provider value={wallet}>
          <OpenContext.Provider value={{ open, setOpen }}>
            <div className="dark:bg-background-900/10 flex h-full w-full bg-white/10">
              <Toaster />
              <Sidebar 
                routes={routes} 
                userDetails={userDetails} 
                setOpen={setOpen} 
              />
              <div className="h-full w-full dark:bg-zinc-950 py-4">
                <main
                  className={`mx-2.5 flex-none transition-all dark:bg-zinc-950 md:pr-2 xl:ml-[328px]`}
                >
                  <div className="mx-auto min-h-screen p-2 !pt-[90px] md:p-2 md:!pt-[118px]">
                    {props.children}
                  </div>
                  <Navbar brandText={getActiveRoute(routes, pathname)} />
                  <div className="p-3">
                    <Footer />
                  </div>
                </main>
              </div>
            </div>
          </OpenContext.Provider>
        </WalletContext.Provider>
      </UserDetailsContext.Provider>
    </UserContext.Provider>
  );
};

export default DashboardLayout;
