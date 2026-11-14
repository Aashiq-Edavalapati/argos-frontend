import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { itemVariants } from './variants';
import BudgetCard from './BudgetCard';

const RightStatsColumn = ({ 
  todayExpense = 0, 
  pendingCount = 0,
  budget = 0,
  spent = 0,
  onBudgetSet
}) => (
  <div className="flex flex-col gap-4">
    <motion.div variants={itemVariants} className="bg-[#1C1C1E] p-5 rounded-3xl">
      <div className="flex justify-between items-start mb-1">
        <p className="text-gray-400 text-xs">Today&apos;s Expense</p>
        {pendingCount > 0 && (
          <Link
            href="/expenses"
            className="flex items-center gap-1 text-[10px] text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full hover:bg-yellow-500/20 transition-colors"
            title={`${pendingCount} uncategorized transactions`}
          >
            <AlertCircle size={10} />
            <span>{pendingCount} uncategorized</span>
          </Link>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white">₹{todayExpense}</h3>
    </motion.div>

    <BudgetCard budget={budget} spent={spent} onBudgetSet={onBudgetSet} />
  </div>
);

export default RightStatsColumn;
