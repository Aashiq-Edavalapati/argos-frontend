"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Calendar, Tag, CreditCard, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../src/lib/api';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", duration: 0.4 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
};

const CATEGORIES = [
  "Food",
  "Meals",
  "Travel",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Office Supplies",
  "Groceries",
  "Health",
  "Uncategorized"
];

export default function AddExpenseModal({ onClose, onCreated }) {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (!merchant.trim()) {
      setError("Please enter a merchant name");
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid expense amount");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/transactions', {
        method: 'POST',
        json: {
          merchant: merchant.trim(),
          amount: parsedAmount,
          category,
          date: new Date(date).toISOString(),
          description: description.trim() || undefined,
        }
      });

      const data = await res.json();
      if (res.ok) {
        if (onCreated) onCreated(data);
        onClose();
      } else {
        setError(data.error || "Failed to create transaction");
      }
    } catch (err) {
      console.error("Create expense error:", err);
      setError("Network error while creating expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-[#1C1C1E] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D8EFA8]/20 text-[#D8EFA8] flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Add Expense</h3>
              <p className="text-xs text-gray-400">Record a manual transaction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">
              Merchant / Payee
            </label>
            <input
              type="text"
              placeholder="e.g. Swiggy, Uber, Starbucks"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
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
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-bold placeholder-gray-500 focus:outline-none focus:border-[#D8EFA8]/40"
                required
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D8EFA8]/40"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D8EFA8]/40"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">
              Description / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Dinner with team"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D8EFA8]/40"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#D8EFA8] text-[#0A0A0A] rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#cde49a] transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
