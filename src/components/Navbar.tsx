'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, UserPlus, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#faf5ef] border-b border-[#e2d9cd] shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
      <div className="px-4 md:px-8 h-[72px] flex items-center justify-between">
        {/* Brand logo: interviewr.ai by Utkarsh */}
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <svg width="28" height="28" className="md:w-8 md:h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2V10" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M16 22V30" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M2 16H10" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M22 16H30" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M6.1 6.1L11.75 11.75" stroke="#EC4899" strokeWidth="3" strokeLinecap="round"/>
            <path d="M20.25 20.25L25.9 25.9" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round"/>
            <path d="M25.9 6.1L20.25 11.75" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
            <path d="M11.75 20.25L6.1 25.9" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <div>
            <div className="font-extrabold text-[18px] md:text-[22px] text-[#0f172a] tracking-tight leading-none">
              interviewr.<span className="text-[#f59e0b]">ai</span>
            </div>
            <div className="text-[10px] md:text-[11px] text-[#64748b] font-bold mt-0.5 tracking-wide">
              by Utkarsh
            </div>
          </div>
        </Link>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 text-[#0f172a]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation links */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            href="/"
            className={`nav-link font-bold ${pathname === '/' ? 'text-[#0f172a]' : 'text-[#475569]'}`}
          >
            About Us
          </Link>
          <Link
            href="/new"
            className={`nav-link font-bold ${pathname === '/new' ? 'text-[#0f172a]' : 'text-[#475569]'}`}
          >
            AI Evaluator
          </Link>
          <Link
            href="/dashboard"
            className={`nav-link font-bold ${pathname === '/dashboard' ? 'text-[#0f172a]' : 'text-[#475569]'}`}
          >
            Dashboard
          </Link>
          <Link
            href="/login"
            className={`nav-link font-bold inline-flex items-center gap-1.5 ${pathname === '/login' ? 'text-[#0f172a]' : 'text-[#475569]'}`}
          >
            <LogIn size={16} /> Login
          </Link>
          <Link
            href="/register"
            className={`nav-link font-bold inline-flex items-center gap-1.5 ${pathname === '/register' ? 'text-[#0f172a]' : 'text-[#475569]'}`}
          >
            <UserPlus size={16} /> Register
          </Link>

          {/* Action Button */}
          <Link href="/new" className="btn-primary py-2 px-5 text-sm uppercase tracking-wider">
            Start Interview
          </Link>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#e2d9cd] bg-[#faf5ef] px-4 py-4 space-y-4 shadow-lg absolute w-full left-0">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block font-bold ${pathname === '/' ? 'text-[#0f172a]' : 'text-[#475569]'}`}
          >
            About Us
          </Link>
          <Link
            href="/new"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block font-bold ${pathname === '/new' ? 'text-[#0f172a]' : 'text-[#475569]'}`}
          >
            AI Evaluator
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block font-bold ${pathname === '/dashboard' ? 'text-[#0f172a]' : 'text-[#475569]'}`}
          >
            Dashboard
          </Link>
          <hr className="border-[#e2d9cd]" />
          <Link
            href="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`font-bold flex items-center gap-2 ${pathname === '/login' ? 'text-[#0f172a]' : 'text-[#475569]'}`}
          >
            <LogIn size={18} /> Login
          </Link>
          <Link
            href="/register"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`font-bold flex items-center gap-2 ${pathname === '/register' ? 'text-[#0f172a]' : 'text-[#475569]'}`}
          >
            <UserPlus size={18} /> Register
          </Link>
          <div className="pt-2">
             <Link 
               href="/new" 
               onClick={() => setIsMobileMenuOpen(false)}
               className="btn-primary w-full justify-center py-3 text-sm uppercase tracking-wider"
             >
              Start Interview
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
