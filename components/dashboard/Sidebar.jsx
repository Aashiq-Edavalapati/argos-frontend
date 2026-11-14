"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  CreditCard, 
  Users, 
  RefreshCw,
  X,
  Menu
} from 'lucide-react';

export const MENU_ITEMS = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: CreditCard, label: 'Expenses', href: '/expenses' },
  { icon: Users, label: 'Splits & Debts', href: '/splits' },
  { icon: RefreshCw, label: 'Recurring', href: '/recurring' },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <motion.aside 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[#0A0A0A] border-r border-app-card p-6 z-20"
    >
      <div className="text-2xl font-bold text-white mb-10 pl-2 flex items-center gap-2">
        <span>ARGOS</span>
        <span className="text-xs bg-[#D8EFA8] text-[#0A0A0A] px-2 py-0.5 rounded-full font-black">
          LIVE
        </span>
      </div>
      
      <nav className="space-y-2 flex-1">
        {MENU_ITEMS.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center w-full p-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-app-lime text-[#0A0A0A] font-bold shadow-lg shadow-app-lime/20' 
                  : 'text-gray-400 hover:bg-app-card hover:text-white font-medium'
              }`}
            >
              <item.icon size={19} className="mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer subtle brand */}
      <div className="pt-4 border-t border-white/5 text-xs text-gray-500 flex items-center justify-between">
        <span>Context-Aware Finance</span>
        <span className="w-2 h-2 rounded-full bg-[#D8EFA8] animate-pulse" />
      </div>
    </motion.aside>
  );
};

export default Sidebar;
