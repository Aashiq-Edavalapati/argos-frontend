"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, LogOut, Menu, X } from 'lucide-react';
import useAuthStore from '../../src/store/useAuthStore';
import { apiFetch } from '../../src/lib/api';
import { MENU_ITEMS } from './Sidebar';

const Header = ({ title: propTitle }) => {
  const { user, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  const getPageTitle = () => {
    if (propTitle) return propTitle;
    if (pathname === '/expenses') return 'Expenses & Transactions';
    if (pathname === '/splits') return 'Splits & Debts';
    if (pathname === '/recurring') return 'Recurring Commitments';
    return 'Dashboard';
  };

  const getInitials = (name) => {
    if (!name) return 'US';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.name || user?.email?.split('@')[0] || "User";
  const initials = getInitials(displayName);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', {
        method: "POST"
      });
    } catch (error) {
      console.warn("Backend logout notification failed:", error);
    } finally {
      logout();
      router.push('/login');
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8 gap-4 relative">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-[#1C1C1E] text-white hover:bg-white/10 transition-colors"
            title="Open Menu"
          >
            <Menu size={20} />
          </button>

          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-[#CDC9EF] p-1.5 pr-3 md:pr-4 rounded-full cursor-pointer hover:opacity-90 transition-opacity select-none"
            >
              <div className="w-8 h-8 rounded-full bg-[#0A0A0A] flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
              <span className="text-[#0A0A0A] font-semibold text-sm hidden sm:inline truncate max-w-[120px]">
                {displayName}
              </span>
              <ChevronDown 
                size={14} 
                className={`text-[#0A0A0A] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-52 bg-[#1C1C1E] border border-gray-800 rounded-2xl shadow-2xl py-1.5 z-50 overflow-hidden">
                <div className="px-4 py-2 border-b border-white/5">
                  <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                  <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-red-400 hover:bg-[#2C2C2E] flex items-center gap-2 transition-colors text-xs font-bold"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden flex"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="w-72 bg-[#0A0A0A] h-full p-6 flex flex-col justify-between border-r border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex justify-between items-center mb-8">
                <div className="text-xl font-bold text-white flex items-center gap-2">
                  <span>ARGOS</span>
                  <span className="text-xs bg-[#D8EFA8] text-[#0A0A0A] px-2 py-0.5 rounded-full font-black">
                    LIVE
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="space-y-2">
                {MENU_ITEMS.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center w-full p-3 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-app-lime text-[#0A0A0A] font-bold' 
                          : 'text-gray-400 hover:bg-app-card hover:text-white font-medium'
                      }`}
                    >
                      <item.icon size={19} className="mr-3" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/5">
              <button
                onClick={handleLogout}
                className="w-full p-3 text-red-400 hover:bg-red-500/10 rounded-xl flex items-center gap-2 text-sm font-semibold transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
