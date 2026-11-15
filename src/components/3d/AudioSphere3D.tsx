import React from 'react';

interface AudioSphere3DProps {
  size?: number;
  label?: string;
  sublabel?: string;
}

export const AudioSphere3D: React.FC<AudioSphere3DProps> = ({
  size = 140,
  label = 'SMCF Sound Sphere',
  sublabel = 'Acoustic Broadcast Hub',
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <div
        className="relative rounded-full flex items-center justify-center animate-float shadow-xl"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: 'radial-gradient(circle at 35% 30%, #00FF00 0%, #10B981 40%, #064E3B 75%, #020602 100%)',
          boxShadow: '0 20px 40px -10px rgba(0, 255, 0, 0.45), 0 0 35px rgba(0, 255, 0, 0.35), inset 0 -6px 12px rgba(2, 6, 2, 0.7)',
        }}
      >
        {/* Specular Highlight */}
        <div
          className="absolute top-3 left-4 rounded-full bg-white/70 blur-xs"
          style={{ width: `${size * 0.28}px`, height: `${size * 0.18}px`, transform: 'rotate(-30deg)' }}
        />
        {/* Orbit Ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-[#00FF00]/40 -m-3 animate-spin-slow"
          style={{ borderStyle: 'dashed' }}
        />
      </div>

      {label && <h4 className="mt-4 text-xs font-bold text-white tracking-wide">{label}</h4>}
      {sublabel && <p className="text-[11px] text-slate-400 mt-0.5">{sublabel}</p>}
    </div>
  );
};
