import React from 'react';

interface VinylRecord3DProps {
  isPlaying: boolean;
  title?: string;
  rj?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VinylRecord3D: React.FC<VinylRecord3DProps> = ({
  isPlaying,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36 sm:w-44 sm:h-44',
    lg: 'w-56 h-56 sm:w-64 sm:h-64',
  };

  return (
    <div className="relative inline-flex items-center justify-center p-3">
      {/* Vinyl Disc Body */}
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-[#020602] via-[#0A160A] to-[#040C04] p-1.5 shadow-2xl border-4 border-[#00FF00]/30 transition-all relative ${isPlaying ? 'animate-spin-slow' : ''
          }`}
        style={{
          boxShadow: '0 20px 40px -8px rgba(0, 10, 0, 0.8), 0 0 25px rgba(0, 255, 0, 0.3), inset 0 0 16px rgba(0, 255, 0, 0.15)',
        }}
      >
        {/* Concentric Grooves */}
        <div className="w-full h-full rounded-full border border-[#00FF00]/20 p-2 flex items-center justify-center">
          <div className="w-full h-full rounded-full border border-emerald-500/15 p-2 flex items-center justify-center">
            <div className="w-full h-full rounded-full border border-[#00FF00]/25 p-2 flex items-center justify-center">
              {/* Center Sticker */}
              <div className="w-1/2 h-1/2 rounded-full bg-gradient-to-br from-[#00FF00] to-[#0A3D14] p-1 flex flex-col items-center justify-center text-center shadow-lg relative">
                <div className="w-3.5 h-3.5 rounded-full bg-[#020602] border-2 border-white/50 mb-0.5" />
                <span className="text-[7px] font-black uppercase tracking-wider text-slate-950">SMCF 90.4</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tonearm / Needle */}
      <div
        className={`absolute top-0 right-2 w-14 sm:w-20 h-16 pointer-events-none transition-transform duration-700 origin-top-right ${isPlaying ? 'rotate-18' : 'rotate-0'
          }`}
      >
        <svg viewBox="0 0 80 80" fill="none" className="w-full h-full drop-shadow-md">
          <circle cx="68" cy="12" r="8" fill="#060E06" stroke="#00FF00" strokeWidth="1.5" />
          <circle cx="68" cy="12" r="3" fill="#00FF00" />
          <path d="M68 12 L35 48 L22 52" stroke="#00FF00" strokeWidth="3" strokeLinecap="round" />
          <rect x="14" y="48" width="10" height="6" rx="2" fill="#00FF00" transform="rotate(-15 14 48)" />
        </svg>
      </div>
    </div>
  );
};
