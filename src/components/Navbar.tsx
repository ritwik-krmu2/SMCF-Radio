import React, { useState } from 'react';
import {
  Radio,
  RadioTower,
  User,
  Shield,
  Mic,
  Menu,
  X,
  LogOut,
  Headphones,
  ChevronRight,
} from 'lucide-react';
import { User as UserType } from '../types';

export type ActivePage =
  | 'home'
  | 'live'
  | 'shows'
  | 'archive'
  | 'about'
  | 'contact'
  | 'portal'
  | 'portal-library'
  | 'portal-requests'
  | 'portal-playlists'
  | 'portal-comments'
  | 'portal-subscription'
  | 'portal-profile'
  | 'creator'
  | 'creator-episodes'
  | 'creator-upload'
  | 'admin'
  | 'admin-live'
  | 'admin-upload'
  | 'admin-shows'
  | 'admin-episodes'
  | 'admin-analytics'
  | 'admin-comments'
  | 'admin-requests'
  | 'admin-students'
  | 'admin-subscribers'
  | 'admin-rjs'
  | 'admin-schedule'
  | 'admin-announcements'
  | 'admin-settings'
  | 'announcements'
  | 'rjs'
  | 'auth';

interface NavbarProps {
  currentPage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  currentUser: UserType | null;
  onLogout: () => void;
  isAudioPlaying?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onLogout,
  isAudioPlaying,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Determine user mode
  const isAdmin = currentUser?.role === 'admin';
  const isRJ = currentUser?.role === 'rj';
  const isStudent = currentUser?.role === 'student';

  const handleNavClick = (page: ActivePage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const navButtonClass = (isActive: boolean) =>
    `px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
      isActive
        ? 'bg-gradient-to-r from-[#00FF00] to-[#10B981] text-slate-950 font-black shadow-md shadow-[#00FF00]/30'
        : 'text-slate-300 hover:text-white hover:bg-[#00FF00]/10'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-[#060B06]/95 backdrop-blur-md border-b border-[#00FF00]/20 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand Identity */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00FF00] to-[#10B981] text-slate-950 flex items-center justify-center shadow-lg shadow-[#00FF00]/30 group-hover:scale-105 transition-transform font-black">
              <Radio className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-white">
                  SMCF <span className="bg-gradient-to-r from-[#00FF00] to-[#4ADE80] bg-clip-text text-transparent">Radio</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 rounded-full shadow-[0_0_8px_rgba(0,255,0,0.2)]">
                  90.4 MHz
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide hidden sm:block">
                School of emerging media Communication & Film studies
              </p>
            </div>
          </div>

          {/* Desktop Curated Public Navigation (Clean, Uncluttered Floating Pill) */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#0A140A]/85 border border-[#00FF00]/20 px-2.5 py-1.5 rounded-full backdrop-blur-md shadow-inner shadow-black/60">
            <button
              onClick={() => handleNavClick('home')}
              className={navButtonClass(currentPage === 'home')}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('live')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'live'
                  ? 'bg-gradient-to-r from-[#00FF00] to-[#10B981] text-slate-950 font-black shadow-md shadow-[#00FF00]/30'
                  : 'text-slate-300 hover:text-white hover:bg-[#00FF00]/10'
              }`}
            >
              <span className={`w-2 h-2 rounded-full bg-[#00FF00] shadow-[0_0_8px_#00FF00] ${isAudioPlaying ? 'animate-ping' : ''}`} />
              Live Radio
            </button>
            <button
              onClick={() => handleNavClick('shows')}
              className={navButtonClass(currentPage === 'shows')}
            >
              Shows
            </button>
            <button
              onClick={() => handleNavClick('archive')}
              className={navButtonClass(currentPage === 'archive')}
            >
              Episodes
            </button>
            <button
              onClick={() => handleNavClick('rjs')}
              className={navButtonClass(currentPage === 'rjs')}
            >
              RJs
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={navButtonClass(currentPage === 'about')}
            >
              About
            </button>
          </nav>

          {/* Right Action Area: Dashboard Shortcut + Profile */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* If logged in: single, clean direct workspace shortcut */}
            {currentUser && (
              <button
                onClick={() =>
                  handleNavClick(
                    isAdmin ? 'admin' : isRJ ? 'creator' : 'portal'
                  )
                }
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#00FF00]/10 hover:bg-[#00FF00]/20 text-[#00FF00] border border-[#00FF00]/35 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:shadow-[#00FF00]/20"
                title={isAdmin ? 'Open Admin Console' : isRJ ? 'Open RJ Studio' : 'Open Student Portal'}
              >
                {isAdmin && <Shield className="w-3.5 h-3.5 text-[#00FF00]" />}
                {isRJ && <Mic className="w-3.5 h-3.5 text-[#00FF00]" />}
                {isStudent && <Headphones className="w-3.5 h-3.5 text-[#00FF00]" />}
                <span>{isAdmin ? 'Admin Console' : isRJ ? 'RJ Studio' : 'Student Portal'}</span>
              </button>
            )}

            {/* Profile Dropdown or Sign In */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-[#0E1A0E] border border-[#00FF00]/30 text-xs font-semibold text-white hover:border-[#00FF00] shadow-sm transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#00FF00] to-[#10B981] text-slate-950 flex items-center justify-center font-black text-[10px]">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{currentUser.name}</span>
                  <span className="text-[9px] uppercase font-bold text-[#00FF00] bg-[#00FF00]/10 px-1.5 py-0.5 rounded-full border border-[#00FF00]/30">
                    {currentUser.role}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0A140A] border border-[#00FF00]/30 shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                    <div className="px-3.5 py-2 border-b border-[#00FF00]/20">
                      <p className="font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30">
                          {currentUser.role}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">{currentUser.department}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => handleNavClick(isAdmin ? 'admin' : isRJ ? 'creator' : 'portal')}
                        className="w-full text-left px-3.5 py-2 hover:bg-[#00FF00]/10 text-slate-200 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        {isAdmin ? <Shield className="w-3.5 h-3.5 text-[#00FF00]" /> : isRJ ? <Mic className="w-3.5 h-3.5 text-[#00FF00]" /> : <Headphones className="w-3.5 h-3.5 text-[#00FF00]" />}
                        <span>{isAdmin ? 'Admin Console' : isRJ ? 'RJ Studio' : 'Student Portal'}</span>
                      </button>
                    </div>

                    <div className="border-t border-[#00FF00]/20 my-1" />

                    <button
                      onClick={() => {
                        onLogout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('auth')}
                className="px-5 py-2 rounded-full text-xs font-black bg-gradient-to-r from-[#00FF00] to-[#10B981] hover:from-[#33FF33] hover:to-[#059669] text-slate-950 transition-all shadow-md shadow-[#00FF00]/30 cursor-pointer flex items-center gap-1.5 hover:scale-105"
              >
                <User className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => handleNavClick('live')}
              className="p-2 rounded-xl bg-slate-900 border border-[#00FF00]/30 text-[#00FF00]"
              title="Live Stream"
            >
              <RadioTower className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-[#00FF00]/30 text-slate-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#00FF00]/20 bg-[#0A130A] px-4 pt-4 pb-6 space-y-4 animate-in fade-in duration-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Broadcast Navigation
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleNavClick('home')}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                  currentPage === 'home'
                    ? 'bg-gradient-to-r from-[#00FF00] to-[#10B981] text-slate-950 font-black shadow-md shadow-[#00FF00]/25'
                    : 'bg-[#0E1A0E] border border-[#00FF00]/20 text-slate-200 hover:text-white'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('live')}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all flex items-center gap-1.5 ${
                  currentPage === 'live'
                    ? 'bg-gradient-to-r from-[#00FF00] to-[#10B981] text-slate-950 font-black shadow-md shadow-[#00FF00]/25'
                    : 'bg-[#0E1A0E] border border-[#00FF00]/20 text-[#00FF00]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full bg-[#00FF00] ${isAudioPlaying ? 'animate-ping' : ''}`} />
                Live Radio
              </button>
              <button
                onClick={() => handleNavClick('shows')}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                  currentPage === 'shows'
                    ? 'bg-gradient-to-r from-[#00FF00] to-[#10B981] text-slate-950 font-black'
                    : 'bg-[#0E1A0E] border border-[#00FF00]/20 text-slate-200'
                }`}
              >
                Shows
              </button>
              <button
                onClick={() => handleNavClick('archive')}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                  currentPage === 'archive'
                    ? 'bg-gradient-to-r from-[#00FF00] to-[#10B981] text-slate-950 font-black'
                    : 'bg-[#0E1A0E] border border-[#00FF00]/20 text-slate-200'
                }`}
              >
                Episodes
              </button>
              <button
                onClick={() => handleNavClick('rjs')}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                  currentPage === 'rjs'
                    ? 'bg-gradient-to-r from-[#00FF00] to-[#10B981] text-slate-950 font-black'
                    : 'bg-[#0E1A0E] border border-[#00FF00]/20 text-slate-200'
                }`}
              >
                RJ Roster
              </button>
              <button
                onClick={() => handleNavClick('about')}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                  currentPage === 'about'
                    ? 'bg-gradient-to-r from-[#00FF00] to-[#10B981] text-slate-950 font-black'
                    : 'bg-[#0E1A0E] border border-[#00FF00]/20 text-slate-200'
                }`}
              >
                About
              </button>
            </div>
          </div>

          {/* User Section in Mobile Drawer */}
          <div className="pt-3 border-t border-[#00FF00]/15">
            {currentUser ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleNavClick(isAdmin ? 'admin' : isRJ ? 'creator' : 'portal')}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#00FF00]/15 border border-[#00FF00]/30 text-[#00FF00] font-bold text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {isAdmin && <Shield className="w-4 h-4" />}
                    {isRJ && <Mic className="w-4 h-4" />}
                    {isStudent && <Headphones className="w-4 h-4" />}
                    <span>{isAdmin ? 'Open Admin Console' : isRJ ? 'Open RJ Studio' : 'Open Student Portal'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs">
                    <p className="font-bold text-white">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-1 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-800/30 text-xs font-semibold"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('auth')}
                className="w-full py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#00FF00] to-[#10B981] text-slate-950 flex items-center justify-center gap-2 shadow-md shadow-[#00FF00]/25"
              >
                <User className="w-4 h-4" />
                <span>Log In / Student Portal</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
