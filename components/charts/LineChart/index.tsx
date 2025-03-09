'use client';

import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function ExampleChart(props: any) {
  const { chartData, chartOptions } = props;
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const options = {
    ...chartOptions,
    theme: {
      mode: theme === 'dark' ? 'dark' : 'light'
    },
    colors: theme === 'dark' ? ['#fff'] : ['#000'],
  };

  return (
    <ApexChart
      type="line"
      options={options}
      series={chartData}
      height="100%"
      width="100%"
    />
  );
}
