"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  X, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Tag, 
  Share2, 
  FileText, 
  Copy,
  ChevronDown,
  Calendar,
  Plus,
  Users,
  Send,
  Check,
  CheckCircle,
  Clock
} from 'lucide-react';
import Header from '../../../../components/dashboard/Header';
import AddExpenseModal from '../../../../components/dashboard/AddExpenseModal';
import SplitModal from '../../../../components/debt/SplitModal';
import NudgeModal from '../../../../components/debt/NudgeModal';
import { apiFetch } from '../../../lib/api';

// --- PALETTE CONSTANTS ---
// Bg: #0A0A0A | Card: #1C1C1E | Text: #FFFFFF | Lime: #D8EFA8 | Lavender: #CDC9EF

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", duration: 0.4 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
};

const CATEGORIES = [
  "All",
  "Food",
  "Meals",
  "Travel",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Office Supplies",
  "Rent",
  "Uncategorized"
];

// --- 1. Transaction Inspector Modal ---
const TransactionInspector = ({ 
  transaction, 
  onClose, 
  onOpenSplit, 
  onOpenNudge,
  onSettleSplit,
  onCategoryUpdate 
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(transaction?.category || 'Uncategorized');

  if (!transaction) return null;

  const handleCopyUTR = () => {
    if (transaction.utr) {
      navigator.clipboard?.writeText(transaction.utr);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleSaveCategory = async (newCategory) => {
    setSelectedCategory(newCategory);
    setIsEditingCategory(false);
    if (onCategoryUpdate) {
      onCategoryUpdate(transaction.id, newCategory);
    }
  };

  const splits = transaction.splits || [];
  const isSplit = transaction.isSplit || splits.length > 0;

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
        className="bg-[#1C1C1E] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 relative">
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex flex-col items-center mt-2">
            <div className={`text-4xl font-bold mb-2 ${transaction.isExpense === false ? 'text-[#D8EFA8]' : 'text-white'}`}>
              {transaction.isExpense === false ? '+ ' : '- '}₹{Math.abs(transaction.amount).toLocaleString()}
            </div>
            <h2 className="text-xl font-semibold text-white">{transaction.merchant}</h2>
            <div className="text-gray-400 text-sm mt-1 flex items-center gap-2">
              <Calendar size={14} /> {transaction.formattedDate} at {transaction.formattedTime}
            </div>

            {/* Type & Category tags */}
            <div className="mt-3 flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                transaction.isExpense === false ? 'bg-[#D8EFA8]/20 text-[#D8EFA8]' : 'bg-white/10 text-gray-300'
              }`}>
                {transaction.type === 'REFUND' ? 'Refund' : transaction.isExpense === false ? 'Received Payment' : 'Expense'}
              </span>
              {!isEditingCategory ? (
                <button
                  onClick={() => setIsEditingCategory(true)}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-[#0A0A0A] border border-white/10 text-[#D8EFA8] hover:border-[#D8EFA8]/50 transition-all flex items-center gap-1.5"
                  title="Click to edit category"
                >
                  <Tag size={12} />
                  <span>{selectedCategory}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-[#0A0A0A] p-1 rounded-xl border border-white/20">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleSaveCategory(e.target.value)}
                    className="bg-transparent text-xs text-white px-2 py-1 focus:outline-none"
                    autoFocus
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat} className="bg-[#1C1C1E] text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setIsEditingCategory(false)}
                    className="text-gray-400 hover:text-white text-xs px-2"
                  >
                    Done
                  </button>
                </div>
              )}

              {transaction.source && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/5 text-gray-400 uppercase tracking-wider">
                  {transaction.source}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          {/* Social Split Section */}
          <div className="bg-[#0A0A0A] p-4 rounded-2xl border border-white/5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#CDC9EF]" />
                <h4 className="text-sm font-bold text-white">Expense Split</h4>
              </div>

              {!isSplit ? (
                <button
                  type="button"
                  onClick={() => onOpenSplit(transaction)}
                  className="px-3 py-1.5 bg-[#CDC9EF] text-[#0A0A0A] rounded-xl text-xs font-bold hover:bg-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Share2 size={12} /> Split with Friends
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenSplit(transaction)}
                  className="text-xs text-[#CDC9EF] hover:underline font-semibold"
                >
                  Modify Split
                </button>
              )}
            </div>

            {isSplit && splits.length > 0 ? (
              <div className="space-y-2 pt-1 border-t border-white/5">
                {splits.map((split, i) => {
                  const isSettled = split.status === 'SETTLED' || split.status === 'PAID';
                  return (
                    <div
                      key={split.id || i}
                      className="flex items-center justify-between p-2.5 bg-[#1C1C1E] rounded-xl text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{split.owedByName}</div>
                        <div className="text-[11px] text-gray-400">{split.owedByEmail}</div>
                        {split.reminderCount > 0 && !isSettled && (
                          <div className="text-[10px] text-yellow-400 flex items-center gap-1 mt-0.5">
                            <Clock size={10} /> Nudged {split.reminderCount}x
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white">₹{split.amount}</span>

                        {isSettled ? (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#D8EFA8] bg-[#D8EFA8]/10 px-2 py-0.5 rounded-full">
                            <CheckCircle size={12} /> Settled
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onOpenNudge({ ...split, transaction })}
                              className="px-2.5 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="Send reminder to debtor"
                            >
                              <Send size={11} /> Nudge
                            </button>
                            <button
                              type="button"
                              onClick={() => onSettleSplit(split.id)}
                              className="px-2 py-1 bg-[#D8EFA8]/10 hover:bg-[#D8EFA8]/20 text-[#D8EFA8] border border-[#D8EFA8]/20 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="Mark as paid"
                            >
                              <Check size={12} /> Settle
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : !isSplit && (
              <p className="text-xs text-gray-400 leading-relaxed">
                This expense hasn&apos;t been split yet. Share it with friends to automatically request payment via email.
              </p>
            )}
          </div>

          {/* Bank Details */}
          <div className="bg-[#0A0A0A] p-4 rounded-xl flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center text-[#D8EFA8]">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400">Paid via</p>
                <p className="text-white font-medium">{transaction.bankName || "Bank Transfer"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Account</p>
              <p className="text-white font-mono">•••• {transaction.accountLast4 || "XXXX"}</p>
            </div>
          </div>

          {/* Technical Proof */}
          <div className="border-t border-white/10 pt-4">
            <h4 className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-3">Technical Proof</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">UTR / Ref No.</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono text-xs">{transaction.utr || "N/A"}</span>
                  {transaction.utr && (
                    <button
                      onClick={handleCopyUTR}
                      className="text-[#D8EFA8] hover:opacity-80 transition-opacity p-0.5"
                      title="Copy UTR"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-[#0A0A0A] p-3 rounded-lg border border-dashed border-gray-700">
                <p className="text-[10px] text-gray-500 font-mono mb-1 uppercase">Source Snippet</p>
                <p className="text-gray-300 font-mono text-xs leading-relaxed opacity-80 break-words">
                  {transaction.sourceSnippet || "Captured via ARGOS transaction sync."}
                </p>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Main Page Component ---
export default function ExpensesPage() {
  const [selectedTx, setSelectedTx] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [splitTargetTx, setSplitTargetTx] = useState(null);
  const [nudgeTargetSplit, setNudgeTargetSplit] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/transactions?limit=100');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.transactions || []).map(tx => ({
          ...tx,
          id: tx.id,
          merchant: tx.merchant || "Unknown",
          formattedDate: format(new Date(tx.date), "MMM dd, yyyy"),
          formattedTime: format(new Date(tx.date), "hh:mm a"),
          amount: parseFloat(tx.amount),
          type: 'expense',
          category: tx.category || "Uncategorized",
          bankName: tx.bankName || "Bank Transfer",
          accountLast4: tx.accountLast4 || "XXXX",
          status: "Completed",
          utr: tx.utr || `TXN-${tx.id.slice(0, 8)}`,
          sourceSnippet: tx.rawEmailBody || tx.description || "Captured via ARGOS transaction sync.",
          isSplit: tx.isSplit || (tx.splits && tx.splits.length > 0),
          splits: tx.splits || []
        }));
        setTransactions(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Category update handler
  const handleCategoryUpdate = async (txId, newCategory) => {
    try {
      const res = await apiFetch(`/api/transactions/${txId}`, {
        method: 'PATCH',
        json: { category: newCategory }
      });
      if (res.ok) {
        setTransactions(prev => prev.map(t => t.id === txId ? { ...t, category: newCategory } : t));
        if (selectedTx && selectedTx.id === txId) {
          setSelectedTx(prev => ({ ...prev, category: newCategory }));
        }
      }
    } catch (e) {
      console.error("Failed to update category", e);
    }
  };

  // Settle split handler
  const handleSettleSplit = async (splitId) => {
    try {
      const res = await apiFetch(`/api/splits/${splitId}/settle`, {
        method: 'POST'
      });
      if (res.ok) {
        // Refresh local data
        fetchTransactions();
        if (selectedTx) {
          setSelectedTx(prev => ({
            ...prev,
            splits: prev.splits.map(s => s.id === splitId ? { ...s, status: 'SETTLED' } : s)
          }));
        }
      }
    } catch (e) {
      console.error("Failed to settle split", e);
    }
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = 
        tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.description && tx.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tx.category && tx.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = 
        selectedCategory === 'All' || 
        tx.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [transactions, searchQuery, selectedCategory]);

  return (
    <div className="flex-auto h-screen overflow-hidden p-4 md:p-8 font-sans">
      <Header />
      <div className="h-full overflow-y-auto pb-28 custom-scrollbar">
        <div className="p-2 md:p-4">
      
          {/* Page Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Expenses & Transactions</h1>
              <p className="text-gray-400 mt-1 text-sm">
                Track, categorize, and split your financial footprint.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddExpenseOpen(true)}
              className="bg-[#D8EFA8] text-[#0A0A0A] font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:bg-[#cde49a] transition-all cursor-pointer shadow-md"
            >
              <Plus size={16} /> Add Expense
            </button>
          </header>

          {/* Search & Category Filter Toolbar */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search by merchant, note, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1C1C1E] border border-white/5 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D8EFA8]/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-gray-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#CDC9EF] text-[#0A0A0A] shadow-sm'
                      : 'bg-[#1C1C1E] text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction List Container */}
          <div className="bg-[#1C1C1E] rounded-3xl overflow-hidden shadow-lg border border-white/5">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-5 border-b border-gray-800 text-xs text-gray-500 uppercase font-bold tracking-wider">
              <div className="col-span-6 md:col-span-4 pl-2">Merchant / Detail</div>
              <div className="col-span-3 md:col-span-2 hidden md:block">Date</div>
              <div className="col-span-3 md:col-span-2 hidden md:block">Category</div>
              <div className="col-span-3 md:col-span-2 text-center hidden md:block">Status</div>
              <div className="col-span-6 md:col-span-2 text-right pr-2">Amount</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-800/50">
              {loading ? (
                <div className="p-12 text-center text-gray-500">Loading transactions...</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  {searchQuery || selectedCategory !== 'All' 
                    ? 'No transactions matched your filters.' 
                    : 'No transactions found. Add an expense or connect your Gmail inbox!'}
                </div>
              ) : (
                filteredTransactions.map((tx) => (
                  <motion.div 
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedTx(tx)}
                    className="grid grid-cols-12 gap-4 p-5 hover:bg-white/5 cursor-pointer transition-colors group items-center"
                  >
                    {/* Merchant Col */}
                    <div className="col-span-6 md:col-span-4 pl-2 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        tx.isExpense === false ? 'bg-[#D8EFA8]/15 text-[#D8EFA8]' : 'bg-gray-800 text-white'
                      }`}>
                        {tx.isExpense === false ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white group-hover:text-[#CDC9EF] transition-colors line-clamp-1">
                            {tx.merchant}
                          </h3>
                          {tx.isSplit && (
                            <span className="flex items-center gap-1 text-[10px] bg-[#CDC9EF]/20 text-[#CDC9EF] px-2 py-0.5 rounded-full font-bold">
                              <Users size={10} /> Split
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 md:hidden">{tx.formattedDate}</p>
                      </div>
                    </div>

                    {/* Date Col */}
                    <div className="col-span-3 md:col-span-2 hidden md:flex flex-col justify-center text-sm text-gray-400">
                      <span>{tx.formattedDate}</span>
                      <span className="text-xs text-gray-600">{tx.formattedTime}</span>
                    </div>

                    {/* Category Col */}
                    <div className="col-span-3 md:col-span-2 hidden md:flex items-center gap-1.5">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#0A0A0A] border border-gray-800 text-gray-300">
                        {tx.category}
                      </span>
                      {tx.type === 'REFUND' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D8EFA8]/20 text-[#D8EFA8]">
                          Refund
                        </span>
                      )}
                      {(tx.type === 'INCOME' || tx.isExpense === false) && tx.type !== 'REFUND' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D8EFA8]/20 text-[#D8EFA8]">
                          Received
                        </span>
                      )}
                    </div>

                    {/* Status Col */}
                    <div className="col-span-3 md:col-span-2 hidden md:flex justify-center items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#D8EFA8] shadow-[0_0_8px_#D8EFA8]" />
                      <span className="text-xs text-gray-400">Completed</span>
                    </div>

                    {/* Amount Col */}
                    <div className={`col-span-6 md:col-span-2 text-right pr-2 font-bold ${
                      tx.isExpense === false ? 'text-[#D8EFA8]' : 'text-white'
                    }`}>
                      {tx.isExpense === false ? '+ ' : '- '}₹{Math.abs(tx.amount).toLocaleString()}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* TRANSACTION INSPECTOR MODAL */}
          <AnimatePresence>
            {selectedTx && (
              <TransactionInspector 
                transaction={selectedTx} 
                onClose={() => setSelectedTx(null)}
                onOpenSplit={(tx) => setSplitTargetTx(tx)}
                onOpenNudge={(split) => setNudgeTargetSplit(split)}
                onSettleSplit={handleSettleSplit}
                onCategoryUpdate={handleCategoryUpdate}
              />
            )}
          </AnimatePresence>

          {/* SPLIT MODAL */}
          <AnimatePresence>
            {splitTargetTx && (
              <SplitModal
                transaction={splitTargetTx}
                onClose={() => setSplitTargetTx(null)}
                onSplitComplete={() => {
                  fetchTransactions();
                  setSelectedTx(null);
                }}
              />
            )}
          </AnimatePresence>

          {/* NUDGE MODAL */}
          <AnimatePresence>
            {nudgeTargetSplit && (
              <NudgeModal
                split={nudgeTargetSplit}
                onClose={() => setNudgeTargetSplit(null)}
                onNudged={() => {
                  fetchTransactions();
                }}
              />
            )}
          </AnimatePresence>

          {/* ADD EXPENSE MODAL */}
          <AnimatePresence>
            {isAddExpenseOpen && (
              <AddExpenseModal
                onClose={() => setIsAddExpenseOpen(false)}
                onCreated={() => {
                  fetchTransactions();
                }}
              />
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
