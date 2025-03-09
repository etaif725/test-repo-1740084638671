import React from 'react';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SavingsIcon from '@mui/icons-material/Savings';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import ChatIcon from '@mui/icons-material/Chat';

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Metric Box Component
interface MetricBoxProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}

const MetricBox = ({ icon, value, label }: MetricBoxProps) => (
  <Grid item xs={12} md={4}>
    <div className="flex flex-col justify-start items-start gap-3 border border-zinc-200 dark:border-zinc-700 p-4 bg-gradient-to-b from-zinc-100/60 to-zinc-200/90 dark:from-zinc-950/80 dark:to-black dark:group-hover:from-black/70 dark:group-hover:to-black/95 backdrop-blur-xl transform transition-all duration-300 rounded-lg hover:shadow-lg">
      <div className="flex items-center gap-2">
        <div className="text-black dark:text-white bg-white/50 dark:bg-zinc-900/50">
          {icon}
        </div>
        <div>
          <Typography variant="h6" className="text-black dark:text-white font-semibold">{value}</Typography>
          <Typography variant="body2" className="text-zinc-600 dark:text-zinc-400">{label}</Typography>
        </div>
      </div>
    </div>
  </Grid>
);

// Statistics Layout Component
export const StatisticsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="p-6">
      {children}
    </div>
  );
};

// Cost Savings Card Component
interface CostSavingsCardProps {
  totalSavings: number;
  monthlySavings: number;
  costPerConversation: number;
}

export const CostSavingsCard = ({ totalSavings, monthlySavings, costPerConversation }: CostSavingsCardProps) => {
  return (
    <Card className="shadow-md shadow-blue-800/25 hover:shadow-lg hover:shadow-blue-500/40 border border-blue-200/50 dark:border-blue-800/10 rounded-lg bg-gradient-to-b from-zinc-100/60 to-zinc-200/90 dark:from-zinc-950/80 dark:to-black dark:group-hover:from-black/70 dark:group-hover:to-black/95 transition-all duration-300">
      <CardContent>
        <Typography variant="h6" className="text-black dark:text-white mb-4 font-semibold">Cost Savings Analysis</Typography>
        <Grid container spacing={3}>
          <MetricBox
            icon={<SavingsIcon />}
            value={formatCurrency(totalSavings)}
            label="Total Savings"
          />
          <MetricBox
            icon={<TrendingUpIcon />}
            value={formatCurrency(monthlySavings)}
            label="Monthly Savings"
          />
          <MetricBox
            icon={<AttachMoneyIcon />}
            value={formatCurrency(costPerConversation)}
            label="Cost Per Conversation"
          />
        </Grid>
      </CardContent>
    </Card>
  );
};

// Cost Analysis Card Component
interface CostAnalysisCardProps {
  humanCosts: {
    hourlyRate: number;
    overheadCost: number;
    costPerCall: number;
    costPerMessage: number;
  };
  aiCosts: {
    creditCost: number;
    platformFees: number;
    costPerCall: number;
    costPerMessage: number;
  };
}

export const CostAnalysisCard = ({ humanCosts, aiCosts }: CostAnalysisCardProps) => {
  return (
    <Card className="shadow-md shadow-green-800/25 hover:shadow-lg hover:shadow-green-500/40 border border-green-200/50 dark:border-green-800/10 rounded-lg bg-gradient-to-b from-zinc-100/60 to-zinc-200/90 dark:from-zinc-950/80 dark:to-black dark:group-hover:from-black/70 dark:group-hover:to-black/95 transition-all duration-300">
      <CardContent>
        <Typography variant="h6" className="text-black dark:text-white mb-4 font-semibold">Cost Comparison</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50">
              <Typography variant="subtitle1" className="text-black dark:text-white mb-3 font-semibold">Human Costs</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" className="text-zinc-600 dark:text-zinc-400">Hourly Rate</Typography>
                  <Typography className="text-black dark:text-white">{formatCurrency(humanCosts.hourlyRate)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" className="text-zinc-600 dark:text-zinc-400">Overhead Cost</Typography>
                  <Typography className="text-black dark:text-white">{formatCurrency(humanCosts.overheadCost)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" className="text-zinc-600 dark:text-zinc-400">Cost Per Call</Typography>
                  <Typography className="text-black dark:text-white">{formatCurrency(humanCosts.costPerCall)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" className="text-zinc-600 dark:text-zinc-400">Cost Per Message</Typography>
                  <Typography className="text-black dark:text-white">{formatCurrency(humanCosts.costPerMessage)}</Typography>
                </Grid>
              </Grid>
            </div>
          </Grid>
          <Grid item xs={12} md={6}>
            <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50">
              <Typography variant="subtitle1" className="text-black dark:text-white mb-3 font-semibold">AI Costs</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" className="text-zinc-600 dark:text-zinc-400">Credit Cost</Typography>
                  <Typography className="text-black dark:text-white">{formatCurrency(aiCosts.creditCost)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" className="text-zinc-600 dark:text-zinc-400">Platform Fees</Typography>
                  <Typography className="text-black dark:text-white">{formatCurrency(aiCosts.platformFees)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" className="text-zinc-600 dark:text-zinc-400">Cost Per Call</Typography>
                  <Typography className="text-black dark:text-white">{formatCurrency(aiCosts.costPerCall)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" className="text-zinc-600 dark:text-zinc-400">Cost Per Message</Typography>
                  <Typography className="text-black dark:text-white">{formatCurrency(aiCosts.costPerMessage)}</Typography>
                </Grid>
              </Grid>
            </div>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Overview Card Component
interface OverviewCardProps {
  totalCalls: number;
  totalMessages: number;
  totalSpent: number;
}

export const OverviewCard = ({ totalCalls, totalMessages, totalSpent }: OverviewCardProps) => {
  return (
    <Card className="shadow-md shadow-yellow-800/25 hover:shadow-lg hover:shadow-yellow-500/40 border border-yellow-200/50 dark:border-yellow-800/10 rounded-lg bg-gradient-to-b from-zinc-100/60 to-zinc-200/90 dark:from-zinc-950/80 dark:to-black dark:group-hover:from-black/70 dark:group-hover:to-black/95 transition-all duration-300">
      <CardContent>
        <Typography variant="h6" className="text-black dark:text-white mb-4 font-semibold">Overview</Typography>
        <Grid container spacing={3}>
          <MetricBox
            icon={<PhoneInTalkIcon />}
            value={totalCalls.toLocaleString()}
            label="Total Calls"
          />
          <MetricBox
            icon={<ChatIcon />}
            value={totalMessages.toLocaleString()}
            label="Total Messages"
          />
          <MetricBox
            icon={<AttachMoneyIcon />}
            value={formatCurrency(totalSpent)}
            label="Total Spent"
          />
        </Grid>
      </CardContent>
    </Card>
  );
};