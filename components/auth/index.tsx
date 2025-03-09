'use client';

import { Button } from '../ui/button';
import Footer from '@/components/footer/FooterAuthDefault';
import { Divider } from '@mui/material';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { PropsWithChildren, useEffect, useState } from 'react';
import { FaChevronLeft } from 'react-icons/fa6';
import { HiBolt } from 'react-icons/hi2';
import { IoMoon, IoSunny } from 'react-icons/io5';

interface DefaultAuthLayoutProps extends PropsWithChildren {
  children: JSX.Element;
  viewProp: any;
}

export default function DefaultAuthLayout(props: DefaultAuthLayoutProps) {
  const { children } = props;
  const [mounted, setMounted] = useState(false);
  const BrandIcon = {
    light: '/img/dark/brand/favicon.webp',
    dark: '/img/light/brand/favicon.webp'
  }

  useEffect(() => {
    setMounted(true);
  }, []);
  const { theme, setTheme } = useTheme();
  if (!mounted) {
    return null;
  }
  return (
    <div className="relative h-max dark:bg-zinc-950">
      <div className="mx-auto flex w-full flex-col justify-center px-5 pt-0 md:h-[unset] md:max-w-[66%] lg:h-[100vh] lg:max-w-[66%] lg:px-6 xl:pl-0 ">
        <Link className="mt-10 w-fit text-zinc-950 dark:text-white" href={`https://app.dialwise.ai`}>
          <div className="flex w-fit items-center lg:pl-0 lg:pt-0 xl:pt-0">
            <FaChevronLeft className="mr-3 h-[13px] w-[8px] text-zinc-950 dark:text-white" />
            <p className="ml-0 text-sm text-zinc-950 dark:text-white">
              Back to the website
            </p>
          </div>
        </Link>
        {children}
        <div className="absolute right-0 hidden h-full min-h-[100vh] xl:block xl:w-[50vw] 2xl:w-[44vw]">
          <div className="absolute flex h-full w-full flex-col items-end justify-center bg-zinc-950 dark:bg-zinc-900">
            <div
              className={`mb-[160px] mt-8 flex w-full items-center justify-center`}
            >
              <div className="me-2 flex h-[76px] w-[76px] items-center justify-center rounded-lg bg-transparent text-zinc-950 dark:text-zinc-900">
                <img src={theme === 'dark' ? BrandIcon.light : BrandIcon.dark} alt="DialWise AI" className="h-full w-full" />
              </div>
              <h5 className="text-4xl font-bold leading-5 text-white">
                DIALWISE AI
              </h5>
            </div>
            <div
              className={`flex w-full flex-col items-center justify-center text-2xl font-bold text-white`}
            >
              <h4 className="mb-5 flex w-[600px] items-center justify-center rounded-md text-center text-2xl font-bold">
                “DialWise has saved us 2-3 hours a day, per employee, while helping us meet our qoutas and increase our KPIs. This is life changing stuff.”
              </h4>
              <h5 className="text-xl font-medium leading-5 text-zinc-300">
                Sofia Davis - CTO @ Tavily
              </h5>
            </div>
          </div>
        </div>
        <div className="my-6">
          <Footer />
        </div>
      </div>
      <Button
        className="absolute bottom-10 right-10 flex min-h-10 min-w-10 cursor-pointer rounded-full bg-zinc-950 p-0 text-xl text-white hover:bg-zinc-950 dark:bg-white dark:text-zinc-950 hover:dark:bg-white xl:bg-white xl:text-zinc-950 xl:hover:bg-white xl:dark:text-zinc-900"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'light' ? (
          <IoMoon className="h-4 w-4" />
        ) : (
          <IoSunny className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
