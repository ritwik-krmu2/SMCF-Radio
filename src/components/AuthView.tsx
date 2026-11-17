import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Radio, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';

interface AuthViewProps {
  onSuccess?: (user?: User) => void;
  defaultTab?: 'login' | 'signup';
}

export function AuthView({ onSuccess, defaultTab = 'login' }: AuthViewProps) {
  const { login, signup, requestPasswordReset } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab);

  // Login category selector
  const [loginCategory, setLoginCategory] = useState<'student' | 'rj' | 'admin'>('student');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupDept, setSignupDept] = useState('General Listener / Public');
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
    if (!signupEmail.trim() || !signupEmail.includes('@') || !signupEmail.includes('.')) {
      setError('Please provide a valid email address (e.g. name@gmail.com).');
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
      setError('Please accept the radio community guidelines.');
      return;
    }

    setIsSubmitting(true);
    const result = await signup({
      name: signupName,
      email: signupEmail,
      department: signupDept,
      studentId: signupStudentId.trim() || undefined,
      password: signupPassword,
      role: 'student',
      activateSubscription: enrollSubscription,
    });
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg('Listener account created successfully! Welcome to SMCF Radio.');
      setTimeout(() => {
        if (onSuccess) onSuccess(result.user);
      }, 500);
    } else {
      setError(result.error || 'Failed to create account.');
    }
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
    'General Listener / Public',
    'SGT University Student',
    'Campus Faculty & Staff',
    'Media & Mass Communication',
    'Computer Science & IT',
    'Film Studies & Production',
    'Management & Commerce',
    'Languages & Humanities',
    'Alumni & Global Radio Fan',
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
              {tab === 'login' ? 'Sign In to SMCF Radio' : 'Create Free Listener Account'}
            </h2>
            <p className="text-[11px] text-slate-400">
              {tab === 'login'
                ? 'Access your radio console, bookmarks & live requests'
                : 'Open to everyone — students, faculty & global radio listeners'}
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

        {/* ROLE PORTAL CATEGORY SELECTOR BUTTONS */}
        {tab === 'login' && !showForgotPrompt && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                Select Login Category
              </span>
              <span className="text-[10px] text-[#00FF00]/90 font-mono font-semibold">
                {loginCategory === 'admin'
                  ? '🛡️ Station Director'
                  : loginCategory === 'rj'
                  ? '🎙️ RJ Broadcaster'
                  : '🎧 Listener / Student'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#060E06] border border-[#00FF00]/25 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setLoginCategory('student');
                  clearMessages();
                }}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  loginCategory === 'student'
                    ? 'bg-gradient-to-r from-[#00FF00] to-[#10B981] text-slate-950 font-black shadow-md shadow-[#00FF00]/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="truncate">Listener</span>
                </div>
                <span className="text-[9px] opacity-75 font-normal">Student / Public</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginCategory('rj');
                  clearMessages();
                }}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  loginCategory === 'rj'
                    ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-black shadow-md shadow-teal-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5" />
                  <span className="truncate">RJ Broadcaster</span>
                </div>
                <span className="text-[9px] opacity-75 font-normal">RJ ID Portal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginCategory('admin');
                  clearMessages();
                }}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  loginCategory === 'admin'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black shadow-md shadow-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="truncate">Station Admin</span>
                </div>
                <span className="text-[9px] opacity-75 font-normal">Director Portal</span>
              </button>
            </div>
          </div>
        )}

        {/* SIGN IN FORM */}
        {tab === 'login' && !showForgotPrompt && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-200 font-semibold">
                  {loginCategory === 'rj'
                    ? 'Official RJ ID or Broadcaster Email'
                    : loginCategory === 'admin'
                    ? 'Station Admin Email'
                    : 'Email Address'}
                </label>
                {loginCategory === 'rj' && (
                  <span className="text-[10px] text-[#00FF00]/80 font-mono">RJ ID Supported</span>
                )}
              </div>
              <div className="relative">
                {loginCategory === 'rj' ? (
                  <Radio className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-400" />
                ) : loginCategory === 'admin' ? (
                  <ShieldCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                ) : (
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                )}
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder={
                    loginCategory === 'rj'
                      ? 'e.g. RJ-RONIT, RJ-DIVA or rj.ronit@smcf.edu.in'
                      : loginCategory === 'admin'
                      ? 'e.g. admin@smcf.edu.in'
                      : 'e.g. yourname@gmail.com or student@smcf.edu.in'
                  }
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#060E06] border border-[#00FF00]/25 text-white placeholder-slate-500 focus:outline-none focus:border-[#00FF00]"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {loginCategory === 'rj'
                  ? 'Broadcasters sign in with their Station Director provisioned RJ ID.'
                  : loginCategory === 'admin'
                  ? 'Authorized university broadcast leadership & administrators only.'
                  : 'Open to registered student listeners and community radio fans.'}
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
              <span>
                {isSubmitting
                  ? 'Authenticating...'
                  : loginCategory === 'admin'
                  ? 'Sign In to Admin Console'
                  : loginCategory === 'rj'
                  ? 'Sign In to RJ Studio'
                  : 'Sign In to Listener Portal'}
              </span>
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

        {/* SIGN UP FORM (OPEN TO EVERYONE) */}
        {tab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
            <div className="p-3 rounded-2xl bg-[#060E06] border border-[#00FF00]/25 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#00FF00] shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-300 leading-normal">
                <span className="font-bold text-white block">🌍 Public & Campus Listener Access</span>
                Registration is 100% free and open to everyone worldwide. Use any personal email (Gmail, Outlook, Yahoo) or university ID.
              </div>
            </div>

            <div>
              <label className="block text-slate-200 font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma or Alex Johnson"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#060E06] border border-[#00FF00]/25 text-white placeholder-slate-500 focus:outline-none focus:border-[#00FF00]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-200 font-semibold">Email Address *</label>
                <span className="text-[10px] text-[#00FF00]/80">Any Email Accepted</span>
              </div>
              <input
                type="email"
                required
                placeholder="e.g. yourname@gmail.com, student@smcf.edu.in"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#060E06] border border-[#00FF00]/25 text-white placeholder-slate-500 focus:outline-none focus:border-[#00FF00]"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Personal Gmail, Outlook, Yahoo, or campus institutional emails are all supported.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-200 font-semibold mb-1">Category / Affiliation</label>
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
                <label className="block text-slate-200 font-semibold mb-1">Student / Roll ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 2024-CSE-042 (or blank)"
                  value={signupStudentId}
                  onChange={(e) => setSignupStudentId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[#060E06] border border-[#00FF00]/25 text-white placeholder-slate-500 focus:outline-none focus:border-[#00FF00]"
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
                  <span>Activate Free Listener Pass (Recommended)</span>
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
                I agree to the SMCF Radio broadcast and community guidelines
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#00FF00] to-[#10B981] hover:from-[#33FF33] hover:to-[#059669] text-slate-950 font-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00FF00]/30 transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Registering...' : 'Create Free Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Campus & Global Security Note */}
        <div className="mt-5 pt-4 border-t border-[#00FF00]/15 text-center">
          <p className="text-[10px] text-slate-400">
            SMCF Radio 90.4 MHz FM · Open to global listeners. Broadcaster RJ and Admin roles are provisioned exclusively by University Station Direction.
          </p>
        </div>
      </div>
    </div>
  );
}
