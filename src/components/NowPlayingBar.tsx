import { useState } from 'react';
import { Play, Pause, Headphones, Volume2, VolumeX, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

interface NowPlayingBarProps {
  isLive: boolean;
  nowPlaying: {
    title: string;
    rj: string;
    audioUrl?: string;
    driveUrl?: string;
    duration?: string;
  };
  playing: boolean;
  setPlaying: (playing: boolean | ((p: boolean) => boolean)) => void;
  listeners: number;
  volume?: number;
  setVolume?: (vol: number) => void;
  isMuted?: boolean;
  setIsMuted?: (muted: boolean | ((m: boolean) => boolean)) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  currentTime?: number;
  duration?: number;
  onSeek?: (sec: number) => void;
  theme?: 'dark' | 'light';
}

export function NowPlayingBar({
  isLive,
  nowPlaying,
  playing,
  setPlaying,
  listeners,
  volume = 1,
  setVolume,
  isMuted = false,
  setIsMuted,
  isLoading = false,
  errorMessage = null,
  currentTime = 0,
  duration = 0,
  onSeek,
  theme = 'dark',
}: NowPlayingBarProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const isLight = theme === 'light';

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-40 transition-colors duration-300 ${
        isLight
          ? 'bg-white border-t border-[#E8EAE2] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] text-[#202820]'
          : 'bg-[#060E06]/95 backdrop-blur-md border-t border-[#00FF00]/25 shadow-[0_-8px_30px_rgba(0,15,0,0.85)] text-white'
      }`}
    >
      {/* Subtle top progress scrubber line for recorded playback */}
      {!isLive && duration > 0 && (
        <div
          className={`absolute -top-[2px] left-0 right-0 h-[3px] cursor-pointer group ${
            isLight ? 'bg-[#E8EAE2]' : 'bg-slate-800'
          }`}
          onClick={(e) => {
            if (onSeek) {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              onSeek(ratio * duration);
            }
          }}
        >
          <div
            className={`h-full transition-all group-hover:h-[4px] ${
              isLight ? 'bg-[#10B981]' : 'bg-gradient-to-r from-[#00FF00] to-[#10B981]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-4">
        {/* Playback Control Trigger */}
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={isLoading}
          className={`w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-60 ${
            isLight
              ? 'bg-[#10B981] hover:bg-[#059669] text-white shadow-sm'
              : 'bg-gradient-to-r from-[#00FF00] to-[#10B981] text-slate-950 font-black shadow-lg shadow-[#00FF00]/40'
          }`}
          aria-label={playing ? 'Pause audio' : 'Play audio'}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-current animate-spin" />
          ) : playing ? (
            <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          ) : (
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Dynamic Graphic Equalizer */}
        <div className={`eq shrink-0 ${playing && !isLoading ? '' : 'paused'}`}>
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        {/* Station Metadata Output */}
        <div className="min-w-0 flex-1 pl-0.5 sm:pl-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isLive ? (
              <>
                <span className={isLight ? 'w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0' : 'pulse-dot shrink-0'} />
                <span
                  className={`text-[9px] sm:text-[10px] font-display font-bold tracking-wider uppercase truncate ${
                    isLight ? 'text-[#145A42]' : 'text-[#00FF00]'
                  }`}
                >
                  <span className="hidden sm:inline">On Air · 90.4 MHz Live Broadcast</span>
                  <span className="sm:hidden">ON AIR · 90.4 FM</span>
                </span>
              </>
            ) : (
              <span
                className={`text-[9px] sm:text-[10px] font-display font-bold tracking-wider uppercase truncate ${
                  isLight ? 'text-[#145A42]' : 'text-[#00FF00]'
                }`}
              >
                <span className="hidden sm:inline">Recorded Broadcast · Episode Vault</span>
                <span className="sm:hidden">VAULT AUDIO</span>
              </span>
            )}

            {/* Error or Buffering indicator */}
            {errorMessage ? (
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 shrink-0">
                <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600" />
                <span className="hidden sm:inline">Reconnecting...</span>
                <span className="sm:hidden">Offline</span>
              </span>
            ) : isLoading ? (
              <span className={`text-[9px] sm:text-[10px] animate-pulse shrink-0 ${isLight ? 'text-[#778078]' : 'text-slate-400'}`}>
                Buffering...
              </span>
            ) : null}
          </div>

          <div
            className={`text-[11px] sm:text-sm font-bold truncate leading-snug ${
              isLight ? 'text-[#202820]' : 'text-white'
            }`}
          >
            <span>{nowPlaying.title}</span>
            <span className={`font-normal text-[10px] sm:text-xs ${isLight ? 'text-[#778078]' : 'text-slate-400'}`}>
              {' '}
              — {nowPlaying.rj}
            </span>
          </div>

          {/* Time scrubber text for recorded show */}
          {!isLive && duration > 0 && (
            <div className={`text-[9px] sm:text-[10px] font-mono mt-0.5 ${isLight ? 'text-[#778078]' : 'text-slate-400'}`}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          )}
        </div>

        {/* Volume & Mute Controls (Compact inline flyout) */}
        {setVolume && setIsMuted && (
          <div
            className="relative flex items-center shrink-0"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              onClick={() => setIsMuted((m) => !m)}
              className={`p-1 sm:p-1.5 rounded-full transition-colors cursor-pointer ${
                isLight
                  ? 'text-[#778078] hover:text-[#202820] hover:bg-[#F0F2EC]'
                  : 'hover:bg-[#00FF00]/10 text-slate-400 hover:text-white'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className={`w-4 h-4 ${isLight ? 'text-[#10B981]' : 'text-[#00FF00]'}`} />
              )}
            </button>

            {/* Flyout volume slider */}
            {showVolumeSlider && (
              <div
                className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-2 rounded-xl shadow-xl flex flex-col items-center gap-1 ${
                  isLight
                    ? 'bg-white border border-[#E8EAE2]'
                    : 'bg-[#0E1A0E] border border-[#00FF00]/30'
                }`}
                style={{ width: '36px', height: '110px' }}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVolume(val);
                    if (isMuted && val > 0) setIsMuted(false);
                  }}
                  className={`w-20 h-1 cursor-pointer rotate-270 my-auto ${
                    isLight ? 'accent-[#10B981]' : 'accent-[#00FF00]'
                  }`}
                />
              </div>
            )}
          </div>
        )}

        {/* Optional Google Drive Source Link */}
        {nowPlaying.driveUrl && (
          <a
            href={nowPlaying.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden md:flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors shrink-0 ${
              isLight
                ? 'bg-[#F0F2EC] text-[#202820] hover:bg-[#E8EAE2] border border-[#E8EAE2]'
                : 'bg-slate-900/90 text-slate-300 hover:text-[#00FF00] border border-[#00FF00]/20'
            }`}
            title="Open Original Recording in Google Drive"
          >
            <ExternalLink className={`w-3 h-3 ${isLight ? 'text-[#10B981]' : 'text-[#00FF00]'}`} />
            <span>Drive Audio</span>
          </a>
        )}

        {/* Real-time active listener indicator */}
        <div
          className={`hidden sm:flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full ${
            isLight
              ? 'bg-[#EAF5EC] border border-[#10B981]/25 text-[#145A42]'
              : 'bg-[#00FF00]/10 border border-[#00FF00]/25 text-[#00FF00]'
          }`}
        >
          <Headphones className={`w-3.5 h-3.5 ${isLight ? 'text-[#10B981]' : 'text-[#00FF00]'}`} />
          <span>{listeners} listening</span>
        </div>
      </div>
    </div>
  );
}
