import { createContext } from 'react';
import { User } from '@supabase/supabase-js';

interface OpenContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UserDetails {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  credits: number;
  billing_address: any | null;
  created_at: string;
  updated_at: string;
}

interface WalletDetails {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export const OpenContext = createContext<OpenContextType>(undefined as unknown as OpenContextType);
export const UserContext = createContext<User | undefined | null>(undefined);
export const UserDetailsContext = createContext<UserDetails | undefined | null>(
  undefined
);
export const WalletContext = createContext<WalletDetails | undefined | null>(
  undefined
);
