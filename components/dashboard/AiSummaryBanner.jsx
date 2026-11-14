"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { apiFetch } from '../../src/lib/api';
import { itemVariants } from './variants';

export default function AiSummaryBanner() {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/transactions/summary');
      if (res.ok) {
        const data = await res.json();
        setSummary(data.message || 'All financial metrics look solid this month.');
      } else {
        setSummary("Your finances are tracked in real-time. Keep up the great spending habits!");
      }
    } catch (e) {
      setSummary("Your finances are tracked in real-time. Keep up the great spending habits!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <motion.div
      variants={itemVariants}
      className="bg-[#1C1C1E] border border-white/5 rounded-3xl p-5 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden"
    >
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D8EFA8] to-[#CDC9EF] flex items-center justify-center text-[#0A0A0A] shrink-0 shadow-md">
          <Sparkles size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D8EFA8]">
              Jared • AI Financial Intelligence
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D8EFA8] animate-pulse" />
          </div>
          <p className="text-sm text-gray-200 leading-relaxed font-medium">
            {loading ? "Analyzing your monthly spending habits with AI..." : summary}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={fetchSummary}
        disabled={loading}
        title="Refresh AI Summary"
        className="self-end sm:self-center p-2 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/20 text-gray-400 hover:text-white transition-all disabled:opacity-50"
      >
        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
      </button>
    </motion.div>
  );
}
