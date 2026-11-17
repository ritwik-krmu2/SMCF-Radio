import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Radio, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, UserCheck, Sparkles, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_CREDENTIALS } from '../services/authService';
import { User } from '../types';

interface AuthViewProps {
  onSuccess?: (user?: User) => void;
  defaultTab?: 'login' | 'signup';
}

export function AuthView({ onSuccess, defaultTab = 'login' }: AuthViewProps) {
  const { login, signup, requestPasswordReset } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupDept, setSignupDept] = useState('Computer Science');
  const [signupStudentId, setSignupStudentId] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [enrollSubscription, setEnrollSubscription] = useState(true);

  // Status feedback state
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPrompt, setShowForgotPrompt] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const clearMessages = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login({
      email: loginEmail,
      password: loginPassword,
    });
    setIsSubmitting(false);

    if (result.success) {
      const destination = result.user?.role === 'admin'
        ? 'Admin Console'
        : result.user?.role === 'rj'
        ? 'RJ Studio'
        : 'Student Portal';
      setSuccessMsg(`Welcome back, ${result.user?.name || 'Broadcaster'}! Loading your ${destination}...`);
      setTimeout(() => {
        if (onSuccess) onSuccess(result.user);
      }, 500);
    } else {
      setError(result.error || 'Invalid credentials.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!signupName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setError('Please provide a valid university email address.');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }
    if (!agreeTerms) {
      setError('Please accept the campus radio community guidelines.');
      return;
    }

    setIsSubmitting(true);
    const result = await signup({
      name: signupName,
      email: signupEmail,
      department: signupDept,
      studentId: signupStudentId || undefined,
      password: signupPassword,
      role: 'student',
      activateSubscription: enrollSubscription,
    });
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg('Student account created successfully! Welcome to SMCF Radio.');
      setTimeout(() => {
        if (onSuccess) onSuccess(result.user);
      }, 500);
    } else {
      setError(result.error || 'Failed to create account.');
    }
  };

  const handleQuickDemoLogin = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setTab('login');
    setError(null);
    setSuccessMsg(`Selected demo credentials for ${email}. Click 'Sign In' below.`);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    try {
      const res = await requestPasswordReset(forgotEmail);
      setSuccessMsg(res.message);
      setShowForgotPrompt(false);
    } catch (err: any) {
      setError(err.message || 'Could not reset password.');
    }
  };

  const departments = [
    'Computer Science',
    'Humanities & Social Sciences',
    'Mass Communication & Media',
    'Film Studies & Production',
    'Electronics & Communication',
    'Management & Business',
    'Biotechnology',
    'Design & Architecture',
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card-warm rounded-2xl sm:rounded-3xl p-5 sm:p-8 bg-[#0E1A0E] border border-[#00FF00]/20 shadow-2xl relative overflow-hidden">
        {/* Header Icon & Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#00FF00] to-[#10B981] text-slate-950 font-black flex items-center justify-center font-display font-extrabold text-xl shadow-md shadow-[#00FF00]/30 shrink-0">
            <Radio className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl tracking-tight text-white">
              {tab === 'login' ? 'Sign In to SMCF Radio' : 'Create Student Account'}
            </h2>
            <p className="text-[11px] text-slate-400">
              {tab === 'login'
                ? 'Access student broadcasts, bookmarks & live requests'
                : 'Join the SGT University broadcasting community'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[#060E06] border border-[#00FF00]/20 rounded-full mb-6">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              clearMessages();
            }}
            className={`py-2 text-xs font-bold rounded-full transition-all text-center cursor-pointer ${
              tab === 'login'
                ? 'bg-gradient-to-r from-[#00FF00] to-[#10B981] text-slate-950 font-black shadow-md shadow-[#00FF00]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              clearMessages();
            }}
            className={`py-2 text-xs font-bold rounded-full transition-all text-center cursor-pointer ${
              tab === 'signup'
                ? 'bg-gradient-to-r from-[#00FF00] to-[#10B981] text-slate-950 font-black shadow-md shadow-[#00FF00]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-[#00FF00]/10 border border-[#00FF00]/30 text-[#00FF00] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {tab === 'login' && !showForgotPrompt && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-200 font-semibold">Email Address or RJ ID</label>
                <span className="text-[10px] text-[#00FF00]/80 font-mono">RJ ID Supported</span>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="e.g. admin@smcf.edu.in, student@smcf.edu.in or RJ-RONIT"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#060E06] border border-[#00FF00]/25 text-white placeholder-slate-400 focus:outline-none focus:border-[#00FF00]"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Broadcasters can log in using their official <strong>RJ ID</strong> provisioned by the Station Director.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-200 font-semibold">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotPrompt(true)}
                  className="text-[11px] text-[#00FF00] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#060E06] border border-[#00FF00]/25 text-white placeholder-slate-400 focus:outline-none focus:border-[#00FF00]"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#00FF00] to-[#10B981] hover:from-[#33FF33] hover:to-[#059669] text-slate-950 font-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00FF00]/30 transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {tab === 'login' && showForgotPrompt && (
          <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-200 font-semibold mb-1">Enter your registered email</label>
              <input
                type="email"
                required
                placeholder="student@smcf.edu.in"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#060E06] border border-[#00FF00]/25 text-white focus:outline-none focus:border-[#00FF00]"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-[#00FF00] to-[#10B981] text-slate-950 font-black font-bold"
              >
                Reset Password
              </button>
              <button
                type="button"
                onClick={() => setShowForgotPrompt(false)}
                className="px-4 py-2.5 rounded-full bg-[#060E06] border border-[#00FF00]/20 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* SIGN UP FORM */}
        {tab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
            <div className="p-3 rounded-2xl bg-[#060E06] border border-[#00FF00]/20 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#00FF00] shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-300 leading-normal">
                <span className="font-bold text-white block">Student Listener Registration</span>
                Broadcaster (RJ) and Admin accounts are provisioned exclusively by the Station Director.
              </div>
            </div>

            <div>
              <label className="block text-slate-200 font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#060E06] border border-[#00FF00]/25 text-white focus:outline-none focus:border-[#00FF00]"
              />
            </div>

            <div>
              <label className="block text-slate-200 font-semibold mb-1">University Email Address *</label>
              <input
                type="email"
                required
                placeholder="name@smcf.edu.in"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#060E06] border border-[#00FF00]/25 text-white focus:outline-none focus:border-[#00FF00]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-200 font-semibold mb-1">Department</label>
                <select
                  value={signupDept}
                  onChange={(e) => setSignupDept(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[#060E06] border border-[#00FF00]/25 text-white focus:outline-none focus:border-[#00FF00]"
                >
                  {departments.map((d) => (
                    <option key={d} value={d} className="bg-[#060E06] text-white">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-200 font-semibold mb-1">Student Roll ID</label>
                <input
                  type="text"
                  placeholder="2024-CSE-042"
                  value={signupStudentId}
                  onChange={(e) => setSignupStudentId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[#060E06] border border-[#00FF00]/25 text-white focus:outline-none focus:border-[#00FF00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-200 font-semibold mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 chars"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[#060E06] border border-[#00FF00]/25 text-white focus:outline-none focus:border-[#00FF00]"
                />
              </div>

              <div>
                <label className="block text-slate-200 font-semibold mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[#060E06] border border-[#00FF00]/25 text-white focus:outline-none focus:border-[#00FF00]"
                />
              </div>
            </div>

            {/* Free Subscription Opt-In */}
            <div className="p-3.5 rounded-2xl bg-[#00FF00]/10 border border-[#00FF00]/30 space-y-1">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="enrollSub"
                  checked={enrollSubscription}
                  onChange={(e) => setEnrollSubscription(e.target.checked)}
                  className="rounded accent-emerald-500 cursor-pointer w-4 h-4"
                />
                <label htmlFor="enrollSub" className="text-xs font-bold text-white cursor-pointer flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00FF00]" />
                  <span>Activate Free Campus Subscription (Recommended)</span>
                </label>
              </div>
              <p className="text-[10px] text-slate-300 pl-6 leading-relaxed">
                100% Free · Instantly unlocks live song requests, episode comments, and personal radio playlists at zero charge.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded accent-emerald-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-[11px] text-slate-300 cursor-pointer">
                I agree to the SMCF Radio student broadcast guidelines
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#00FF00] to-[#10B981] hover:from-[#33FF33] hover:to-[#059669] text-slate-950 font-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00FF00]/30 transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Registering...' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Instant Demo Access Options */}
        <div className="mt-6 pt-5 border-t border-[#00FF00]/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#00FF00]" />
              <span>Instant Demo Credentials</span>
            </span>
            <span className="text-[9px] text-[#00FF00] font-mono">1-Click Role Fill</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {DEMO_CREDENTIALS.map((demo) => (
              <button
                key={demo.email}
                type="button"
                onClick={() => handleQuickDemoLogin(demo.email, demo.password)}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer group ${
                  loginEmail === demo.email
                    ? 'bg-[#00FF00]/15 border-[#00FF00] shadow-md shadow-[#00FF00]/20'
                    : 'bg-[#060E06] hover:bg-[#0E1A0E] border-[#00FF00]/25 hover:border-[#00FF00]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white group-hover:text-[#00FF00] truncate">
                    {demo.role === 'admin'
                      ? 'Admin'
                      : demo.role === 'rj'
                      ? 'RJ Priya'
                      : demo.subscriptionStatus === 'active'
                      ? 'Subscriber'
                      : 'Student'}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                      demo.role === 'admin'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                        : demo.role === 'rj'
                        ? 'bg-teal-950/80 text-teal-300 border border-teal-500/30'
                        : demo.subscriptionStatus === 'active'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-600/30'
                    }`}
                  >
                    {demo.role === 'student' && demo.subscriptionStatus === 'active' ? 'Subscriber' : demo.role}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-400 truncate">{demo.email}</p>
                <p className="text-[9px] text-slate-400 mt-1 line-clamp-1">{demo.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Campus Security Note */}
        <div className="mt-4 pt-3 border-t border-[#00FF00]/10 text-center">
          <p className="text-[10px] text-slate-400">
            Protected by SGT University SMCF Radio Cloud Identity. Authorized students, RJs, and faculty only.
          </p>
        </div>
      </div>
    </div>
  );
}
