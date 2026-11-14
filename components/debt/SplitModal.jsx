"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Plus, Trash2, Check, AlertCircle, Search, User } from 'lucide-react';
import { apiFetch } from '../../src/lib/api';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", duration: 0.4 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
};

export default function SplitModal({ transaction, onClose, onSplitComplete }) {
  const [contacts, setContacts] = useState([]);
  const [splits, setSplits] = useState([
    { name: '', email: '', amount: '' }
  ]);
  const [splitMode, setSplitMode] = useState('equal'); // 'equal' | 'custom'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalAmount = parseFloat(transaction?.amount || 0);

  // Fetch contacts for quick picking
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const res = await apiFetch('/api/contacts');
        if (res.ok) {
          const data = await res.json();
          setContacts(data.contacts || []);
        }
      } catch (e) {
        console.warn("Failed to load contacts:", e);
      }
    };
    loadContacts();
  }, []);

  // Recalculate equal shares whenever splits list changes or mode is equal
  useEffect(() => {
    if (splitMode === 'equal' && splits.length > 0 && totalAmount > 0) {
      // Total people = splits.length + 1 (user who paid + debtors)
      const count = splits.length + 1;
      const share = Math.round((totalAmount / count) * 100) / 100;
      setSplits(prev =>
        prev.map(s => ({
          ...s,
          amount: share.toString()
        }))
      );
    }
  }, [splits.length, splitMode, totalAmount]);

  const handleAddPerson = () => {
    setSplits(prev => [...prev, { name: '', email: '', amount: '' }]);
  };

  const handleRemovePerson = (idx) => {
    if (splits.length <= 1) return;
    setSplits(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSplitChange = (idx, field, value) => {
    setSplits(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSelectContact = (idx, contact) => {
    setSplits(prev => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        name: contact.name,
        email: contact.email
      };
      return updated;
    });
  };

  const sumOwed = splits.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const yourShare = Math.max(0, totalAmount - sumOwed);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate
    for (let i = 0; i < splits.length; i++) {
      const s = splits[i];
      if (!s.name.trim()) {
        setError(`Please enter a name for person #${i + 1}`);
        return;
      }
      if (!s.email.trim() || !s.email.includes('@')) {
        setError(`Please enter a valid email for ${s.name || `person #${i + 1}`}`);
        return;
      }
      const amt = parseFloat(s.amount);
      if (isNaN(amt) || amt <= 0) {
        setError(`Please enter a valid amount for ${s.name}`);
        return;
      }
    }

    if (sumOwed > totalAmount) {
      setError(`Total split amount (₹${sumOwed}) cannot exceed the expense total (₹${totalAmount})`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        transactionId: transaction.id,
        splits: splits.map(s => ({
          name: s.name.trim(),
          email: s.email.trim(),
          amount: parseFloat(s.amount)
        }))
      };

      const res = await apiFetch('/api/splits', {
        method: 'POST',
        json: payload
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (onSplitComplete) onSplitComplete(data);
        onClose();
      } else {
        setError(data.error || "Failed to split transaction");
      }
    } catch (err) {
      console.error("Split request error:", err);
      setError("Network error while creating split");
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
        className="bg-[#1C1C1E] border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D8EFA8]/20 text-[#D8EFA8] flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Split Expense</h3>
              <p className="text-xs text-gray-400">
                {transaction?.merchant || "Expense"} • ₹{totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Mode Switcher */}
          <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => setSplitMode('equal')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                splitMode === 'equal'
                  ? 'bg-[#1C1C1E] text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Split Equally ({splits.length + 1} ways)
            </button>
            <button
              type="button"
              onClick={() => setSplitMode('custom')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                splitMode === 'custom'
                  ? 'bg-[#1C1C1E] text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Custom Amounts
            </button>
          </div>

          {/* Quick Contact Chips if available */}
          {contacts.length > 0 && (
            <div>
              <p className="text-[11px] text-gray-400 mb-2 font-medium">Quick Add from Contacts:</p>
              <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {contacts.slice(0, 8).map((contact, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      // Fill empty slot or add new person with this contact
                      const emptyIdx = splits.findIndex(s => !s.name && !s.email);
                      if (emptyIdx !== -1) {
                        handleSelectContact(emptyIdx, contact);
                      } else {
                        setSplits(prev => [...prev, { name: contact.name, email: contact.email, amount: '' }]);
                      }
                    }}
                    className="shrink-0 bg-[#0A0A0A] border border-white/10 hover:border-[#D8EFA8] px-3 py-1.5 rounded-full text-xs text-gray-300 hover:text-white flex items-center gap-1.5 transition-all"
                  >
                    <User size={12} className="text-[#D8EFA8]" />
                    <span>{contact.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* People List */}
          <div className="space-y-3">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
              Friends to Split With
            </label>

            {splits.map((person, index) => (
              <div
                key={index}
                className="bg-[#0A0A0A] p-3.5 rounded-2xl border border-white/5 space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">Friend #{index + 1}</span>
                  {splits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePerson(index)}
                      className="text-gray-500 hover:text-red-400 transition-colors p-1"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <div className="md:col-span-4">
                    <input
                      type="text"
                      placeholder="Name"
                      value={person.name}
                      onChange={(e) => handleSplitChange(index, 'name', e.target.value)}
                      className="w-full bg-[#1C1C1E] border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D8EFA8]/40"
                      required
                    />
                  </div>
                  <div className="md:col-span-5">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={person.email}
                      onChange={(e) => handleSplitChange(index, 'email', e.target.value)}
                      className="w-full bg-[#1C1C1E] border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D8EFA8]/40 font-mono"
                      required
                    />
                  </div>
                  <div className="md:col-span-3">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-gray-500">₹</span>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={person.amount}
                        onChange={(e) => handleSplitChange(index, 'amount', e.target.value)}
                        readOnly={splitMode === 'equal'}
                        step="0.01"
                        min="1"
                        className={`w-full bg-[#1C1C1E] border border-white/5 rounded-xl pl-6 pr-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#D8EFA8]/40 ${
                          splitMode === 'equal' ? 'opacity-80 cursor-not-allowed' : ''
                        }`}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddPerson}
              className="w-full py-2.5 bg-[#0A0A0A] border border-dashed border-gray-700 hover:border-[#D8EFA8]/50 rounded-xl text-xs text-gray-400 hover:text-[#D8EFA8] flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus size={14} /> Add Another Friend
            </button>
          </div>

          {/* Share Breakdown summary */}
          <div className="bg-[#0A0A0A] p-4 rounded-2xl border border-white/5 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Friends Owe You:</span>
              <span className="text-[#D8EFA8] font-bold">₹{sumOwed.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Your Share:</span>
              <span className="text-white font-bold">₹{yourShare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-white/5 font-semibold text-gray-300">
              <span>Total Expense:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
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
              {loading ? 'Creating Split...' : 'Confirm & Split'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
