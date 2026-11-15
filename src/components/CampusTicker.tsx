import { useState, useEffect } from 'react';
import { RadioTower } from 'lucide-react';
import { databaseService } from '../services/databaseService';

export function CampusTicker() {
  const [announcements, setAnnouncements] = useState(() => databaseService.getAnnouncements());

  useEffect(() => {
    const unsub = databaseService.subscribe(() => {
      setAnnouncements(databaseService.getAnnouncements());
    });
    return unsub;
  }, []);

  const loop = [...announcements, ...announcements, ...announcements];

  return (
    <div className="overflow-hidden py-2 bg-[#060E06] border-y border-[#00FF00]/20 flex items-center">
      <div className="shrink-0 pl-3 sm:pl-4 pr-2.5 sm:pr-3 flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-[#00FF00] to-[#10B981] py-1 px-2 sm:px-2.5 rounded-full z-10 shadow-[0_0_12px_rgba(0,255,0,0.35)]">
        <RadioTower className="w-3 h-3 text-slate-950 shrink-0" />
        <span>Station Wire</span>
      </div>

      <div className="ticker-track">
        {loop.map((a, i) => (
          <span
            key={i}
            className="whitespace-nowrap px-4 sm:px-8 text-xs font-medium text-slate-200 flex items-center gap-1.5 sm:gap-2"
          >
            <span className="font-semibold">{a.en}</span>
            <span className="font-hi text-[#00FF00]">· {a.hi}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
