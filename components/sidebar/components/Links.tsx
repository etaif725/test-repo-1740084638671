'use client';

/* eslint-disable */
import NavLink from '@/components/navbar/NavLink';
import { IRoute } from '@/types/types';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useCallback, useContext } from 'react';
import { Divider } from '@mui/material';
import { AuthContext } from '@/hooks/use-auth';

interface SidebarLinksProps extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

export function SidebarLinks(props: SidebarLinksProps) {
  const pathname = usePathname();
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const { routes } = props;

  // verifies if routeName is the one active (in browser input)
  const activeRoute = useCallback(
    (routePath: string) => {
      // Convert route path pattern to regex pattern
      const pattern = routePath.replace('[id]', '[^/]+')
      return pathname?.match(new RegExp(pattern))
    },
    [pathname]
  );
  const activeLayout = useCallback(
    (routeName: string) => {
      return pathname?.includes('/');
    },
    [pathname]
  );

  // Group routes by category
  const crmRoutes = routes.filter(route => route.category === 'dashboard');
  const aiRoutes = routes.filter(route => route.category === 'ai-employees');
  const settingsRoutes = routes.filter(route => route.category === 'settings');
  const otherRoutes = routes.filter(route => 
    ![...crmRoutes, ...aiRoutes, ...settingsRoutes].includes(route)
  );

  // this function creates the links and collapses that appear in the sidebar (left menu)
  const createLinks = (routes: IRoute[]) => {
    return routes.map((route, key) => {
      if (route.disabled) {
        return (
          <div
            key={key}
            className={`flex w-full max-w-full cursor-not-allowed items-center justify-between rounded-lg py-2 pl-6 font-medium`}
          >
            <div className="w-full items-center justify-center">
              <div className="flex w-full items-center justify-center">
                <div
                  className={`text mr-3 mt-1.5 opacity-30 text-black dark:text-white`}
                >
                  {route.icon}
                </div>
                <p
                  className={`mr-auto text-sm opacity-30 text-black dark:text-white`}
                >
                  {route.name}
                </p>
              </div>
            </div>
          </div>
        );

      } else if (route.invisible) {
        return null;
        
      } else {
        return (
          <div key={key}>
            <div
              className={`flex w-full max-w-full items-center justify-between rounded-lg py-2 pl-6 space-y-2 ${
                activeRoute(route.path.toLowerCase())
                  ? 'bg-gradient-to-r from-gray-200 dark:from-zinc-700 to-transparent font-semibold text-white'
                  : 'font-medium text-white hover:bg-gradient-to-r from-gray-200 dark:from-zinc-700 to-transparent font-semibold'
              }`}
            >
              <NavLink
                href={route.layout ? route.layout + route.path : route.path}
                key={key}
                styles={{ width: '100%' }}
              >
                <div className="w-full items-center justify-center">
                  <div className="flex w-full items-center justify-center">
                    <div
                      className={`text mr-3 mt-1.5 ${
                        activeRoute(route.path.toLowerCase())
                          ? 'font-semibold text-black dark:text-white'
                          : 'text-black dark:text-white'
                      } `}
                    >
                      {route.icon}
                    </div>
                    <p
                      className={`mr-auto text-md ${
                        activeRoute(route.path.toLowerCase())
                          ? 'font-semibold text-black dark:text-white'
                          : 'font-medium text-black dark:text-white'
                      }`}
                    >
                      {route.name}
                    </p>
                  </div>
                </div>
              </NavLink>
            </div>
          </div>
        );
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow">
        
        {/* CRM Section */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 p-4">Dashboard</p>
        {createLinks(crmRoutes)}
        
        {/* AI Section */}
        <Divider className="mt-4 mb-2" sx={{borderColor: 'inherit'}} />
        <p className="text-xs text-zinc-500 dark:text-zinc-400 p-4">AI Employees</p>
        {createLinks(aiRoutes)}
      </div>

      {/* Settings Section - Pushed to bottom */}
      <div className="my-auto">
        <Divider className="mt-4 mb-2" sx={{borderColor: 'inherit'}} />
        <p className="text-xs text-zinc-500 dark:text-zinc-400 p-4">Settings</p>
        {createLinks(settingsRoutes)}
      </div>
    </div>
  );
}

export default SidebarLinks;
