"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Coffee, Plane, Briefcase, ShoppingBag, Utensils, Car, Home, Users } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { itemVariants } from './variants';
import { apiFetch } from '../../src/lib/api';

const getCategoryIcon = (category) => {
  const map = {
    'Food': Utensils,
    'Meals': Coffee,
    'Travel': Plane,
    'Transport': Car,
    'Shopping': ShoppingBag,
    'Office Supplies': Briefcase,
    'Rent': Home,
  };
  return map[category] || ShoppingBag;
};

const TransactionsTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await apiFetch('/api/transactions?limit=5');
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions || []);
        }
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <motion.div variants={itemVariants} className="bg-app-card p-6 rounded-3xl h-64 flex items-center justify-center">
        <p className="text-gray-400">Loading transactions...</p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants} className="bg-app-card p-6 rounded-3xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
          <p className="text-xs text-gray-400">Real-time sync from connected accounts</p>
        </div>
        <button 
          onClick={() => router.push('/expenses')}
          className="w-8 h-8 rounded-full bg-app-lavender flex items-center justify-center text-[#0A0A0A] hover:bg-white transition-colors cursor-pointer"
          title="View all expenses"
        >
          <span className="text-lg font-bold">↗</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-800">
              <th className="pb-3 pl-4 font-normal">Merchant / Category</th>
              <th className="pb-3 font-normal">Type</th>
              <th className="pb-3 font-normal">Status</th>
              <th className="pb-3 font-normal">Time</th>
              <th className="pb-3 font-normal text-right pr-4">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, idx) => {
              const Icon = getCategoryIcon(t.category);
              return (
                <tr 
                  key={t.id || idx} 
                  onClick={() => router.push('/expenses')}
                  className="group hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0A0A0A] flex items-center justify-center text-white border border-gray-800 shrink-0">
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm group-hover:text-[#D8EFA8] transition-colors">
                            {t.merchant || "Unknown Merchant"}
                          </span>
                          {t.isSplit && (
                            <span className="flex items-center gap-1 text-[10px] bg-[#CDC9EF]/20 text-[#CDC9EF] px-2 py-0.5 rounded-full font-bold">
                              <Users size={10} /> Split
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{t.category || "Uncategorized"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-gray-300">Expense</td>
                  <td className="py-4">
                    <span className="bg-app-lime text-[#0A0A0A] text-xs font-bold px-3 py-1 rounded-full">
                      Completed
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="text-sm text-gray-300">{format(new Date(t.date), 'MMM d, yyyy')}</div>
                    <div className="text-xs text-gray-500">{formatDistanceToNow(new Date(t.date), { addSuffix: true })}</div>
                  </td>
                  <td className="py-4 text-right pr-4 font-bold text-white">
                    ₹{parseFloat(t.amount).toLocaleString()}
                  </td>
                </tr>
              );
            })}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">
                  No recent transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default TransactionsTable;
