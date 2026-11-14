"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Users } from 'lucide-react';
import { itemVariants } from './variants';
import { apiFetch } from '../../src/lib/api';

const GroupExpenseCard = ({ toGet = 0, debtors: propDebtors }) => {
  const router = useRouter();
  const [fetchedDebtors, setFetchedDebtors] = useState([]);

  useEffect(() => {
    if (propDebtors) return;

    let isMounted = true;
    const fetchSplits = async () => {
      try {
        const res = await apiFetch('/api/splits/summary');
        if (res.ok && isMounted) {
          const data = await res.json();
          setFetchedDebtors(data.owedToMe || []);
        }
      } catch (e) {
        console.warn("Could not fetch debtors for card", e);
      }
    };

    fetchSplits();
    return () => { isMounted = false; };
  }, [propDebtors, toGet]);

  const debtors = propDebtors || fetchedDebtors;

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayedDebtors = debtors.slice(0, 3);
  const extraCount = debtors.length > 3 ? debtors.length - 3 : 0;

  return (
    <motion.div
      variants={itemVariants}
      onClick={() => router.push('/splits')}
      className="bg-[#CDC9EF] p-6 rounded-3xl relative overflow-hidden cursor-pointer group transition-transform hover:-translate-y-0.5"
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-1">
          <div className="text-[#0A0A0A]/70 text-sm font-medium">Total Outstanding</div>
          <div className="w-7 h-7 rounded-full bg-[#0A0A0A]/10 group-hover:bg-[#0A0A0A] group-hover:text-white flex items-center justify-center transition-colors">
            <ArrowUpRight size={14} />
          </div>
        </div>

        <h3 className="text-[#0A0A0A] text-lg font-bold mb-4">To get</h3>

        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-[#0A0A0A]">₹{toGet}</span>

          {debtors.length > 0 ? (
            <div className="flex -space-x-2.5 items-center">
              {displayedDebtors.map((d, i) => (
                <div
                  key={d.id || i}
                  title={`${d.owedByName || d.owedByEmail} owes ₹${d.amount}`}
                  className="w-8 h-8 rounded-full bg-[#0A0A0A] border-2 border-[#CDC9EF] flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                >
                  {getInitials(d.owedByName || d.owedByEmail)}
                </div>
              ))}
              {extraCount > 0 && (
                <div className="w-8 h-8 rounded-full bg-[#0A0A0A]/80 border-2 border-[#CDC9EF] flex items-center justify-center text-white text-[10px] font-bold">
                  +{extraCount}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-[#0A0A0A]/60 font-semibold bg-[#0A0A0A]/5 px-2.5 py-1 rounded-full">
              <span>All settled</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GroupExpenseCard;
