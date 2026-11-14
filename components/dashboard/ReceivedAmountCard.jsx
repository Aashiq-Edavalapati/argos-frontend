"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { itemVariants } from './variants';

const ReceivedAmountCard = ({ receivedAmount = 0, youOwe = 0 }) => {
  const router = useRouter();
  const currentMonth = format(new Date(), 'MMM yyyy');

  return (
    <motion.div
      variants={itemVariants}
      onClick={() => router.push('/splits')}
      className="bg-[#1C1C1E] p-6 rounded-3xl flex flex-col justify-between cursor-pointer group hover:border hover:border-white/10 transition-all"
    >
      <div>
        <div className="flex justify-between items-center text-gray-400 text-xs mb-1">
          <span>{currentMonth}</span>
          {youOwe > 0 && (
            <span className="text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded-full text-[10px]">
              You owe ₹{youOwe}
            </span>
          )}
        </div>
        <h3 className="text-white text-md font-medium">Received Amount</h3>
        <div className="text-2xl font-bold text-[#D8EFA8] mt-1">₹{receivedAmount}</div>
      </div>
      
      <div className="h-16 mt-4 flex items-end justify-between gap-1">
        {/* SVG Sparkline */}
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
          <motion.path
            d="M0 30 Q 15 20, 30 25 T 50 15 T 75 28 T 100 12"
            fill="none"
            stroke="#CDC9EF"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          <motion.path
            d="M0 30 Q 15 20, 30 25 T 50 15 T 75 28 T 100 12 V 50 H 0 Z"
            fill="url(#gradient-received)"
            opacity="0.25"
          />
          <defs>
            <linearGradient id="gradient-received" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#CDC9EF" />
              <stop offset="100%" stopColor="#CDC9EF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex justify-between text-[10px] text-gray-500 mt-2 uppercase tracking-wider">
        <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
      </div>
    </motion.div>
  );
};

export default ReceivedAmountCard;
