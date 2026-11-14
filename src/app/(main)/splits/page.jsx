"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  Users, 
  Send, 
  Check, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Share2, 
  Plus, 
  Calendar,
  CreditCard,
  Search,
  X
} from 'lucide-react';
import Header from '../../../../components/dashboard/Header';
import NudgeModal from '../../../../components/debt/NudgeModal';
import SplitModal from '../../../../components/debt/SplitModal';
import { apiFetch } from '../../../lib/api';

export default function SplitsPage() {
  const [activeTab, setActiveTab] = useState('owedToMe'); // 'owedToMe' | 'iOwe' | 'settled'
  const [debtData, setDebtData] = useState({
    owedToMe: [],
    iOwe: [],
    settled: []
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [nudgeSplit, setNudgeSplit] = useState(null);
  const [splitTx, setSplitTx] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const fetchDebts = async () => {
    setLoading(true);
    try {
      const [debtsRes, txsRes] = await Promise.all([
        apiFetch('/api/splits/summary'),
        apiFetch('/api/transactions?limit=20')
      ]);

      if (debtsRes.ok) {
        const data = await debtsRes.json();
        setDebtData({
          owedToMe: data.owedToMe || [],
          iOwe: data.iOwe || [],
          settled: data.settled || []
        });
      }

      if (txsRes.ok) {
        const txData = await txsRes.json();
        setRecentTransactions(txData.transactions || []);
      }
    } catch (e) {
      console.error("Failed to load debts", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const handleSettle = async (splitId) => {
    try {
      const res = await apiFetch(`/api/splits/${splitId}/settle`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchDebts();
      }
    } catch (e) {
      console.error("Failed to settle", e);
    }
  };

  const totalOwedToMe = debtData.owedToMe.reduce(
    (sum, s) => sum + parseFloat(s.amount || 0),
    0
  );

  const totalIOwe = debtData.iOwe.reduce(
    (sum, s) => sum + parseFloat(s.amount || 0),
    0
  );

  const totalSettled = debtData.settled.reduce(
    (sum, s) => sum + parseFloat(s.amount || 0),
    0
  );

  return (
    <div className="flex-auto h-screen overflow-hidden p-4 md:p-8 font-sans">
      <Header />
      <div className="h-full overflow-y-auto pb-28 custom-scrollbar">
        <div className="p-2 md:p-4">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Splits & Debt Enforcement</h1>
              <p className="text-gray-400 mt-1 text-sm">
                Nudge debtors via automated email reminders and manage outstanding shares.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="bg-[#D8EFA8] text-[#0A0A0A] font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:bg-[#cde49a] transition-all cursor-pointer shadow-md"
            >
              <Share2 size={16} /> Split an Expense
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#1C1C1E] border border-white/5 p-6 rounded-3xl">
              <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                <span>Owed to You</span>
                <div className="w-6 h-6 rounded-full bg-[#D8EFA8]/10 text-[#D8EFA8] flex items-center justify-center">
                  <ArrowDownLeft size={14} />
                </div>
              </div>
              <div className="text-3xl font-bold text-[#D8EFA8]">
                ₹{totalOwedToMe.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {debtData.owedToMe.length} pending debt{debtData.owedToMe.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="bg-[#1C1C1E] border border-white/5 p-6 rounded-3xl">
              <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                <span>You Owe Others</span>
                <div className="w-6 h-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
                  <ArrowUpRight size={14} />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                ₹{totalIOwe.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {debtData.iOwe.length} pending payment{debtData.iOwe.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="bg-[#1C1C1E] border border-white/5 p-6 rounded-3xl">
              <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                <span>Settled Recoveries</span>
                <div className="w-6 h-6 rounded-full bg-[#CDC9EF]/20 text-[#CDC9EF] flex items-center justify-center">
                  <CheckCircle size={14} />
                </div>
              </div>
              <div className="text-3xl font-bold text-[#CDC9EF]">
                ₹{totalSettled.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {debtData.settled.length} settled recovery{debtData.settled.length === 1 ? '' : 'ies'}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/5 pb-2">
            <button
              onClick={() => setActiveTab('owedToMe')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'owedToMe'
                  ? 'bg-[#D8EFA8] text-[#0A0A0A]'
                  : 'text-gray-400 hover:text-white hover:bg-[#1C1C1E]'
              }`}
            >
              <Users size={14} />
              <span>Owed to You ({debtData.owedToMe.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('iOwe')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'iOwe'
                  ? 'bg-[#CDC9EF] text-[#0A0A0A]'
                  : 'text-gray-400 hover:text-white hover:bg-[#1C1C1E]'
              }`}
            >
              <CreditCard size={14} />
              <span>You Owe ({debtData.iOwe.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settled')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'settled'
                  ? 'bg-white text-[#0A0A0A]'
                  : 'text-gray-400 hover:text-white hover:bg-[#1C1C1E]'
              }`}
            >
              <CheckCircle size={14} />
              <span>Settled ({debtData.settled.length})</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-[#1C1C1E] rounded-3xl border border-white/5 overflow-hidden shadow-lg">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading debts...</div>
            ) : activeTab === 'owedToMe' ? (
              <div className="divide-y divide-gray-800/50">
                {debtData.owedToMe.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    No one owes you money right now. Click &quot;Split an Expense&quot; above to split a bill with friends!
                  </div>
                ) : (
                  debtData.owedToMe.map((split) => {
                    const tx = split.transaction;
                    return (
                      <div
                        key={split.id}
                        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#D8EFA8]/10 text-[#D8EFA8] flex items-center justify-center shrink-0 font-bold text-sm">
                            {(split.owedByName || split.owedByEmail || 'D')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-white text-base">
                                {split.owedByName || "Friend"}
                              </h3>
                              <span className="text-xs text-gray-500 font-mono">
                                ({split.owedByEmail})
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              For <strong className="text-gray-300">{tx?.merchant || "Expense"}</strong>
                              {tx?.date && ` on ${format(new Date(tx.date), "MMM d, yyyy")}`}
                            </p>
                            {split.reminderCount > 0 && (
                              <div className="flex items-center gap-1.5 text-[11px] text-yellow-400 mt-1 font-medium">
                                <Clock size={12} />
                                <span>
                                  Nudged {split.reminderCount} time{split.reminderCount === 1 ? '' : 's'}
                                  {split.lastRemindedAt && ` • Last ${formatDistanceToNow(new Date(split.lastRemindedAt), { addSuffix: true })}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-4">
                          <div className="text-right">
                            <span className="text-xl font-bold text-[#D8EFA8]">
                              ₹{parseFloat(split.amount).toLocaleString()}
                            </span>
                            <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                              Pending
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setNudgeSplit(split)}
                              className="px-3.5 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                            >
                              <Send size={13} /> Nudge Debtor
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSettle(split.id)}
                              className="px-3 py-2 bg-[#D8EFA8]/10 hover:bg-[#D8EFA8]/20 text-[#D8EFA8] border border-[#D8EFA8]/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                              title="Mark as paid"
                            >
                              <Check size={14} /> Settle
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : activeTab === 'iOwe' ? (
              <div className="divide-y divide-gray-800/50">
                {debtData.iOwe.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    You don&apos;t owe anyone money right now. You are all square!
                  </div>
                ) : (
                  debtData.iOwe.map((split) => {
                    const tx = split.transaction;
                    const payerName = tx?.user?.name || tx?.user?.email || "Friend";
                    return (
                      <div
                        key={split.id}
                        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 font-bold text-sm">
                            {payerName[0].toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-base">
                              You owe {payerName}
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                              For <strong className="text-gray-300">{tx?.merchant || "Expense"}</strong>
                              {tx?.date && ` on ${format(new Date(tx.date), "MMM d, yyyy")}`}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xl font-bold text-red-400">
                            ₹{parseFloat(split.amount).toLocaleString()}
                          </span>
                          <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                            Pending
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {debtData.settled.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    No settled history recorded yet.
                  </div>
                ) : (
                  debtData.settled.map((split) => {
                    const tx = split.transaction;
                    return (
                      <div
                        key={split.id}
                        className="p-5 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-sm">
                              {split.owedByName || split.owedByEmail}
                            </span>
                            <span className="text-xs text-gray-500">paid back</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {tx?.merchant || "Expense"} • Settled
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-[#D8EFA8] text-base">
                            + ₹{parseFloat(split.amount).toLocaleString()}
                          </span>
                          <span className="block text-[10px] text-gray-500">Settled</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* QUICK EXPENSE PICKER MODAL (To choose which recent expense to split) */}
          <AnimatePresence>
            {isPickerOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                onClick={() => setIsPickerOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-[#1C1C1E] border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-bold text-lg">Select Expense to Split</h3>
                      <p className="text-xs text-gray-400">Choose a recent transaction</p>
                    </div>
                    <button
                      onClick={() => setIsPickerOpen(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar divide-y divide-gray-800/40">
                    {recentTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        onClick={() => {
                          setIsPickerOpen(false);
                          setSplitTx(tx);
                        }}
                        className="p-3.5 hover:bg-white/5 rounded-2xl cursor-pointer flex justify-between items-center transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-white text-sm">{tx.merchant}</div>
                          <div className="text-xs text-gray-400">{format(new Date(tx.date), "MMM d, yyyy")} • {tx.category}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white text-sm">₹{parseFloat(tx.amount).toLocaleString()}</div>
                          {tx.isSplit && (
                            <span className="text-[10px] text-[#CDC9EF] font-semibold">Already Split</span>
                          )}
                        </div>
                      </div>
                    ))}

                    {recentTransactions.length === 0 && (
                      <div className="p-8 text-center text-gray-500 text-sm">
                        No transactions found to split.
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SPLIT MODAL */}
          <AnimatePresence>
            {splitTx && (
              <SplitModal
                transaction={splitTx}
                onClose={() => setSplitTx(null)}
                onSplitComplete={() => {
                  fetchDebts();
                }}
              />
            )}
          </AnimatePresence>

          {/* NUDGE MODAL */}
          <AnimatePresence>
            {nudgeSplit && (
              <NudgeModal
                split={nudgeSplit}
                onClose={() => setNudgeSplit(null)}
                onNudged={() => {
                  fetchDebts();
                }}
              />
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
