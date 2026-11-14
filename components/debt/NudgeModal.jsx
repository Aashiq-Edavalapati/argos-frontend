"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, AlertTriangle, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { apiFetch } from '../../src/lib/api';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", duration: 0.4 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
};

export default function NudgeModal({ split, onClose, onNudged }) {
  const [strictness, setStrictness] = useState('POLITE');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!split) return null;

  const debtorName = split.owedByName || split.owedByEmail || "Debtor";
  const debtorEmail = split.owedByEmail;
  const amount = split.amount;
  const merchant = split.transaction?.merchant || "Expense";

  const getPreviewText = (tone) => {
    switch (tone) {
      case 'AGGRESSIVE':
        return `ATTENTION.\n\nYou owe for ${merchant} (₹${amount}). This debt is past due. Immediate settlement is required.\n\n- ARGOS ENFORCER`;
      case 'FIRM':
        return `Hi,\n\nJust a reminder to settle your share of ₹${amount} for ${merchant}. Please pay at your earliest convenience.`;
      case 'POLITE':
      default:
        return `Hey!\n\nQuick update on ${merchant} — your split is ₹${amount}. Catch you later!`;
    }
  };

  const handleSendNudge = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await apiFetch('/api/splits/nudge', {
        method: 'POST',
        json: {
          splitId: split.id,
          strictness,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: 'success', text: `Nudge (${strictness.toLowerCase()}) sent to ${debtorName}!` });
        if (onNudged) onNudged(split.id);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to send reminder.' });
      }
    } catch (err) {
      console.error("Nudge failed:", err);
      setStatusMessage({ type: 'error', text: 'Network error sending reminder.' });
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#CDC9EF]/20 text-[#CDC9EF] flex items-center justify-center">
              <Send size={16} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Send Debt Nudge</h3>
              <p className="text-xs text-gray-400">Automated reminder system</p>
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
        <div className="p-6 space-y-5">
          {/* Debtor details pill */}
          <div className="bg-[#0A0A0A] p-4 rounded-2xl border border-white/5 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400">To</p>
              <p className="text-white font-semibold text-sm">{debtorName}</p>
              {debtorEmail && <p className="text-xs text-gray-500 font-mono">{debtorEmail}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Owed Amount</p>
              <p className="text-[#D8EFA8] font-bold text-lg">₹{amount}</p>
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-2">
              Select Enforcement Tone
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStrictness('POLITE')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  strictness === 'POLITE'
                    ? 'bg-[#D8EFA8]/10 border-[#D8EFA8] text-[#D8EFA8]'
                    : 'bg-[#0A0A0A] border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-center gap-1">
                  🟢 Polite
                </div>
                <span className="text-[10px] opacity-70 mt-1 block">Friendly ask</span>
              </button>

              <button
                type="button"
                onClick={() => setStrictness('FIRM')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  strictness === 'FIRM'
                    ? 'bg-yellow-500/10 border-yellow-400 text-yellow-400'
                    : 'bg-[#0A0A0A] border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-center gap-1">
                  🟡 Firm
                </div>
                <span className="text-[10px] opacity-70 mt-1 block">Due reminder</span>
              </button>

              <button
                type="button"
                onClick={() => setStrictness('AGGRESSIVE')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  strictness === 'AGGRESSIVE'
                    ? 'bg-red-500/10 border-red-500 text-red-400'
                    : 'bg-[#0A0A0A] border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-center gap-1">
                  🔴 Aggressive
                </div>
                <span className="text-[10px] opacity-70 mt-1 block">Enforcer mode</span>
              </button>
            </div>
          </div>

          {/* Live Email Preview */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">
              Email Preview
            </label>
            <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-dashed border-gray-800 text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
              {getPreviewText(strictness)}
            </div>
          </div>

          {/* Status feedback */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-[#D8EFA8]/20 text-[#D8EFA8] border border-[#D8EFA8]/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {statusMessage.type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
              <span>{statusMessage.text}</span>
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
              type="button"
              onClick={handleSendNudge}
              disabled={loading}
              className="flex-1 py-3 bg-[#D8EFA8] text-[#0A0A0A] rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#cde49a] transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Nudge'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
