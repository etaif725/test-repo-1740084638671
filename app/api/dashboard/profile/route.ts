// app/api/dashboard/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { dashboardService } from '@/services/dashboardServices';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const userId = session.user.id;
    const profileData = await dashboardService.getUserProfile(userId);
    
    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}