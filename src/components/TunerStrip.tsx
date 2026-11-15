import { motion } from 'motion/react';
import { RadioTower } from 'lucide-react';

interface TunerStripProps {
  compact?: boolean;
}

export function TunerStrip({ compact }: TunerStripProps) {
  const marks = [88, 90, 92, 94, 98, 102, 106];

  return (
    <div className={`w-full ${compact ? 'max-w-md' : 'max-w-xl'}`}>
      <div className="card-warm rounded-3xl p-5 bg-[#0E1A0E] border border-[#00FF00]/20 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-[0.2em] uppercase font-display font-bold text-slate-400 flex items-center gap-1.5">
            <RadioTower className="w-3.5 h-3.5 text-[#00FF00]" />
            Analog FM Frequency Tuner
          </span>
          <span className="text-[10px] tracking-[0.2em] uppercase font-display font-bold text-[#00FF00] bg-[#00FF00]/10 px-2 py-0.5 rounded-full border border-[#00FF00]/30 shadow-[0_0_8px_rgba(0,255,0,0.2)]">
            Live Station Carrier
          </span>
        </div>

        {/* Tuner Window */}
        <div className="relative h-14 rounded-2xl overflow-hidden bg-[#040804] border border-[#00FF00]/30">
          <div className="absolute inset-0 flex items-end justify-between px-4 pb-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 1.5,
                  height: i % 5 === 0 ? 18 : 8,
                  backgroundColor: i % 5 === 0 ? '#00FF00' : '#0B240B',
                }}
              />
            ))}
          </div>

          <div className="absolute inset-x-4 bottom-1 flex justify-between">
            {marks.map((m) => (
              <span key={m} className="text-[9px] font-mono font-medium text-slate-400">
                {m}
              </span>
            ))}
          </div>

          {/* SMCF Marker Needle at 90.4 MHz (approx 20% along scale) */}
          <div className="absolute top-0 bottom-0 left-[21%] w-[2.5px] bg-[#00FF00] shadow-[0_0_12px_#00FF00] z-10 flex flex-col items-center">
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-[#00FF00] -mt-1 shadow-md shadow-[#00FF00]/80"
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
            />
          </div>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-extrabold text-3xl text-white tracking-tight">
              90.4
            </span>
            <span className="text-xs font-bold uppercase text-[#00FF00] tracking-wider">
              MHz FM Stereo
            </span>
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            SGT Campus Media Block Transmitter
          </span>
        </div>
      </div>
    </div>
  );
}
