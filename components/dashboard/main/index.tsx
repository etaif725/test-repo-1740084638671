/*eslint-disable*/
"use client";

import { useEffect, useState, useContext } from 'react';
import DashboardLayout from '@/components/layout';
import { Typography } from '@mui/material';
import { Box } from '@mui/material';
import { MainDashboardCallHistory } from './cards/MainDashboard-vp';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AuthContext } from '@/hooks/use-auth';

export default function Main() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const userDetails = auth?.userDetails;
  const isLoading = auth?.isLoading || false;
  const [credits, setCredits] = useState<number>(0);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user) {
      // Fetch user credits from the users table
      const fetchUserCredits = async () => {
        const { data, error } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single();
          
        if (!error && data) {
          setCredits(data.credits || 0);
        } else {
          console.error('Error fetching user credits:', error);
        }
      };

      fetchUserCredits();
    }
  }, [user, supabase]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout
      title="Dashboard"
      description="View your call history and account information"
    >
      <div className="h-full w-full">
        {/* Welcome Card */}
        <div className="h-full w-full">
          <Box display="flex" flexDirection="column" sx={{ height: "100%" }}>
            <Box display="flex" flexDirection="column" mb="auto">
              <Typography className="mx-3 mt-4 mb-12 text-4xl font-bold text-black dark:text-white items-center text-center md:text-start">
                👋 Welcome back, {userDetails?.full_name?.split(' ')[0] || 'User'}
              </Typography>
              <Typography className="mx-3 mb-4 text-lg text-gray-700 dark:text-gray-300">
                Current credits: {credits}
              </Typography>
            </Box>
          </Box>
        </div>
        {/* Call History */}
        <div className="h-full w-full">
          <MainDashboardCallHistory />
        </div>
      </div>
    </DashboardLayout>
  );
}
