import React from 'react';
import { Radio, RadioTower, Heart, Mail, Phone, MapPin } from 'lucide-react';
import { ActivePage } from './Navbar';

interface FooterProps {
  onNavigate: (page: ActivePage) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-[#00FF00]/20 bg-[#030603] text-slate-400 text-xs pb-28 pt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand & Identity */}
          <div className="space-y-4">
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#00FF00] to-[#10B981] text-slate-950 flex items-center justify-center font-black shadow-md shadow-[#00FF00]/25">
                <Radio className="w-5 h-5 text-slate-950" />
              </div>
              <span className="font-display font-extrabold text-lg text-white tracking-tight">
                SMCF <span className="bg-gradient-to-r from-[#00FF00] to-[#4ADE80] bg-clip-text text-transparent">Radio</span>
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed text-[11px]">
              The official digital broadcasting and student media platform of the School of emerging media Communication & Film studies.
            </p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 text-[10px] font-bold shadow-[0_0_8px_rgba(0,255,0,0.2)]">
              <RadioTower className="w-3.5 h-3.5" />
              <span>90.4 MHz FM Campus Frequency</span>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Broadcast Channels</h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button
                  onClick={() => onNavigate('live')}
                  className="hover:text-[#00FF00] transition-colors cursor-pointer"
                >
                  Live Internet Radio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shows')}
                  className="hover:text-[#00FF00] transition-colors cursor-pointer"
                >
                  Flagship Shows & Programs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('archive')}
                  className="hover:text-[#00FF00] transition-colors cursor-pointer"
                >
                  Master Episode Vault (13 Recordings)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('rjs')}
                  className="hover:text-[#00FF00] transition-colors cursor-pointer"
                >
                  Meet the Radio Jockeys
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('announcements')}
                  className="hover:text-[#00FF00] transition-colors cursor-pointer"
                >
                  Campus Announcements
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Portals & Studio */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Campus Portals</h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button
                  onClick={() => onNavigate('portal')}
                  className="hover:text-[#00FF00] transition-colors cursor-pointer"
                >
                  Student Portal & Bookmarks
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('creator')}
                  className="hover:text-[#00FF00] transition-colors cursor-pointer"
                >
                  RJ Creator Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-[#00FF00] transition-colors cursor-pointer"
                >
                  Admin Operations Console
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#00FF00] transition-colors cursor-pointer"
                >
                  About the Station & Faculty
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#00FF00] transition-colors cursor-pointer"
                >
                  Studio Inquiries & Feedback
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Studio Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Broadcast Studio</h4>
            <div className="space-y-2.5 text-[11px] text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#00FF00] shrink-0 mt-0.5" />
                <span>Media Block 3rd Floor, SGT University, Chandu-Budhera, Gurugram, Haryana</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#00FF00] shrink-0" />
                <span>radio@smcf.edu.in</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#00FF00] shrink-0" />
                <span>Studio Desk: +91 124 2278183</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#00FF00]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} SMCF Radio · SGT University. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3 h-3 text-[#00FF00] fill-[#00FF00]" /> for School of emerging media Communication & Film studies
          </p>
        </div>
      </div>
    </footer>
  );
};
