"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { containerVariants } from '../../../../components/dashboard/variants';
import Header from '../../../../components/dashboard/Header';
import GroupExpenseCard from '../../../../components/dashboard/GroupExpenseCard';
import ReceivedAmountCard from '../../../../components/dashboard/ReceivedAmountCard';
import ExpenseDataCard from '../../../../components/dashboard/ExpenseDataCard';
import RightStatsColumn from '../../../../components/dashboard/RightStatsColumn';
import TransactionsTable from '../../../../components/dashboard/TransactionsTable';
import AiSummaryBanner from '../../../../components/dashboard/AiSummaryBanner';
import { apiFetch } from '../../../lib/api';

export default function Dashboard() {
  const [globalStats, setGlobalStats] = useState({
    todayExpense: 0,
    pendingCount: 0,
    owedToYou: 0,
    youOwe: 0,
    receivedAmount: 0,
    receivedWeeklyStats: [0, 0, 0, 0, 0, 0, 0],
    budget: 0,
    totalSpent: 0
  });

  const handleBudgetSet = async (newBudget) => {
    try {
      const res = await apiFetch('/auth/budget', {
        method: 'PUT',
        json: { budget: newBudget }
      });
      if (res.ok) {
        const data = await res.json();
        setGlobalStats(prev => ({ ...prev, budget: data.budget }));
      }
    } catch (error) {
      console.error("Failed to update budget", error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        const res = await apiFetch('/api/transactions/stats');
        if (res.ok && isMounted) {
          const data = await res.json();
          setGlobalStats({
            todayExpense: data.todayExpense || 0,
            pendingCount: data.pendingCount || 0,
            owedToYou: data.owedToYou || 0,
            youOwe: data.youOwe || 0,
            receivedAmount: data.receivedAmount || 0,
            receivedWeeklyStats: data.receivedWeeklyStats || [0, 0, 0, 0, 0, 0, 0],
            budget: data.budget || 0,
            totalSpent: data.totalSpent || 0
          });
        }
      } catch (error) {
        console.error("Failed to fetch global stats", error);
      }
    };

    loadStats();
    return () => { isMounted = false; };
  }, []);
  
  return (
    <div className="flex-auto min-h-screen p-4 md:p-8 font-sans">
      <Header />

      {/* AI Financial Intelligence Banner */}
      <AiSummaryBanner />

      {/* Dashboard Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Column 1 */}
        <div className="flex flex-col gap-4">
          <GroupExpenseCard toGet={globalStats.owedToYou} />
          <ReceivedAmountCard 
            receivedAmount={globalStats.receivedAmount}
            youOwe={globalStats.youOwe}
            weeklyStats={globalStats.receivedWeeklyStats}
          />
        </div>

        {/* Column 2 (Center Chart) - Spans 2 cols on Large screens */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <ExpenseDataCard />
        </div>

        {/* Column 3 (Right side stats) */}
        <div className="lg:col-span-1">
          <RightStatsColumn 
            todayExpense={globalStats.todayExpense}
            pendingCount={globalStats.pendingCount}
            budget={globalStats.budget}
            spent={globalStats.totalSpent}
            onBudgetSet={handleBudgetSet}
          />
        </div>

        {/* Bottom Full Width Section */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 lg:row-start-2 lg:col-start-1">
          <TransactionsTable />
        </div>
      </motion.div>
    </div>
  );
}
