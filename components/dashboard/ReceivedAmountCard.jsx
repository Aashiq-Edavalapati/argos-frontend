"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { itemVariants } from './variants';

const ReceivedAmountCard = ({ receivedAmount = 0, youOwe = 0, weeklyStats = [0, 0, 0, 0, 0, 0, 0] }) => {
  const router = useRouter();
  const currentMonth = format(new Date(), 'MMM yyyy');

  // Compute dynamic SVG sparkline path from weeklyStats (Sun..Sat)
  const { linePath, areaPath } = useMemo(() => {
    const stats = Array.isArray(weeklyStats) && weeklyStats.length === 7
      ? weeklyStats
      : [0, 0, 0, 0, 0, 0, 0];

    const maxVal = Math.max(...stats, 1);
    const hasData = stats.some(v => v > 0);

    // 7 points: x goes from 0 to 100 in steps of 100/6 (~16.67)
    // y goes from 34 (baseline) to 8 (peak)
    const points = stats.map((val, idx) => {
      const x = Math.round((idx / 6) * 100);
      const ratio = hasData ? val / maxVal : 0;
      const y = Math.round(34 - ratio * 26);
      return { x, y };
    });

    // If no data, return a clean flat baseline
    if (!hasData) {
      const line = "M 0 34 L 100 34";
      const area = "M 0 34 L 100 34 L 100 40 L 0 40 Z";
      return { linePath: line, areaPath: area };
    }

    // Generate smooth cubic bezier SVG path connecting the 7 points
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const midX = (curr.x + next.x) / 2;
      d += ` C ${midX} ${curr.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
    }

    const area = `${d} L 100 40 L 0 40 Z`;
    return { linePath: d, areaPath: area };
  }, [weeklyStats]);

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
        <div className="text-2xl font-bold text-[#D8EFA8] mt-1">₹{Number(receivedAmount).toLocaleString()}</div>
      </div>
      
      <div className="h-16 mt-4 flex items-end justify-between gap-1">
        {/* Dynamic SVG Sparkline */}
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
          <motion.path
            key={linePath}
            d={linePath}
            fill="none"
            stroke="#CDC9EF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
          <motion.path
            key={areaPath}
            d={areaPath}
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
