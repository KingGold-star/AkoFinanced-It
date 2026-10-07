import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  user,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          // Hysteresis threshold to avoid jitter around scroll boundary
          if (y > 40) {
            setScrolled(true);
          } else if (y < 15) {
            setScrolled(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Calculator', path: '/calculator' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'About Us', path: '/about' },
    { label: 'FAQs', path: '/faqs' },
    { label: 'Contact', path: '/contact' }
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  const isStaff = user && ['SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER', 'REVIEWER'].includes(user.role);

  // Smooth custom spring transition for professional, polished morphing
  const springTransition = {
    type: 'spring' as const,
    stiffness: 220,
    damping: 26,
    mass: 0.8
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex flex-col items-center pointer-events-none px-3 sm:px-6 pt-2.5 sm:pt-3.5">
      {/* Backdrop overlay when mobile menu is open to dismiss easily */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-[-1] pointer-events-auto md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Responsive Navbar Container */}
      <div 
        className={`pointer-events-auto w-full max-w-6xl flex items-center justify-between transition-all duration-300 ease-out rounded-full ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-slate-900/5 px-3.5 sm:px-6 py-2 sm:py-2.5' 
            : 'bg-white/70 backdrop-blur-md sm:bg-transparent sm:backdrop-blur-none shadow-none px-3.5 sm:px-6 py-2.5 sm:py-3.5'
        }`}
      >
        {/* Brand Logo */}
        <button 
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-2 sm:gap-2.5 text-left group focus:outline-none cursor-pointer select-none shrink-0"
        >
          <div className="shrink-0 transition-transform duration-200 group-hover:scale-105">
            <BrandLogo size={32} />
          </div>
          <div className="flex items-center gap-0.5 xs:gap-1 whitespace-nowrap">
            <span className="font-extrabold text-sm sm:text-base md:text-lg tracking-tight text-[#0B0B0F]">AkoFinanced</span>
            <span className="font-extrabold text-sm sm:text-base md:text-lg tracking-tight text-[#2D62FF]">It</span>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'text-[#2D62FF] bg-[#2D62FF]/10 font-bold' 
                    : 'text-[#5A5F71] hover:text-[#0B0B0F] hover:bg-slate-100/70'
                }`}
              >
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
          {user && (
            <div className="flex items-center gap-1.5 lg:gap-2">
              <button
                onClick={() => handleNavClick(isStaff ? '/admin' : '/dashboard')}
                className="flex items-center gap-1 sm:gap-1.5 px-3.5 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-bold bg-[#2D62FF]/10 text-[#0B0B0F] hover:bg-[#2D62FF]/20 transition-colors cursor-pointer whitespace-nowrap"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#2D62FF]" />
                <span>{isStaff ? 'Staff CRM' : 'My Dashboard'}</span>
              </button>
              <button
                onClick={onLogout}
                className="text-xs font-semibold text-[#5A5F71] hover:text-[#0B0B0F] px-2 py-1 cursor-pointer whitespace-nowrap transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}

          <button
            onClick={() => handleNavClick('/apply')}
            className="flex items-center gap-1.5 bg-[#0B0B0F] hover:bg-slate-800 text-white font-bold text-xs lg:text-sm px-4 py-2 lg:px-5 lg:py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <span>Apply Now</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-1.5 xs:gap-2 shrink-0">
          <button
            onClick={() => handleNavClick('/apply')}
            className="px-3 py-1.5 rounded-full bg-[#0B0B0F] text-white text-xs font-extrabold shadow-xs cursor-pointer active:scale-95 transition-transform flex items-center gap-1 whitespace-nowrap"
          >
            <span>Apply</span>
            <ArrowRight className="w-3 h-3 text-white" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full bg-slate-100/90 hover:bg-slate-200 text-[#0B0B0F] focus:outline-none cursor-pointer transition-colors flex items-center justify-center shadow-xs"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-[#0B0B0F]" /> : <Menu className="w-4 h-4 text-[#0B0B0F]" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown (Floating Pill Card) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="w-full max-w-5xl mt-2 pointer-events-auto bg-white/98 backdrop-blur-2xl shadow-2xl rounded-2xl p-3.5 xs:p-4 space-y-3 md:hidden overflow-y-auto max-h-[82vh]"
          >
            <div className="grid grid-cols-2 gap-2 pb-3">
              {navLinks.map((link) => {
                const isActive = currentPath === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className={`text-left px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-[#2D62FF]/10 text-[#2D62FF] font-extrabold'
                        : 'text-[#0B0B0F] bg-slate-50/80 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <span className="truncate">{link.label}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#2D62FF] shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 pt-1">
              {user && (
                <div className="space-y-2">
                  <div className="px-3 py-2 bg-slate-50 rounded-xl text-xs flex items-center justify-between">
                    <span className="font-semibold text-[#5A5F71] truncate">{user.name || user.email}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#2D62FF]/10 text-[#2D62FF]">
                      {isStaff ? 'Staff' : 'Applicant'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleNavClick(isStaff ? '/admin' : '/dashboard')}
                      className="flex items-center justify-center gap-1.5 py-3 min-h-[44px] rounded-full bg-[#2D62FF]/10 text-[#0B0B0F] font-bold text-xs hover:bg-[#2D62FF]/20 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-[#2D62FF]" />
                      <span>{isStaff ? 'CRM Portal' : 'My Dashboard'}</span>
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="py-3 min-h-[44px] rounded-full bg-slate-100 text-[#5A5F71] hover:text-[#0B0B0F] font-bold text-xs transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => handleNavClick('/apply')}
                className="w-full flex items-center justify-center gap-2 py-3 min-h-[44px] rounded-full bg-[#0B0B0F] hover:bg-slate-800 text-white font-extrabold text-xs shadow-md active:scale-98 transition-transform"
              >
                <span>Start Loan Application</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};


