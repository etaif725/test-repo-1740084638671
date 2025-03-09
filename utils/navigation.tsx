import { IRoute } from '@/types/types'
// NextJS Requirement
export const isWindowAvailable = () => typeof window !== 'undefined'

export const findCurrentRoute = (
  routes: IRoute[],
  pathname: string,
): IRoute | undefined => {
  for (let route of routes) {
    if (route.items) {
      const found = findCurrentRoute(route.items, pathname)
      if (found) return found
    }
    // Update the matching logic to handle dynamic routes
    const routePath = route.path.replace('[id]', '[^/]+')
    if (pathname?.match(new RegExp(routePath)) && route) {
      return route
    }
  }
}

export const getActiveRoute = (routes: IRoute[], pathname: string): string => {
  const route = findCurrentRoute(routes, pathname)
  return route?.name || 'Dashboard'
}

export const getActiveNavbar = (
  routes: IRoute[],
  pathname: string,
  userId: string,
): boolean => {
  const route = findCurrentRoute(routes, pathname)
  if (route?.secondary) return route?.secondary
  else return false
}
  
export const getActiveNavbarText = (
  routes: IRoute[], 
  pathname: string,
  userId: string,
): string | boolean => {
  return getActiveRoute(routes, pathname) || false
}

// Add this new function for breadcrumbs
export const getBreadcrumbs = (routes: IRoute[], pathname: string): { name: string; path: string }[] => {
  const breadcrumbs = [{ name: 'Home', path: '/dashboard' }]
  const currentRoute = findCurrentRoute(routes, pathname)
  
  if (currentRoute) {
    const pathParts = currentRoute.path.split('/')
    const nameParts = ['Dashboard', currentRoute.name]
    
    nameParts.forEach((name, index) => {
      if (name && name !== 'Home') {
        breadcrumbs.push({
          name,
          path: pathParts.slice(0, index + 2).join('/')
        })
      }
    })
  }
  
  return breadcrumbs
}
