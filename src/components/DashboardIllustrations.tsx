import React from 'react';

/**
 * 3D-Style Broadcast Central Microphone & Soundwave Graphic
 * Matched to Screenshot 1 ("SMCF Broadcast Central")
 */
export const BroadcastCentralIllustration: React.FC<{ className?: string }> = ({ className = 'w-28 h-20' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Soundwave bars (left) */}
      <div className="flex items-center gap-1 mr-2">
        <span className="w-1 h-3 rounded-full bg-[#10B981] opacity-60" />
        <span className="w-1 h-6 rounded-full bg-[#10B981] opacity-80" />
        <span className="w-1 h-10 rounded-full bg-[#10B981]" />
        <span className="w-1 h-5 rounded-full bg-[#10B981] opacity-75" />
      </div>

      {/* 3D Condenser Microphone */}
      <div className="relative flex flex-col items-center">
        {/* Grille */}
        <div className="w-9 h-12 rounded-t-full bg-gradient-to-b from-[#145A42] via-[#10B981] to-[#0D3829] shadow-md border-2 border-[#10B981]/50 relative overflow-hidden flex items-center justify-center">
          {/* Grille mesh texture */}
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:3px_3px]" />
          {/* Center metallic band */}
          <div className="w-full h-1 bg-[#202820]/40 absolute top-1/2 -translate-y-1/2" />
        </div>

        {/* Shockmount collar */}
        <div className="w-11 h-2 rounded-full bg-gradient-to-r from-[#202820] via-[#525E54] to-[#202820] -mt-0.5 shadow-sm" />

        {/* Stand stem */}
        <div className="w-2 h-4 bg-gradient-to-r from-[#525E54] to-[#202820]" />

        {/* Circular heavy base */}
        <div className="w-8 h-2 rounded-full bg-gradient-to-b from-[#202820] to-[#141A14] shadow-sm" />
      </div>

      {/* Soundwave bars (right) */}
      <div className="flex items-center gap-1 ml-2">
        <span className="w-1 h-5 rounded-full bg-[#10B981] opacity-75" />
        <span className="w-1 h-10 rounded-full bg-[#10B981]" />
        <span className="w-1 h-6 rounded-full bg-[#10B981] opacity-80" />
        <span className="w-1 h-3 rounded-full bg-[#10B981] opacity-60" />
      </div>
    </div>
  );
};

/**
 * 3D-Style Mint Headphones Hero Illustration
 * Matched to Screenshot 2 ("Good morning, Ayush! 👋")
 */
export const HeadphonesHeroIllustration: React.FC<{ className?: string }> = ({ className = 'w-48 h-32' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Soundwave graphic lines */}
      <svg
        viewBox="0 0 200 100"
        className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
        fill="none"
      >
        <path
          d="M 10 50 Q 30 20 50 50 T 90 50 T 130 50 T 170 50 T 190 50"
          stroke="#10B981"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 20 50 Q 40 70 60 50 T 100 50 T 140 50 T 180 50"
          stroke="#10B981"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
      </svg>

      {/* Floating Musical Notes */}
      <span className="absolute -top-1 left-4 text-[#10B981] font-bold text-lg animate-bounce select-none">
        ♪
      </span>
      <span className="absolute top-6 left-12 text-[#145A42] font-bold text-sm select-none">
        ♫
      </span>
      <span className="absolute -top-2 right-8 text-[#10B981] font-bold text-xl select-none">
        ♬
      </span>
      <span className="absolute bottom-4 right-4 text-[#145A42] font-bold text-sm select-none">
        ♪
      </span>

      {/* 3D Modern Mint Over-Ear Headphones */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Headband arch */}
        <div className="w-24 h-16 rounded-t-full border-[7px] border-gradient-to-b border-[#3D8B6E] relative shadow-sm">
          {/* Headband cushion */}
          <div className="absolute -top-1 left-2 right-2 h-2.5 rounded-full bg-[#2C6B53]" />
        </div>

        {/* Earcups container */}
        <div className="flex items-center justify-between w-28 -mt-6">
          {/* Left Earcup */}
          <div className="w-8 h-12 rounded-2xl bg-gradient-to-br from-[#A8E6CF] via-[#52B788] to-[#2D6A4F] shadow-lg border-2 border-white/60 transform -rotate-12 flex items-center justify-center">
            <div className="w-4 h-7 rounded-lg bg-[#1B4332]/30" />
          </div>

          {/* Right Earcup */}
          <div className="w-8 h-12 rounded-2xl bg-gradient-to-bl from-[#A8E6CF] via-[#52B788] to-[#2D6A4F] shadow-lg border-2 border-white/60 transform rotate-12 flex items-center justify-center">
            <div className="w-4 h-7 rounded-lg bg-[#1B4332]/30" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 3D-Style Studio Mic & Headphones Banner Illustration
 * Matched to Screenshot 3 ("Welcome back, RJ Priya! 🎙️")
 */
export const StudioMicHeroIllustration: React.FC<{ className?: string }> = ({ className = 'w-56 h-32' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Soundwave flowing ribbons */}
      <svg
        viewBox="0 0 240 100"
        className="absolute inset-0 w-full h-full opacity-50 pointer-events-none"
        fill="none"
      >
        <path
          d="M 5 50 C 40 15, 80 85, 120 50 C 160 15, 200 85, 235 50"
          stroke="#10B981"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 15 50 C 50 75, 90 25, 130 50 C 170 75, 210 25, 230 50"
          stroke="#52B788"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Floating Notes */}
      <span className="absolute top-1 left-8 text-[#10B981] font-bold text-base select-none">
        ♫
      </span>
      <span className="absolute top-2 right-12 text-[#10B981] font-bold text-lg select-none">
        ♪
      </span>

      {/* Studio Setup: Mic + Headphones Side by Side */}
      <div className="relative z-10 flex items-center gap-4">
        {/* Studio Microphone */}
        <div className="flex flex-col items-center">
          <div className="w-8 h-12 rounded-t-full bg-gradient-to-b from-[#2D6A4F] via-[#52B788] to-[#1B4332] border-2 border-white/70 shadow-md relative overflow-hidden">
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:3px_3px]" />
          </div>
          <div className="w-10 h-1.5 rounded-full bg-[#202820]" />
          <div className="w-1.5 h-3 bg-[#525E54]" />
          <div className="w-7 h-1.5 rounded-full bg-[#202820]" />
        </div>

        {/* Headphones on Stand */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-11 rounded-t-full border-[5px] border-[#3D8B6E] relative">
            <div className="absolute -bottom-1 -left-2 w-5 h-8 rounded-xl bg-gradient-to-br from-[#74C69D] to-[#2D6A4F] shadow-md border border-white/50 -rotate-6" />
            <div className="absolute -bottom-1 -right-2 w-5 h-8 rounded-xl bg-gradient-to-bl from-[#74C69D] to-[#2D6A4F] shadow-md border border-white/50 rotate-6" />
          </div>
          <div className="w-1 h-6 bg-[#202820]" />
          <div className="w-8 h-1.5 rounded-full bg-[#202820]" />
        </div>
      </div>
    </div>
  );
};

/**
 * Broadcasting Activity Area Chart with smooth spline wave
 * Matched to Screenshot 1 ("Broadcasting Activity")
 */
export const BroadcastingActivityChart: React.FC = () => {
  return (
    <div className="w-full space-y-2">
      <div className="relative h-44 sm:h-52 w-full">
        {/* Y-Axis Grid lines & labels */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-[#778078] font-mono">
          <div className="flex items-center w-full">
            <span className="w-6 text-right pr-2">16</span>
            <div className="flex-1 border-b border-[#E8EAE2]/80" />
          </div>
          <div className="flex items-center w-full">
            <span className="w-6 text-right pr-2">12</span>
            <div className="flex-1 border-b border-[#E8EAE2]/80" />
          </div>
          <div className="flex items-center w-full">
            <span className="w-6 text-right pr-2">8</span>
            <div className="flex-1 border-b border-[#E8EAE2]/80" />
          </div>
          <div className="flex items-center w-full">
            <span className="w-6 text-right pr-2">4</span>
            <div className="flex-1 border-b border-[#E8EAE2]/80" />
          </div>
          <div className="flex items-center w-full">
            <span className="w-6 text-right pr-2">0</span>
            <div className="flex-1 border-b border-[#E8EAE2]" />
          </div>
        </div>

        {/* SVG Curved Smooth Area Chart */}
        <div className="absolute inset-0 pl-7 pb-4">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 700 200"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="activityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.55" />
                <stop offset="60%" stopColor="#10B981" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Filled Area */}
            <path
              d="
                M 0 170
                C 50 140, 70 80, 116 80
                C 160 80, 175 130, 233 130
                C 280 130, 310 20, 350 20
                C 390 20, 420 120, 466 120
                C 510 120, 540 60, 583 60
                C 630 60, 660 150, 700 170
                L 700 190
                L 0 190
                Z
              "
              fill="url(#activityGradient)"
            />

            {/* Wave Stroke Line */}
            <path
              d="
                M 0 170
                C 50 140, 70 80, 116 80
                C 160 80, 175 130, 233 130
                C 280 130, 310 20, 350 20
                C 390 20, 420 120, 466 120
                C 510 120, 540 60, 583 60
                C 630 60, 660 150, 700 170
              "
              fill="none"
              stroke="#10B981"
              strokeWidth="2.75"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* X-Axis Days of Week */}
      <div className="flex items-center justify-between pl-7 pr-2 text-[10px] text-[#778078] font-medium">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>
    </div>
  );
};
