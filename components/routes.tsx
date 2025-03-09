// Auth Imports
import { IRoute } from '@/types/types';

import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineCog8Tooth,
  HiOutlineCreditCard,
  HiOutlineSparkles,
  HiOutlineBookOpen,
  HiOutlinePhone,
  HiOutlineQuestionMarkCircle,
  HiOutlineUser,
  HiOutlineUserGroup
} from 'react-icons/hi2';

export const getRoutePath = (basePath: string, id: string, category: string) => {
  return basePath.replace(':id', id).replace(':category', category);
};

export const routes: IRoute[] = [
  {
    name: 'Dashboard',
    path: '/dashboard/[id]/main',
    icon: <HiOutlineHome className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false,
    disabled: false,
    category: 'dashboard'
  },
  {
    name: 'Onboarding',
    path: '/dashboard/[id]/onboarding',    
    icon: <HiOutlinePhone className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false,
    disabled: false,
    invisible: true,
    category: 'settings'
  },
  {
    name: 'Auto Dialer',
    path: '/dashboard/[id]/leads-dialer',
    icon: (
      <HiOutlinePhone className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false,
    disabled: false,
    category: 'dashboard'
  },
  {
    name: 'Contacts',
    path: '/dashboard/[id]/contacts',
    icon: (
      <HiOutlineUserGroup className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false,
    disabled: false,
    category: 'dashboard'
  },
  {
    name: 'AI Employees',
    path: '/dashboard/[id]/ai-employees',
    icon: <HiOutlineUsers className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false,
    disabled: false,
    category: 'ai-employees'
  },
  {
    name: 'Create Voice Agent',
    path: '/dashboard/[id]/ai-employees/voice-agents/create/',
    icon: <HiOutlineUsers className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false,
    disabled: false,
    invisible: true,
    category: 'ai-employees'
  },
  {
    name: 'Knowledge Base',
    path: '/dashboard/[id]/knowledge-base',
    icon: (
      <HiOutlineBookOpen className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false,
    disabled: false,
    category: 'ai-employees'
  },
  {
    name: 'Playground',
    path: '/dashboard/[id]/playground',
    icon: (
      <HiOutlineSparkles className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false,
    disabled: false,
    category: 'ai-employees'
  },
  {
    name: 'Credits & Billing',
    path: '/dashboard/[id]/billing',
    icon: (
      <HiOutlineCreditCard className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false,
    disabled: false,
    category: 'settings'
  },
  {
    name: 'Settings',
    path: '/dashboard/[id]/settings',
    icon: (
      <HiOutlineCog8Tooth className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false,
    disabled: false,
    category: 'settings'
  },
  {
    name: 'Help & Support',
    path: '/dashboard/[id]/helpdesk',
    icon: (
      <HiOutlineQuestionMarkCircle className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false,
    disabled: false,
    category: 'settings'
  }
];
