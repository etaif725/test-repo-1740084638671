"use server"

import { Database } from '@/types/types_db';
import { createServerComponentClient, SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { cache } from 'react';

export const createServerSupabaseClient = cache(() =>
  createServerComponentClient<Database>({ cookies })
);

export const getUser = cache(async (supabase: SupabaseClient<Database>) => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});