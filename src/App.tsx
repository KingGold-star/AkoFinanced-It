import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoanWidget } from './components/LoanWidget';
import { StepProcessSection } from './components/StepProcessSection';
import { AnimatedAuroraBackground } from './components/AnimatedAuroraBackground';

// Code-split heavy routes, dashboards, calculators, and modals
const CustomerDashboard = lazy(() => import('./components/CustomerDashboard').then(m => ({ default: m.CustomerDashboard })));
const AdminCRM = lazy(() => import('./components/AdminCRM').then(m => ({ default: m.AdminCRM })));
const StaffLoginGate = lazy(() => import('./components/admin/StaffLoginGate').then(m => ({ default: m.StaffLoginGate })));
const ApplicationWizard = lazy(() => import('./components/ApplicationWizard').then(m => ({ default: m.ApplicationWizard })));
const SmeLoanWizard = lazy(() => import('./components/SmeLoanWizard').then(m => ({ default: m.SmeLoanWizard })));
const PersonalLoanWizard = lazy(() => import('./components/PersonalLoanWizard').then(m => ({ default: m.PersonalLoanWizard })));
const ConfirmationScreen = lazy(() => import('./components/ConfirmationScreen').then(m => ({ default: m.ConfirmationScreen })));
const LoanCalculator = lazy(() => import('./components/LoanCalculator').then(m => ({ default: m.LoanCalculator })));

// Sub-pages lazy loaded on-demand
const IndividualsPage = lazy(() => import('./components/Pages').then(m => ({ default: m.IndividualsPage })));
const BusinessesPage = lazy(() => import('./components/Pages').then(m => ({ default: m.BusinessesPage })));
const HowItWorksPage = lazy(() => import('./components/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const AboutPage = lazy(() => import('./components/AboutUsPage').then(m => ({ default: m.AboutUsPage })));
const FAQsPage = lazy(() => import('./components/FAQsPage').then(m => ({ default: m.FAQsPage })));
const ContactPage = lazy(() => import('./components/ContactPage').then(m => ({ default: m.ContactPage })));
const LegalPage = lazy(() => import('./components/Pages').then(m => ({ default: m.LegalPage })));

const PageLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[420px] w-full py-16">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-[#2D62FF] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-[#5A5F71] font-semibold animate-pulse">Loading experience...</span>
    </div>
  </div>
);
import {
  Shield,
  ArrowRight,
  UserCheck,
  Building2,
  CheckCircle2,
  Clock,
  Award,
  Lock,
  Sparkles,
  ChevronRight,
  FileText,
  Mic,
  PhoneCall
} from 'lucide-react';
import { api, getStoredToken, setStoredToken } from './lib/api';
import { supabase } from './lib/supabase';
import { User } from './types';

const getInitialPage = () => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    const path = window.location.pathname.replace(/^\//, '').toLowerCase();
    if (hash === 'admin' || path === 'admin') return 'admin';
    if (hash === 'dashboard' || path === 'dashboard') return 'dashboard';
    if (hash) return hash;
    if (path && path !== '') return path;
  }
  return 'home';
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>(getInitialPage);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Application wizard flow state
  const [initialApplicantType, setInitialApplicantType] = useState<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL');
  const [initialWizardData, setInitialWizardData] = useState<any>(null);
  const [submittedReference, setSubmittedReference] = useState<string | null>(null);
  const [submittedApplicationData, setSubmittedApplicationData] = useState<any>(null);
  // URL hash and route listener
  useEffect(() => {
    const handleUrlChange = () => {
      const page = getInitialPage();
      if (page && page !== 'home') {
        setCurrentPage(page);
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Load user from storage on initial load & validate session
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = getStoredToken();
      const savedUserStr = localStorage.getItem('akofinanced_user');
      
      if (savedToken && savedUserStr) {
        try {
          const parsedUser = JSON.parse(savedUserStr);
          setToken(savedToken);
          setUser(parsedUser);

          // Verify token in background
          try {
            const meRes = await api.getMe();
            if (meRes && meRes.user) {
              setUser(meRes.user);
              localStorage.setItem('akofinanced_user', JSON.stringify(meRes.user));
            }
          } catch (verErr: any) {
            console.warn('Session background validation error:', verErr);
          }
        } catch (e) {
          setStoredToken(null);
          localStorage.removeItem('akofinanced_user');
        }
      }
    };

    initAuth();

    // Listen for Supabase OAuth / Magic Link sessions with personal emails
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user?.email) {
        const personalEmail = session.user.email;
        const fullName = session.user.user_metadata?.full_name || 
                         session.user.user_metadata?.name || 
                         personalEmail.split('@')[0];
        try {
          const res = await api.login({
            email: personalEmail.toLowerCase().trim(),
            full_name: fullName
          });
          handleLoginSuccess(res.user, res.token);
        } catch (err) {
          console.warn('[Supabase Auth Listener] Auto-login error:', err);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Listen for auth-expired events across the app
  useEffect(() => {
    const handleAuthExpired = () => {
      console.warn('Authentication token expired or invalid.');
      setStoredToken(null);
      localStorage.removeItem('akofinanced_user');
      setUser(null);
      setToken(null);
    };

    window.addEventListener('akofinanced:auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('akofinanced:auth-expired', handleAuthExpired);
    };
  }, []);

  // When a user is signed in, prevent them from seeing the public landing page
  useEffect(() => {
    if (user && (currentPage === 'home' || currentPage === '' || currentPage === '/')) {
      setCurrentPage(user.role !== 'CUSTOMER' ? 'admin' : 'dashboard');
    }
  }, [user, currentPage]);

  const handleLoginSuccess = (loggedInUser: User, loggedInToken: string) => {
    setUser(loggedInUser);
    setToken(loggedInToken);
    setStoredToken(loggedInToken);
    localStorage.setItem('akofinanced_user', JSON.stringify(loggedInUser));

    if (loggedInUser.role !== 'CUSTOMER') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setStoredToken(null);
    localStorage.removeItem('akofinanced_user');
    setCurrentPage('home');
  };

  const handleStartApplication = (type: 'INDIVIDUAL' | 'BUSINESS', prefillData?: any) => {
    setInitialApplicantType(type);
    setInitialWizardData(prefillData || null);
    setCurrentPage('apply-wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplicationCompleted = (referenceNumber: string, data: any) => {
    setSubmittedReference(referenceNumber);
    setSubmittedApplicationData(data);
    setInitialWizardData(null);
    setCurrentPage('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render main screen based on currentPage
  const renderContent = () => {
    const cleanPage = currentPage.replace(/^\//, '');

    switch (cleanPage) {
      case 'calculator':
        return <LoanCalculator onStartApplication={handleStartApplication} onNavigate={(p) => setCurrentPage(p.replace(/^\//, ''))} />;
      case 'individuals':
        return <IndividualsPage onStartApplication={handleStartApplication} onNavigate={setCurrentPage} />;
      case 'businesses':
        return <BusinessesPage onStartApplication={handleStartApplication} onNavigate={setCurrentPage} />;
      case 'how-it-works':
        return <HowItWorksPage onStartApplication={handleStartApplication} onNavigate={setCurrentPage} />;
      case 'about':
        return <AboutPage onStartApplication={handleStartApplication} onNavigate={setCurrentPage} />;
      case 'faqs':
        return <FAQsPage onStartApplication={handleStartApplication} onNavigate={setCurrentPage} />;
      case 'contact':
        return <ContactPage onStartApplication={handleStartApplication} onNavigate={setCurrentPage} />;
      case 'privacy':
      case 'terms':
      case 'disclaimer':
        return <LegalPage onStartApplication={handleStartApplication} onNavigate={setCurrentPage} />;

      case 'apply-wizard': {
        const wizardPrefill = initialWizardData || (user ? {
          firstName: user.full_name?.split(' ')[0] || '',
          lastName: user.full_name?.split(' ').slice(1).join(' ') || '',
          contact_name: user.full_name || '',
          email: user.email || '',
          phone: user.phone || '',
        } : undefined);

        if (initialApplicantType === 'BUSINESS') {
          return (
            <div className="py-8 px-4 sm:px-6">
              <SmeLoanWizard
                initialData={wizardPrefill}
                onCompleted={handleApplicationCompleted}
                onCancel={() => {
                  setInitialWizardData(null);
                  setCurrentPage('home');
                }}
                onSwitchToIndividual={() => {
                  setInitialApplicantType('INDIVIDUAL');
                }}
              />
            </div>
          );
        }

        return (
          <div className="py-8 px-4 sm:px-6">
            <PersonalLoanWizard
              initialData={wizardPrefill}
              onCompleted={handleApplicationCompleted}
              onCancel={() => {
                setInitialWizardData(null);
                setCurrentPage('home');
              }}
              onSwitchToBusiness={() => {
                setInitialApplicantType('BUSINESS');
              }}
            />
          </div>
        );
      }

      case 'confirmation':
        return (
          <ConfirmationScreen
            referenceNumber={submittedReference || 'AKO-229062'}
            onReturnHome={() => {
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );

      case 'dashboard': {
        const activeUser: User = user || {
          id: 'usr-guest',
          email: 'applicant@akofinanced.com',
          full_name: 'Guest Applicant',
          role: 'CUSTOMER',
          created_at: new Date().toISOString()
        };
        return (
          <CustomerDashboard
            user={activeUser}
            onLogout={handleLogout}
            onNavigateHome={() => setCurrentPage('home')}
            onStartApplication={handleStartApplication}
          />
        );
      }

      case 'admin': {
        // Enforce strict staff clearance: regular customers and unauthenticated users cannot access CRM
        if (!user || user.role === 'CUSTOMER') {
          return (
            <StaffLoginGate
              currentUser={user}
              onStaffAuthenticated={(staffUser, staffToken) => {
                handleLoginSuccess(staffUser, staffToken);
                setCurrentPage('admin');
              }}
              onNavigateHome={() => setCurrentPage('home')}
              onLogoutCustomer={handleLogout}
            />
          );
        }

        return (
          <AdminCRM
            user={user}
            onLogout={handleLogout}
            onNavigateHome={() => setCurrentPage('home')}
          />
        );
      }

      case 'home':
      default:
        return (
          <div className="space-y-20 pb-16 animate-fadeIn">
            
            {/* HERO SECTION */}
            <div className="relative overflow-hidden pt-8 pb-12 bg-transparent">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                  
                  {/* Left Column - Content & Copy */}
                  <div className="lg:col-span-6 text-left space-y-6">
                    
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] bg-[#2D62FF]/10 border border-[#2D62FF]/20 text-[#0B0B0F] text-xs font-bold shadow-xs">
                      <Shield className="w-4 h-4 text-[#2D62FF]" />
                      <span>Direct Bank Match Agency • Zero Tedious Paperwork</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0B0B0F] tracking-tight leading-[1.1]">
                      Get a <span className="text-[#2D62FF]">Bank Loan.</span>
                      <br />
                      Skip the <span className="text-[#2D62FF]">Stress.</span>
                    </h1>

                    {/* Paragraph */}
                    <p className="text-base sm:text-lg text-[#5A5F71] font-normal leading-relaxed max-w-xl">
                      Borrow <strong className="font-bold text-[#0B0B0F]">₦250,000 to ₦95,000,000+</strong> for personal or business growth with stress-free bank matching, 24/7 instant pre-approval, and dedicated financial underwriters who handle 100% of the tedious paperwork.
                    </p>

                    {/* Feature Checkmarks (2x2 Grid) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6 text-sm font-semibold text-[#0B0B0F] pt-1">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-[#2D62FF] shrink-0" />
                        <span>24-48 Hour Direct Bank Wire</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-[#2D62FF] shrink-0" />
                        <span>Zero Impact on Credit Score</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-[#2D62FF] shrink-0" />
                        <span>15+ Commercial Bank Partners</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-[#2D62FF] shrink-0" />
                        <span>Dedicated Underwriting Specialist</span>
                      </div>
                    </div>

                    {/* Action & Social Proof Row */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                      <button
                        onClick={() => {
                          setCurrentPage('calculator');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-6 py-3.5 rounded-[12px] bg-[#0B0B0F] text-white font-extrabold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer shadow-md"
                      >
                        <span>Calculate Loan</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </button>

                      <button
                        onClick={() => {
                          setCurrentPage('how-it-works');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-5 py-3.5 rounded-[12px] bg-[#2D62FF]/10 text-[#2D62FF] font-extrabold text-sm hover:bg-[#2D62FF]/20 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <span>How It Works</span>
                      </button>

                      {/* Ratings & Overlapping Avatars */}
                      <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-[12px] border border-slate-200 shadow-xs">
                        <div className="flex -space-x-2 overflow-hidden">
                          <img
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100"
                            alt="User"
                            loading="lazy"
                            decoding="async"
                            width="32"
                            height="32"
                          />
                          <img
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100"
                            alt="User"
                            loading="lazy"
                            decoding="async"
                            width="32"
                            height="32"
                          />
                          <img
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100&h=100"
                            alt="User"
                            loading="lazy"
                            decoding="async"
                            width="32"
                            height="32"
                          />
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#0B0B0F] text-white text-[10px] font-extrabold ring-2 ring-white">
                            +2.5k
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-amber-400 text-xs">
                            <span>★★★★★</span>
                            <span className="font-bold text-[#0B0B0F] text-xs ml-1">4.9 Star Rating</span>
                          </div>
                          <span className="text-[11px] text-[#5A5F71] font-medium block">
                            Over ₦150B+ Loans Secured
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Disclaimer Footnote */}
                    <div className="flex items-center gap-2 text-xs text-[#5A5F71] font-medium pt-1">
                      <Shield className="w-4 h-4 text-[#2D62FF] shrink-0" />
                      <span>AkoFinanced is a licensed bank financial loan advisory and broker network.</span>
                    </div>
                  </div>

                  {/* Right Column - Interactive Loan Widget Card */}
                  <div className="lg:col-span-6">
                    <LoanWidget onStartApplication={(data) => handleStartApplication(data.applicantType, data)} />
                  </div>

                </div>
              </div>
            </div>

            {/* TRUST & ADVISORY DISCLOSURE BANNER */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-[#2D62FF] text-white rounded-[12px] p-6 sm:p-10 shadow-xl border border-blue-600 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                  
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-[12px] bg-white/20 text-white flex items-center justify-center font-bold">
                      <Shield className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-base text-white">Independent Advisory Intermediary</h3>
                    <p className="text-xs text-blue-100 leading-relaxed">
                      AkoFinanced It is a non-lending advisory brokerage. We prepare your documentation for institutional bank standards.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-[12px] bg-white/20 text-white flex items-center justify-center font-bold">
                      <Award className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-base text-white">Institutional Lender Matching</h3>
                    <p className="text-xs text-blue-100 leading-relaxed">
                      We match your risk profile with licensed commercial banks and finance companies [DEMO].
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-[12px] bg-white/20 text-white flex items-center justify-center font-bold">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-base text-white">End-to-End Status Tracking</h3>
                    <p className="text-xs text-blue-100 leading-relaxed">
                      Monitor your application stage in real-time, upload missing papers, and communicate directly with assigned loan officers.
                    </p>
                  </div>

                </div>
              </div>
            </div>

            {/* 5-STAGE ADVISORY PROCESS */}
            {!user && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <StepProcessSection onApplyClick={() => handleStartApplication('INDIVIDUAL')} />
              </div>
            )}

            {/* CATEGORIES SECTION */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-[#0B0B0F]">Financing Category Paths</h2>
                <p className="text-xs text-[#5A5F71] max-w-lg mx-auto">
                  Select the financing pathway tailored to your specific background and financial goals.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Individual Card */}
                <div className="bg-white rounded-[12px] border-2 border-[#2D62FF] p-8 space-y-6 shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-[12px] bg-[#2D62FF]/10 text-[#2D62FF] flex items-center justify-center">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-[#0B0B0F]">Individual & Salaried Earners</h3>
                    <p className="text-xs text-[#5A5F71] leading-relaxed">
                      For salary earners and individual professionals seeking asset procurement, automobile financing, solar installation, or salary advances.
                    </p>
                    
                    <ul className="space-y-2 text-xs text-[#0B0B0F] font-semibold">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2D62FF]" />
                        <span>Up to ₦10,000,000 credit threshold</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2D62FF]" />
                        <span>Flexible 3 to 24 months repayment</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2D62FF]" />
                        <span>Requires salary bank statements & valid ID</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleStartApplication('INDIVIDUAL')}
                    className="w-full py-3.5 rounded-[12px] bg-[#2D62FF] text-white font-extrabold text-xs shadow-md hover:bg-[#1a4edf] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Start Individual Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Business Card */}
                <div className="bg-[#2D62FF] text-white rounded-[12px] border border-blue-600 p-8 space-y-6 shadow-xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-[12px] bg-white/20 text-white flex items-center justify-center">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-white">Corporate & SME Enterprise</h3>
                    <p className="text-xs text-blue-100 leading-relaxed">
                      For registered Nigerian businesses needing LPO financing, working capital expansion, contract execution, or equipment leasing.
                    </p>

                    <ul className="space-y-2 text-xs text-white font-semibold">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Up to ₦50,000,000 SME credit capacity</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>LPO & Contract financing support</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Requires CAC papers & 6-12 months bank statements</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleStartApplication('BUSINESS')}
                    className="w-full py-3.5 rounded-[12px] bg-white text-[#2D62FF] font-extrabold text-xs shadow-md hover:bg-blue-50 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Start Business Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>

          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col text-[#102A43] font-sans selection:bg-[#2D62FF] selection:text-white">
      
      {/* Animated Multi-Color Gradient Mesh Background */}
      <AnimatedAuroraBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar (Hidden for Admin, Dashboard, and any signed-in user views because they contain their own full header and navigation) */}
        {currentPage !== 'admin' && currentPage !== 'dashboard' && !user && (
          <Navbar
            user={user}
            currentPath={currentPage.startsWith('/') ? currentPage : `/${currentPage}`}
            onNavigate={(page) => {
              const target = page.replace(/^\//, '');
              if (target === 'apply') {
                handleStartApplication('INDIVIDUAL');
              } else {
                setCurrentPage(target || 'home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onLogout={handleLogout}
          />
        )}

        {/* Main Page Area */}
        <main className={`flex-1 ${currentPage === 'dashboard' || currentPage === 'admin' || !!user ? 'pt-0' : 'pt-20 sm:pt-24'} bg-white`}>
          <Suspense fallback={<PageLoadingFallback />}>
            {renderContent()}
          </Suspense>
        </main>

        {/* Footer */}
        {currentPage !== 'admin' && currentPage !== 'dashboard' && !user && (
          <Footer
            onNavigate={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onStartApplication={handleStartApplication}
          />
        )}
      </div>

    </div>
  );
}
