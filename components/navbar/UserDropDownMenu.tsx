import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { HiOutlineArrowRightOnRectangle } from 'react-icons/hi2'
import { useRouter } from 'next/navigation'
import { getRedirectMethod } from '@/utils/auth-helpers/settings'
import { HelpCircle, Info, Settings } from 'lucide-react'
import { AccountBox } from '@mui/icons-material'
import { AuthContext } from '@/hooks/use-auth'
import { useContext } from 'react'

function UserDropDownMenu() {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;
  const defaultAvatar = '/assets/default-user.webp';

  // Use the auth hook to access authentication data
  const auth = useContext(AuthContext);
  const user = auth?.user;
  
  const [avatar, setAvatar] = useState(defaultAvatar);
  
  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      setAvatar(user.user_metadata.avatar_url);
    }
  }, [user]);
  
  const handleSignOut = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    await auth?.signOut();
    router?.push('/dashboard/auth');
  };

  return (
    <div className="relative z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-12 w-12 text-black">
            <AvatarImage src={avatar} className="h-12 w-12" />
            <AvatarFallback className="font-bold">
              {user?.user_metadata?.full_name
                ? `${user.user_metadata.full_name[0]}`
                : user?.email
                ? `${user.email[0].toUpperCase()}`
                : 'U'}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="">
          <h3 className="px-2 pt-2 items-center justify-start text-md font-medium text-zinc-950 dark:text-white">
            {user?.user_metadata?.full_name || 'User'} <br />
            <span className="text-sm text-zinc-500">{user?.email}</span>
          </h3>
          <hr className="my-2" />
          <Link href={`/dashboard/${user?.id}/settings`}>
            <Button variant="ghost" className="mb-2 w-full text-black dark:text-white flex items-center justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </Link>
          <Link href={`/dashboard/${user?.id}/billing`}>
            <Button variant="ghost" className="mb-2 w-full text-black dark:text-white flex items-center justify-start">
              <AccountBox className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          </Link>
          <hr className="my-2" />
          <Link href={`/dashboard/${user?.id}/helpdesk`}>
            <Button variant="ghost" className="mb-2 w-full text-black dark:text-white flex items-center justify-start">
              <HelpCircle className="w-4 h-4 mr-2" />
              Help & Support
            </Button>
          </Link>
          <Link href={`/dashboard/${user?.id}/whats-new`}>
            <Button variant="ghost" className="mb-2 w-full text-black dark:text-white flex items-center justify-start">
              <Info className="w-4 h-4 mr-2" />
              What's new?
            </Button>
          </Link>
          <hr className="my-2" />
          <Button
            onClick={(e) => handleSignOut(e)}
            variant="ghost"
            className="mb-2 w-full text-black dark:text-white flex items-center justify-start"
          >
            <HiOutlineArrowRightOnRectangle className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default UserDropDownMenu