import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  X,
  Radio,
  MessageSquare,
  ListMusic,
  ShieldCheck,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

interface FreeSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionTitle?: string;
  onOpenAuth?: (tab: 'login' | 'signup') => void;
  onActivated?: () => void;
}

export const FreeSubscriptionModal: React.FC<FreeSubscriptionModalProps> = ({
  isOpen,
  onClose,
  actionTitle = 'this feature',
  onOpenAuth,
  onActivated,
}) => {
  const { user } = useAuth();
  const [activating, setActivating] = useState(false);
  const [justActivated, setJustActivated] = useState(false);

  if (!isOpen) return null;

  const isSubscriber = Boolean(user && authService.isSubscriber(user));

  const handleActivateInstant = () => {
    if (!user) return;
    setActivating(true);
    setTimeout(() => {
      authService.updateSubscription(user.id, 'active', 'campus-free');
      user.subscriptionStatus = 'active';
      user.subscriptionTier = 'campus-free';
      setActivating(false);
      setJustActivated(true);
      if (onActivated) onActivated();
      setTimeout(() => {
        setJustActivated(false);
        onClose();
      }, 1500);
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="free-sub-title"
    >
      <div className="relative w-full max-w-lg bg-[#0E1A0E] border border-[#00FF00]/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#00FF00]/15 overflow-hidden text-white">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00FF00]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FF00]/15 border border-[#00FF00]/30 text-[#00FF00] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% Free Campus Access</span>
          </div>

          <h2 id="free-sub-title" className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Unlock <span className="text-[#00FF00]">{actionTitle}</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            SMCF Radio subscriptions are completely free for all SGT University students and community members.
            No credit card, no charges, and no paid plans — ever.
          </p>
        </div>

        {/* Perks Grid */}
        <div className="space-y-2.5 mb-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Free Subscriber Entitlements:
          </p>

          <div className="grid gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-[#060E06] border border-[#00FF00]/20 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#00FF00]/10 text-[#00FF00] flex items-center justify-center shrink-0">
                <Radio className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white">Submit Live Song Requests</p>
                <p className="text-[11px] text-slate-400">Dedicate songs and send live shoutouts to on-air RJs on 90.4 FM.</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#060E06] border border-[#00FF00]/20 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#00FF00]/10 text-[#00FF00] flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white">Comment on Shows & Episodes</p>
                <p className="text-[11px] text-slate-400">Share feedback, join discussions, and interact with fellow campus listeners.</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#060E06] border border-[#00FF00]/20 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#00FF00]/10 text-[#00FF00] flex items-center justify-center shrink-0">
                <ListMusic className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white">Create Custom Playlists</p>
                <p className="text-[11px] text-slate-400">Organize your favorite episodes, podcasts, and study beats into queues.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action depending on Auth state */}
        <div className="space-y-3 pt-2 border-t border-[#00FF00]/20">
          {justActivated ? (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center justify-center gap-2 text-sm font-bold animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Subscription Activated! Enjoy full campus radio perks.</span>
            </div>
          ) : user ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-400">Signed in as: <strong className="text-white">{user.name}</strong></span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-950/80 text-amber-300 border border-amber-500/30">
                  {user.subscriptionStatus || 'not_subscribed'}
                </span>
              </div>

              <button
                onClick={handleActivateInstant}
                disabled={activating}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#00FF00] to-[#10B981] hover:from-[#33FF33] hover:to-[#059669] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00FF00]/30 transition-transform active:scale-98 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{activating ? 'Activating Free Pass...' : 'Activate Free Campus Subscription (Instant 1-Click)'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth('signup');
                }}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#00FF00] to-[#10B981] hover:from-[#33FF33] hover:to-[#059669] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00FF00]/30 transition-transform active:scale-98"
              >
                <UserCheck className="w-4 h-4" />
                <span>Create Free Student Account (Takes 30 Seconds)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <span>Already have a university account?</span>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenAuth) onOpenAuth('login');
                  }}
                  className="text-[#00FF00] font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          <div className="text-center pt-2">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
            >
              Continue listening to radio as public guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
