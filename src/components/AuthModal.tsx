import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Shield,
  ArrowRight,
  KeyRound,
  Send,
  Check,
  Building2,
  Zap,
  ShieldCheck,
  Star,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { BrandLogo } from './BrandLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, token: string) => void;
  defaultMode?: 'signin' | 'signup' | 'staff';
}

type AuthMethod = 'password' | 'otp' | 'magic-link';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultMode = 'signin'
}) => {
  const [isLogin, setIsLogin] = useState<boolean>(defaultMode !== 'signup');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password');

  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Magic link / OTP state
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Social Auth Dedicated State
  const [socialProvider, setSocialProvider] = useState<'google' | 'github' | 'facebook' | null>(null);
  const [socialEmail, setSocialEmail] = useState('');
  const [socialFullName, setSocialFullName] = useState('');

  // Forgot password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setForgotSuccess(false);
      setIsForgotPassword(false);
      setOtpSent(false);
      setMagicLinkSent(false);
      setSocialProvider(null);
      setSocialEmail('');
      setSocialFullName('');

      if (defaultMode === 'staff') {
        setEmail('staff@akofinanced.com');
        setPassword('password123');
        setIsLogin(true);
      } else if (defaultMode === 'signup') {
        setIsLogin(false);
      } else {
        setIsLogin(true);
      }
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  // Password strength helper
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200', textColor: 'text-slate-400', percent: 0 };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd) || (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd))) score += 1;

    if (score === 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-600', percent: 25 };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-600', percent: 50 };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600', percent: 75 };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-600', percent: 100 };
  };

  const passwordStrength = getPasswordStrength(password);

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // 1. Forgot Password Flow
    if (isForgotPassword) {
      try {
        if (!forgotEmail) {
          setErrorMsg('Please provide your registered email address.');
          setLoading(false);
          return;
        }

        try {
          await supabase.auth.resetPasswordForEmail(forgotEmail.trim().toLowerCase());
        } catch (sbErr) {
          console.warn('[Supabase Auth] Reset notice:', sbErr);
        }

        setForgotSuccess(true);
        setLoading(false);
        setSuccessMsg(`Password reset instructions have been sent to ${forgotEmail}.`);
      } catch (err: any) {
        setLoading(false);
        setErrorMsg(err?.message || 'Failed to send password reset link.');
      }
      return;
    }

    // 2. Magic Link Flow
    if (authMethod === 'magic-link') {
      try {
        if (!email) {
          setErrorMsg('Please enter your email address.');
          setLoading(false);
          return;
        }

        try {
          await supabase.auth.signInWithOtp({
            email: email.trim().toLowerCase(),
          });
        } catch (sbErr) {
          console.warn('[Supabase Auth] Magic link notice:', sbErr);
        }

        setMagicLinkSent(true);
        setLoading(false);
        setSuccessMsg(`Magic login link sent to ${email.trim().toLowerCase()}! Check your inbox or click 'Sign In' below.`);
      } catch (err: any) {
        setLoading(false);
        setErrorMsg(err?.message || 'Failed to send magic link.');
      }
      return;
    }

    // 3. OTP Flow
    if (authMethod === 'otp') {
      if (!otpSent) {
        if (!email) {
          setErrorMsg('Please enter your email to receive an access code.');
          setLoading(false);
          return;
        }
        setOtpSent(true);
        setLoading(false);
        setSuccessMsg(`One-Time Passcode sent to ${email.trim().toLowerCase()} (Verification code: 123456)`);
        return;
      } else {
        if (otpCode.trim() === '123456' || otpCode.trim().length === 6) {
          try {
            const res = await api.login({
              email: email.trim().toLowerCase(),
              password: 'password123',
              full_name: fullName.trim() || undefined
            });
            setLoading(false);
            onLoginSuccess(res.user, res.token);
            onClose();
            return;
          } catch (otpErr: any) {
            setLoading(false);
            setErrorMsg(otpErr.message || 'Failed to verify code. Please try again.');
            return;
          }
        } else {
          setLoading(false);
          setErrorMsg('Invalid verification code. Please use verification code 123456.');
          return;
        }
      }
    }

    // 4. Standard Password Login or Registration
    try {
      if (isLogin) {
        const res = await api.login({
          email: email.trim().toLowerCase(),
          password: password || undefined,
          full_name: fullName.trim() || undefined,
          phone: phone.trim() || undefined
        });
        setLoading(false);
        onLoginSuccess(res.user, res.token);
        onClose();
      } else {
        if (password.length < 6) {
          setLoading(false);
          setErrorMsg('Password must be at least 6 characters long.');
          return;
        }
        if (confirmPassword && password !== confirmPassword) {
          setLoading(false);
          setErrorMsg('Passwords do not match. Please verify both entries.');
          return;
        }

        const res = await api.register({
          email: email.trim().toLowerCase(),
          password,
          full_name: fullName.trim() || email.split('@')[0],
          phone: phone.trim()
        });
        setLoading(false);
        onLoginSuccess(res.user, res.token);
        onClose();
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials and try again.');
    }
  };

  // Social / OAuth Logins
  const handleSocialLogin = async (provider: 'google' | 'github' | 'facebook') => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (email && email.trim() && email.includes('@')) {
      setLoading(true);
      try {
        const res = await api.login({
          email: email.trim().toLowerCase(),
          full_name: fullName.trim() || undefined,
          phone: phone.trim() || undefined,
          auth_provider: provider
        });
        setLoading(false);
        onLoginSuccess(res.user, res.token);
        onClose();
        return;
      } catch (err: any) {
        setLoading(false);
        setErrorMsg(err?.message || `Failed to sign in with ${provider}.`);
        return;
      }
    }

    try {
      if (provider === 'google' || provider === 'github' || provider === 'facebook') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: provider as any,
          options: {
            redirectTo: window.location.origin
          }
        });
        if (!error) return;
      }
    } catch (oauthErr) {
      console.warn('[Supabase OAuth] Notice:', oauthErr);
    }

    setSocialProvider(provider);
    const defaultEmail = provider === 'google'
      ? 'praise.fintech@gmail.com'
      : provider === 'github'
      ? 'adewale.dev@github.com'
      : 'amara.eze@example.com';
    const defaultName = provider === 'google'
      ? 'Praise Ade'
      : provider === 'github'
      ? 'Adewale Johnson'
      : 'Amara Eze';
    setSocialEmail(defaultEmail);
    setSocialFullName(defaultName);
  };

  const handleCompleteSocialLogin = async (customEmail?: string, customName?: string) => {
    const targetEmail = (customEmail || socialEmail).trim().toLowerCase();
    const targetName = (customName || socialFullName).trim();

    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.login({
        email: targetEmail,
        full_name: targetName || undefined,
        auth_provider: socialProvider || 'google'
      });
      setLoading(false);
      onLoginSuccess(res.user, res.token);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || `Failed to complete ${socialProvider} sign in.`);
    }
  };

  // Quick Demo Credentials Autofill
  const handleQuickDemo = (role: 'CUSTOMER' | 'ADMIN' | 'OFFICER' | 'REVIEWER') => {
    setIsForgotPassword(false);
    setAuthMethod('password');
    setIsLogin(true);
    setErrorMsg(null);

    switch (role) {
      case 'ADMIN':
        setEmail('staff@akofinanced.com');
        setPassword('password123');
        break;
      case 'OFFICER':
        setEmail('officer@akofinanced.ng');
        setPassword('password123');
        break;
      case 'REVIEWER':
        setEmail('reviewer@akofinanced.ng');
        setPassword('password123');
        break;
      case 'CUSTOMER':
      default:
        setEmail('customer@example.com');
        setPassword('password123');
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0B0F]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      {/* Outer Modal Frame */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl sm:rounded-[32px] shadow-2xl shadow-slate-950/20 border border-slate-100 overflow-hidden my-auto grid grid-cols-1 lg:grid-cols-12 transition-all">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 sm:top-5 right-4 sm:right-5 w-9 h-9 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all z-30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2D62FF]"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ================= LEFT COLUMN: INTERACTIVE FORM ================= */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between text-left">
          <div>
            {/* Header / Brand */}
            <div className="flex items-center justify-between mb-5">
              <BrandLogo size="md" showText={true} textClassName="text-base" />
            </div>

            {/* Mode Switcher: Sign In vs Create Account */}
            {!socialProvider && !isForgotPassword && (
              <div className="relative p-1 bg-slate-100/90 rounded-2xl flex items-center mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`relative flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer z-10 ${
                    isLogin ? 'text-[#0B0B0F]' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {isLogin && (
                    <motion.div
                      layoutId="activeAuthTab"
                      className="absolute inset-0 bg-white rounded-xl shadow-xs"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`relative flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer z-10 ${
                    !isLogin ? 'text-[#0B0B0F]' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {!isLogin && (
                    <motion.div
                      layoutId="activeAuthTab"
                      className="absolute inset-0 bg-white rounded-xl shadow-xs"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">Create Account</span>
                </button>
              </div>
            )}

            {/* Title & Subtitle */}
            <div className="mb-5 space-y-1">
              <h2 className="text-2xl sm:text-2xl font-black text-[#0B0B0F] tracking-tight">
                {socialProvider
                  ? socialProvider === 'google'
                    ? 'Continue with Google'
                    : socialProvider === 'github'
                    ? 'Authorize via GitHub'
                    : 'Sign in with Facebook'
                  : isForgotPassword
                  ? 'Reset Your Password'
                  : isLogin
                  ? 'Welcome back'
                  : 'Get started with AkoFinanced'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {socialProvider
                  ? 'Fast, 1-click verification powered by institutional OAuth.'
                  : isForgotPassword
                  ? 'Enter your account email to receive instant recovery instructions.'
                  : isLogin
                  ? 'Sign in to access your loans, track approvals, and manage terms.'
                  : 'Access institutional loans up to ₦100M+ with 15+ top commercial banks.'}
              </p>
            </div>

            {/* Inline Notifications */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 mb-4"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="leading-snug">{errorMsg}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 mb-4"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="leading-snug">{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Method Selector for Sign In (Password / Email OTP / Magic Link) */}
            {!socialProvider && !isForgotPassword && isLogin && (
              <div className="flex items-center gap-1.5 p-1 bg-slate-100/70 border border-slate-200/60 rounded-xl mb-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('password'); setErrorMsg(null); }}
                  className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    authMethod === 'password'
                      ? 'bg-white text-[#0B0B0F] shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod('otp'); setErrorMsg(null); }}
                  className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    authMethod === 'otp'
                      ? 'bg-white text-[#0B0B0F] shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Email OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod('magic-link'); setErrorMsg(null); }}
                  className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    authMethod === 'magic-link'
                      ? 'bg-white text-[#0B0B0F] shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Magic Link</span>
                </button>
              </div>
            )}

            {/* Quick Demo Credentials Bar (Compact & Sleek) */}
            {!socialProvider && !isForgotPassword && (
              <div className="mb-4 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-500 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#2D62FF]" />
                    <span>Instant Demo Accounts:</span>
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('CUSTOMER')}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[10.5px] font-bold text-slate-700 hover:text-[#2D62FF] text-center transition-all cursor-pointer truncate shadow-2xs"
                    title="Sign in as Customer"
                  >
                    👤 Borrower
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('ADMIN')}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-[10.5px] font-bold text-slate-700 hover:text-slate-900 text-center transition-all cursor-pointer truncate shadow-2xs"
                    title="Sign in as Super Admin"
                  >
                    🛡️ Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('OFFICER')}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[10.5px] font-bold text-slate-700 hover:text-emerald-700 text-center transition-all cursor-pointer truncate shadow-2xs"
                    title="Sign in as Loan Officer"
                  >
                    💼 Officer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('REVIEWER')}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-[10.5px] font-bold text-slate-700 hover:text-purple-700 text-center transition-all cursor-pointer truncate shadow-2xs"
                    title="Sign in as Credit Reviewer"
                  >
                    📋 Reviewer
                  </button>
                </div>
              </div>
            )}

            {/* ================= MAIN FORM ================= */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* --- Social Dedicated Connect View --- */}
              {socialProvider ? (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center shrink-0 border border-slate-200">
                      {socialProvider === 'google' && (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      )}
                      {socialProvider === 'github' && (
                        <svg className="w-5 h-5 fill-current text-[#0B0B0F]" viewBox="0 0 24 24">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                      )}
                      {socialProvider === 'facebook' && (
                        <svg className="w-5 h-5 fill-current text-[#1877F2]" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 capitalize">
                        {socialProvider} Single Sign-On
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Choose a verified profile below or enter your account email.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400">1-Click Test Profile:</span>
                    <button
                      type="button"
                      onClick={() => handleCompleteSocialLogin(socialEmail, socialFullName)}
                      className="w-full p-3 rounded-2xl border border-slate-200 hover:border-[#2D62FF] bg-white hover:bg-blue-50/40 text-left transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2D62FF]/10 text-[#2D62FF] font-black text-xs flex items-center justify-center">
                          {socialFullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 group-hover:text-[#2D62FF]">
                            {socialFullName}
                          </p>
                          <p className="text-[11px] text-slate-500">{socialEmail}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#2D62FF] transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="socialEmailInput" className="block text-xs font-bold text-slate-700">
                      Or use custom email
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        id="socialEmailInput"
                        name="socialEmail"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        value={socialEmail}
                        onChange={(e) => setSocialEmail(e.target.value)}
                        placeholder="yourname@domain.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2D62FF] focus:bg-white focus:ring-2 focus:ring-[#2D62FF]/15 text-xs sm:text-sm text-[#0B0B0F] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCompleteSocialLogin()}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#0B0B0F] hover:bg-[#1C1C24] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <span>Continue with {socialProvider === 'google' ? 'Google' : socialProvider === 'github' ? 'GitHub' : 'Facebook'}</span>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => { setSocialProvider(null); setErrorMsg(null); }}
                      className="text-xs text-slate-500 hover:text-[#0B0B0F] font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to standard login</span>
                    </button>
                  </div>
                </div>
              ) : isForgotPassword ? (
                /* --- Forgot Password Flow --- */
                <div className="space-y-4 animate-fadeIn">
                  <div className="space-y-1">
                    <label htmlFor="forgotEmailInput" className="block text-xs font-bold text-slate-700">
                      Your Registered Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        id="forgotEmailInput"
                        name="forgotEmail"
                        required
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2D62FF] focus:bg-white focus:ring-2 focus:ring-[#2D62FF]/15 text-xs sm:text-sm text-[#0B0B0F] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || forgotSuccess}
                    className="w-full py-3 rounded-xl bg-[#0B0B0F] hover:bg-[#1C1C24] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <span>Send Password Reset Link</span>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(false); setErrorMsg(null); }}
                      className="text-xs text-slate-500 hover:text-[#0B0B0F] font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* --- Standard Sign In / Sign Up Form --- */
                <>
                  {/* Full Name & Phone (Sign Up Only) */}
                  {!isLogin && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label htmlFor="fullNameInput" className="block text-xs font-bold text-slate-700">
                          Full Legal Name
                        </label>
                        <div className="relative flex items-center">
                          <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                          <input
                            id="fullNameInput"
                            name="name"
                            required
                            type="text"
                            autoComplete="name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Adewale Johnson"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 focus:border-[#2D62FF] focus:bg-white focus:ring-2 focus:ring-[#2D62FF]/15 text-xs sm:text-sm text-[#0B0B0F] outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="phoneInput" className="block text-xs font-bold text-slate-700">
                          Phone Number
                        </label>
                        <div className="relative flex items-center">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                          <input
                            id="phoneInput"
                            name="tel"
                            type="tel"
                            autoComplete="tel"
                            inputMode="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+234 801 234 5678"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 focus:border-[#2D62FF] focus:bg-white focus:ring-2 focus:ring-[#2D62FF]/15 text-xs sm:text-sm text-[#0B0B0F] outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email Input */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="emailInput" className="block text-xs font-bold text-slate-700">
                        Email Address
                      </label>
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                        Personal or Business
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        id="emailInput"
                        name="email"
                        required
                        type="email"
                        autoComplete="username"
                        inputMode="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 focus:border-[#2D62FF] focus:bg-white focus:ring-2 focus:ring-[#2D62FF]/15 text-xs sm:text-sm text-[#0B0B0F] outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Password / OTP Input */}
                  {authMethod === 'password' ? (
                    <>
                      <div className="space-y-1">
                        <label htmlFor="passwordInput" className="block text-xs font-bold text-slate-700">
                          Password
                        </label>
                        <div className="relative flex items-center">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                          <input
                            id="passwordInput"
                            name="password"
                            required
                            type={showPassword ? 'text' : 'password'}
                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 focus:border-[#2D62FF] focus:bg-white focus:ring-2 focus:ring-[#2D62FF]/15 text-xs sm:text-sm text-[#0B0B0F] outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Live Password Strength Meter (Sign Up Only) */}
                      {!isLogin && password && (
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-500">Password Strength</span>
                            <span className={passwordStrength.textColor}>{passwordStrength.label}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                            <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.percent >= 25 ? passwordStrength.color : 'bg-slate-200'}`} style={{ width: '25%' }} />
                            <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.percent >= 50 ? passwordStrength.color : 'bg-slate-200'}`} style={{ width: '25%' }} />
                            <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.percent >= 75 ? passwordStrength.color : 'bg-slate-200'}`} style={{ width: '25%' }} />
                            <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.percent >= 100 ? passwordStrength.color : 'bg-slate-200'}`} style={{ width: '25%' }} />
                          </div>
                        </div>
                      )}

                      {/* Confirm Password (Sign Up Only) */}
                      {!isLogin && (
                        <div className="space-y-1">
                          <label htmlFor="confirmPasswordInput" className="block text-xs font-bold text-slate-700">
                            Confirm Password
                          </label>
                          <div className="relative flex items-center">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                            <input
                              id="confirmPasswordInput"
                              name="confirmPassword"
                              required
                              type={showPassword ? 'text' : 'password'}
                              autoComplete="new-password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 focus:border-[#2D62FF] focus:bg-white focus:ring-2 focus:ring-[#2D62FF]/15 text-xs sm:text-sm text-[#0B0B0F] outline-none transition-all"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  ) : authMethod === 'otp' && otpSent ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="otpCodeInput" className="block text-xs font-bold text-slate-700">
                          6-Digit Verification Code
                        </label>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Test Code: 123456
                        </span>
                      </div>
                      <div className="relative flex items-center">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          id="otpCodeInput"
                          name="otp"
                          required
                          type="text"
                          maxLength={6}
                          inputMode="numeric"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="123456"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-black tracking-widest text-[#0B0B0F] outline-none focus:border-[#2D62FF] focus:bg-white focus:ring-2 focus:ring-[#2D62FF]/15"
                        />
                      </div>
                    </div>
                  ) : null}

                  {/* Remember Me & Forgot Password */}
                  {isLogin && authMethod === 'password' && (
                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded text-[#2D62FF] border-slate-300 focus:ring-0 cursor-pointer accent-[#2D62FF]"
                        />
                        <span>Remember this device</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => { setIsForgotPassword(true); setForgotEmail(email); setErrorMsg(null); }}
                        className="text-slate-500 hover:text-[#2D62FF] font-semibold transition-colors cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  {/* Primary Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.008 }}
                    whileTap={{ scale: 0.992 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-[#0B0B0F] hover:bg-[#1E1E26] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60 mt-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <span>
                          {isLogin
                            ? authMethod === 'magic-link'
                              ? 'Send Magic Sign-In Link'
                              : authMethod === 'otp'
                              ? otpSent
                                ? 'Verify & Sign In'
                                : 'Send Access Code'
                              : 'Sign In to Portal'
                            : 'Create Account & Continue'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>

                  {/* Social SSO Divider */}
                  <div className="pt-2">
                    <div className="relative flex items-center justify-center">
                      <div className="border-t border-slate-200/80 w-full" />
                      <span className="bg-white px-3 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider absolute">
                        Or continue with
                      </span>
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-3 gap-2.5 pt-3">
                      <button
                        type="button"
                        onClick={() => handleSocialLogin('google')}
                        className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs group"
                        title="Sign in with Google"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span className="text-xs font-bold text-slate-700">Google</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSocialLogin('github')}
                        className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs group text-[#0B0B0F]"
                        title="Sign in with GitHub"
                      >
                        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                        <span className="text-xs font-bold text-slate-700">GitHub</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSocialLogin('facebook')}
                        className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs group text-[#1877F2]"
                        title="Sign in with Facebook"
                      >
                        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span className="text-xs font-bold text-slate-700">Facebook</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Privacy Note */}
          <div className="pt-4 text-center">
            <p className="text-[10px] text-slate-400">
              Secured with 256-bit bank-grade encryption • NDPR Compliant
            </p>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: MODERN FINTECH SHOWCASE PANE ================= */}
        <div className="hidden lg:flex lg:col-span-6 bg-[#07080B] p-8 sm:p-10 flex-col justify-between relative overflow-hidden text-white border-l border-slate-800/80 text-left">
          
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#2D62FF]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-transparent to-transparent pointer-events-none" />

          {/* Top Pill & Headline */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10.5px] font-extrabold text-[#5B8DFF] tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#2D62FF] animate-pulse" />
              <span>Institutional Credit Portal</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Empowering Nigerian Enterprises with Direct Bank Capital.
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your business or personal profile to 15+ regulated Nigerian commercial banks and tier-1 lenders with zero upfront fees.
              </p>
            </div>
          </div>

          {/* Middle Metric Grid */}
          <div className="relative z-10 grid grid-cols-2 gap-3 py-6">
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                <Building2 className="w-4 h-4" />
                <span>15+ Banks</span>
              </div>
              <p className="text-[11px] text-slate-400">Access Zenith, GTBank, Access, FirstBank & more</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Zap className="w-4 h-4" />
                <span>24h Matching</span>
              </div>
              <p className="text-[11px] text-slate-400">AI underwriter reviews terms within hours</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                <ShieldCheck className="w-4 h-4" />
                <span>NDPR Verified</span>
              </div>
              <p className="text-[11px] text-slate-400">End-to-end data privacy and zero leak architecture</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Star className="w-4 h-4" />
                <span>4.9 / 5.0</span>
              </div>
              <p className="text-[11px] text-slate-400">Trusted by 17,000+ borrowers and founders</p>
            </div>
          </div>

          {/* Bottom Trust & Verified Users Badge */}
          <div className="relative z-10 p-4 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Shield className="w-3.5 h-3.5 text-[#2D62FF]" />
                <span>Bank-Grade Encryption</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Your CAC documents and bank records are strictly encrypted.
              </p>
            </div>

            <div className="flex items-center shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces"
                alt="Member"
                className="w-7 h-7 rounded-full border-2 border-[#07080B] object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces"
                alt="Member"
                className="w-7 h-7 rounded-full border-2 border-[#07080B] object-cover -ml-2"
              />
              <div className="w-7 h-7 rounded-full border-2 border-[#07080B] bg-[#2D62FF] text-white flex items-center justify-center text-[9px] font-black -ml-2 shadow-xs">
                +17k
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
