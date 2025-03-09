'use client';
import AdminNavbarLinks from './NavbarLinksAdmin';
import NavLink from '@/components/navbar/NavLink';
import { getBreadcrumbs } from '@/utils/navigation';
import { usePathname } from 'next/navigation';
import { routes } from '@/components/routes';
import { AuthContext } from '@/hooks/use-auth';
import { useContext } from 'react';

export default function AdminNavbar(props: {
  brandText: string;
  [x: string]: any;
}) {
  const { brandText } = props;
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(routes, pathname);
  const auth = useContext(AuthContext);
  const user = auth?.user;
  
  return (
    <nav
      className={`px-6 fixed top-3 z-[0] flex w-[calc(100vw_-_6%)] flex-row items-center 
        justify-between border border-1 border-rounded-lg rounded-lg bg-white/50 dark:bg-zinc-900/50 py-2 backdrop-blur-xl 
        transition-all dark:bg-transparent md:right-[calc(100vw_-_99.5%)] md:top-4 md:w-[calc(100vw_-_8%)] md:p-2 lg:w-[calc(100vw_-_6%)] xl:top-[20px] xl:w-[calc(100vw_-_365px)] 2xl:w-[calc(100vw_-_380px)]`}
    >
      <div className="ml-[6px] mb-2">
        <div className="h-6 md:mb-2 md:w-[224px] md:pt-1">
          <a
            className="hidden text-xs font-normal text-zinc-950 hover:underline dark:text-white dark:hover:text-white md:inline"
            href={`/`}
          >
            Home
            <span className="mx-1 text-xs text-zinc-950 hover:text-zinc-950 dark:text-white">
              {' '}
              /{' '}
            </span>
          </a>
          <NavLink
            className="text-xs font-normal capitalize text-zinc-950 hover:underline dark:text-white dark:hover:text-white"
            href='#'
          >
            {brandText}
          </NavLink>
        </div>
        <p className="text-md shrink capitalize text-zinc-950 dark:text-white md:text-3xl">
          <NavLink
            href='#'
            className="font-bold capitalize hover:text-zinc-950 dark:hover:text-white"
          >
            {brandText}
          </NavLink>
        </p>
      </div>
      <div className="w-[154px] min-w-max md:ml-auto md:w-[unset]">
        <AdminNavbarLinks />
      </div>
    </nav>
  );
}
