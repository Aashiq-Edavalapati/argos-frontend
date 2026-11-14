"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Home, 
  Wifi, 
  Tv, 
  Music, 
  Dumbbell, 
  ShieldCheck, 
  CreditCard, 
  AlertCircle,
  X,
  Check
} from 'lucide-react';
import Header from '../../../../components/dashboard/Header';
import { apiFetch } from '../../../lib/api';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", duration: 0.4 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
};

const getIconForName = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('rent') || n.includes('flat') || n.includes('apartment') || n.includes('room')) return Home;
  if (n.includes('wifi') || n.includes('internet') || n.includes('broadband')) return Wifi;
  if (n.includes('netflix') || n.includes('prime') || n.includes('hulu') || n.includes('disney') || n.includes('tv')) return Tv;
  if (n.includes('spotify') || n.includes('apple music') || n.includes('music')) return Music;
  if (n.includes('gym') || n.includes('fitness')) return Dumbbell;
  if (n.includes('insurance')) return ShieldCheck;
  return CreditCard;
};

export default function RecurringPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('MONTHLY');
  const [nextDueDate, setNextDueDate] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchRecurring = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/recurring');
      if (res.ok) {
        const data = await res.json();
        setItems(data || []);
      }
    } catch (e) {
      console.error("Failed to load recurring expenses", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, []);

  const handleCreateRecurring = async (e) => {
    e.preventDefault();
    setFormError(null);

    const parsedAmt = parseFloat(amount);
    if (!name.trim()) {
      setFormError("Please enter a name for the recurring expense");
      return;
    }
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      setFormError("Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/recurring', {
        method: 'POST',
        json: {
          name: name.trim(),
          amount: parsedAmt,
          frequency,
          nextDueDate: new Date(nextDueDate).toISOString()
        }
      });

      if (res.ok) {
        setIsAddOpen(false);
        setName('');
        setAmount('');
        fetchRecurring();
      } else {
        const err = await res.json();
        setFormError(err.error || "Failed to add recurring expense");
      }
    } catch (err) {
      setFormError("Network error adding recurring expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to stop tracking this recurring expense?")) return;
    try {
      const res = await apiFetch(`/api/recurring/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete recurring expense", e);
    }
  };

  const monthlyTotal = items.reduce((acc, curr) => {
    const amt = parseFloat(curr.amount || 0);
    if (curr.frequency === 'YEARLY') return acc + amt / 12;
    if (curr.frequency === 'WEEKLY') return acc + amt * 4.33;
    return acc + amt;
  }, 0);

  const nearestDue = items.length > 0
    ? [...items].sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))[0]
    : null;

  return (
    <div className="flex-auto h-screen overflow-hidden p-4 md:p-8 font-sans">
      <Header />
      <div className="h-full overflow-y-auto pb-28 custom-scrollbar">
        <div className="p-2 md:p-4">

          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Recurring Expenses</h1>
              <p className="text-gray-400 mt-1 text-sm">
                Track subscriptions, rent, insurance, and scheduled commitments.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="bg-[#D8EFA8] text-[#0A0A0A] font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:bg-[#cde49a] transition-all cursor-pointer shadow-md"
            >
              <Plus size={16} /> Add Recurring Expense
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#1C1C1E] border border-white/5 p-6 rounded-3xl">
              <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                <span>Monthly Recurring Total</span>
                <div className="w-6 h-6 rounded-full bg-[#D8EFA8]/10 text-[#D8EFA8] flex items-center justify-center">
                  <RefreshCw size={12} />
                </div>
              </div>
              <div className="text-3xl font-bold text-[#D8EFA8]">
                ₹{Math.round(monthlyTotal).toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Fixed monthly financial commitment
              </p>
            </div>

            <div className="bg-[#1C1C1E] border border-white/5 p-6 rounded-3xl">
              <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                <span>Active Subscriptions</span>
                <div className="w-6 h-6 rounded-full bg-[#CDC9EF]/20 text-[#CDC9EF] flex items-center justify-center">
                  <Calendar size={12} />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                {items.length}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Auto-recurring items tracked
              </p>
            </div>

            <div className="bg-[#1C1C1E] border border-white/5 p-6 rounded-3xl">
              <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                <span>Next Payment Due</span>
                <div className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center">
                  <CreditCard size={12} />
                </div>
              </div>
              <div className="text-xl font-bold text-white truncate">
                {nearestDue ? nearestDue.name : "None scheduled"}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {nearestDue
                  ? `${format(new Date(nearestDue.nextDueDate), "MMM dd, yyyy")} (₹${parseFloat(nearestDue.amount).toLocaleString()})`
                  : "No upcoming payments"}
              </p>
            </div>
          </div>

          {/* Recurring Items List */}
          <div className="bg-[#1C1C1E] rounded-3xl border border-white/5 overflow-hidden shadow-lg">
            <div className="p-5 border-b border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-base">Active Commitments</h3>
              <span className="text-xs text-gray-400">{items.length} total</span>
            </div>

            <div className="divide-y divide-gray-800/50">
              {loading ? (
                <div className="p-12 text-center text-gray-500">Loading recurring expenses...</div>
              ) : items.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No recurring expenses found. Click &quot;Add Recurring Expense&quot; to track rent or subscriptions.
                </div>
              ) : (
                items.map((item) => {
                  const Icon = getIconForName(item.name);
                  const dueDate = new Date(item.nextDueDate);
                  const daysLeft = differenceInDays(dueDate, new Date());
                  return (
                    <div
                      key={item.id}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#0A0A0A] border border-white/5 text-[#D8EFA8] flex items-center justify-center shrink-0">
                          <Icon size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-white text-base">{item.name}</h4>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#0A0A0A] text-gray-400 border border-white/5">
                              {item.frequency}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Next due on <strong className="text-gray-300">{format(dueDate, "MMM dd, yyyy")}</strong>
                            {daysLeft >= 0 ? (
                              <span className="ml-1 text-yellow-400">({daysLeft === 0 ? 'Today!' : `in ${daysLeft} days`})</span>
                            ) : (
                              <span className="ml-1 text-red-400">({Math.abs(daysLeft)} days overdue)</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            ₹{parseFloat(item.amount).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                            per {item.frequency.toLowerCase()}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                          title="Delete recurring expense"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ADD RECURRING MODAL */}
          <AnimatePresence>
            {isAddOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                onClick={() => setIsAddOpen(false)}
              >
                <motion.div
                  variants={modalVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-[#1C1C1E] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#D8EFA8]/20 text-[#D8EFA8] flex items-center justify-center">
                        <RefreshCw size={16} />
                      </div>
                      <h3 className="text-white font-bold text-lg">Add Recurring Expense</h3>
                    </div>
                    <button
                      onClick={() => setIsAddOpen(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleCreateRecurring} className="p-6 space-y-4">
                    <div>
                      <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">
                        Expense Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rent, Netflix, Internet, Gym"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D8EFA8]/40"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">
                          Amount (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          min="1"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-bold placeholder-gray-500 focus:outline-none focus:border-[#D8EFA8]/40"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">
                          Frequency
                        </label>
                        <select
                          value={frequency}
                          onChange={(e) => setFrequency(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D8EFA8]/40"
                        >
                          <option value="MONTHLY">Monthly</option>
                          <option value="WEEKLY">Weekly</option>
                          <option value="YEARLY">Yearly</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">
                        Next Due Date
                      </label>
                      <input
                        type="date"
                        value={nextDueDate}
                        onChange={(e) => setNextDueDate(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D8EFA8]/40"
                        required
                      />
                    </div>

                    {formError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                        <AlertCircle size={14} />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div className="flex gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setIsAddOpen(false)}
                        className="flex-1 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-3 bg-[#D8EFA8] text-[#0A0A0A] rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#cde49a] transition-colors disabled:opacity-50"
                      >
                        {submitting ? 'Adding...' : 'Save Commitment'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
