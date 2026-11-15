import React from 'react';
import { Music, Megaphone, Brain, Mic, PartyPopper, Briefcase, Play, ExternalLink } from 'lucide-react';
import { Program } from '../types';
import { catBySlug } from '../data';

interface ProgramCardProps {
  key?: React.Key;
  p: Program;
  onPlay: (p: Program) => void;
  bookmarked?: boolean;
  onBookmark?: (id: number) => void;
  showBookmark?: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  'music-2': Music,
  'megaphone': Megaphone,
  'brain': Brain,
  'mic-2': Mic,
  'party-popper': PartyPopper,
  'briefcase': Briefcase,
};

const CATEGORY_TINTS: Record<string, { bg: string; text: string; badge: string }> = {
  'music': {
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    badge: 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30',
  },
  'campus-buzz': {
    bg: 'bg-green-950/40',
    text: 'text-green-400',
    badge: 'bg-green-900/50 text-green-300 border border-green-500/30',
  },
  'gyaan-time': {
    bg: 'bg-teal-950/40',
    text: 'text-teal-400',
    badge: 'bg-teal-900/50 text-teal-300 border border-teal-500/30',
  },
  'talkback': {
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-300',
    badge: 'bg-emerald-900/50 text-emerald-200 border border-emerald-500/30',
  },
  'masti-time': {
    bg: 'bg-lime-950/40',
    text: 'text-lime-400',
    badge: 'bg-lime-900/50 text-lime-300 border border-lime-500/30',
  },
  'career': {
    bg: 'bg-green-950/40',
    text: 'text-green-300',
    badge: 'bg-green-900/50 text-green-200 border border-green-500/30',
  },
};

export function ProgramCard({
  p,
  onPlay,
}: ProgramCardProps) {
  const cat = catBySlug[p.cat] || { en: 'Broadcast', hi: 'प्रसारण', icon: 'mic-2' };
  const CategoryIcon = ICON_MAP[cat.icon] || Music;
  const tint = CATEGORY_TINTS[p.cat] || CATEGORY_TINTS['music'];

  return (
    <div className="card-warm rounded-3xl overflow-hidden flex flex-col justify-between h-full group bg-[#0E1A0E] border border-[#00FF00]/20 hover:border-[#00FF00]/50 hover:shadow-xl hover:shadow-[#00FF00]/10 transition-all">
      <div>
        {/* Card Header Banner */}
        <div className={`p-5 flex items-center justify-between border-b border-[#00FF00]/10 ${tint.bg}`}>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${tint.badge}`}>
              {cat.en}
            </span>
            <div className="text-[11px] font-hi text-slate-400 mt-1">
              {cat.hi}
            </div>
          </div>
          <div className={`w-9 h-9 rounded-2xl bg-slate-900/80 border border-[#00FF00]/20 shadow-xs flex items-center justify-center ${tint.text}`}>
            <CategoryIcon className="w-4 h-4" />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 pb-2 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 uppercase tracking-wide border border-slate-700/50">
              {p.lang}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {p.duration}
            </span>
            <span className="text-[11px] font-mono text-[#00FF00]/80 font-bold ml-auto">
              {(p.plays || 520).toLocaleString()} plays
            </span>
          </div>

          <h3 className="font-display font-bold text-sm text-white leading-snug line-clamp-2 group-hover:text-[#00FF00] transition-colors">
            {p.title}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
            {p.desc}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-5 pt-2">
        <div className="flex items-center justify-between pt-3 border-t border-[#00FF00]/15">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Broadcaster</span>
            <span className="text-xs font-semibold text-white truncate block">
              {p.rj}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {p.driveUrl && (
              <a
                href={p.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Open Google Drive Recording"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={() => onPlay(p)}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-[#00FF00] to-[#10B981] hover:from-[#33FF33] hover:to-[#059669] text-slate-950 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md shadow-[#00FF00]/30 cursor-pointer font-black"
              aria-label={`Play ${p.title}`}
            >
              <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
