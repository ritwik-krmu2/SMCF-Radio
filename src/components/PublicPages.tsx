import React, { useState } from 'react';
import {
  Radio,
  Play,
  Pause,
  Search,
  Clock,
  Sparkles,
  Bookmark,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  Send,
  Calendar,
  CheckCircle2,
  Headphones,
  MessageSquare,
} from 'lucide-react';
import { Program, RJ, ScheduleItem, Announcement, Category } from '../types';
import { databaseService } from '../services/databaseService';
import { VinylRecord3D } from './3d/VinylRecord3D';
import { Waveform3D } from './3d/Waveform3D';
import { AudioSphere3D } from './3d/AudioSphere3D';

// ===================================================================
// 1. LIVE RADIO VIEW
// ===================================================================
interface LiveRadioViewProps {
  isLive: boolean;
  playing: boolean;
  onPlayLive: () => void;
  onPause: () => void;
  schedule: ScheduleItem[];
  listeners: number;
  programs?: Program[];
  onPlayProgram?: (prog: Program) => void;
  onRequestSong?: () => void;
}

export const LiveRadioView: React.FC<LiveRadioViewProps> = ({
  isLive,
  playing,
  onPlayLive,
  onPause,
  schedule,
  listeners,
  programs = [],
  onPlayProgram,
  onRequestSong,
}) => {
  const currentSlot = schedule.find((s) => s.status === 'live') || schedule[0];

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Immersive Studio Player Card */}
      <div className="card-warm rounded-2xl sm:rounded-3xl p-4 sm:p-10 bg-[#0E1A0E] border border-[#00FF00]/20 shadow-2xl relative overflow-hidden">
        {/* Subtle Emerald & Mint Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00FF00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: 3D Spinning Vinyl Visualizer */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-2 sm:p-4">
            <VinylRecord3D
              isPlaying={isLive && playing}
              title={currentSlot?.title || 'SMCF Live Radio'}
              rj={currentSlot?.rj || 'Campus Studio'}
              size="lg"
            />
            <span className="text-[11px] font-mono text-slate-400 mt-3 text-center">
              {isLive && playing ? 'Streaming Live from Studio 1' : 'Broadcasting Idle · Click Play to Stream'}
            </span>
          </div>

          {/* Right Column: Station Metadata & Controls */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 min-w-0">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#00FF00]/10 border border-[#00FF00]/30 text-[#00FF00] text-[10px] sm:text-xs font-bold tracking-wider uppercase max-w-full">
                <span className="w-2 h-2 rounded-full bg-[#00FF00] animate-ping shrink-0" />
                <span className="truncate">On Air · 90.4 MHz Live Broadcast</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight break-words">
                Live Campus <span className="bg-gradient-to-r from-[#00FF00] via-[#4ADE80] to-[#10B981] bg-clip-text text-transparent">Studio Feed</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Direct audio transmission from the School of emerging media Communication & Film studies studio.
                Currently featuring student journalism, guest masterclasses, and Friday music curations.
              </p>
            </div>

            {/* Currently Playing Card */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#060E06] border border-[#00FF00]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="min-w-0 space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00FF00]">
                  Active Broadcast Slot
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {currentSlot?.title || 'Live Campus Radio Hour'}
                </h3>
                <p className="text-xs text-slate-400">
                  Host: <span className="font-semibold text-white">{currentSlot?.rj || 'Lead RJ'}</span> · {currentSlot?.time || '12:00 PM'}
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-full bg-slate-900 border border-[#00FF00]/30 text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                <Headphones className="w-3.5 h-3.5 text-[#00FF00]" />
                <span>{listeners} tuned in</span>
              </div>
            </div>

            {/* 3D Waveform Ribbon Visualization */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Audio Waveform Stream</span>
                <span>128 kbps Stereo MP3</span>
              </div>
              <Waveform3D isPlaying={isLive && playing} height={45} />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (isLive && playing) {
                    onPause();
                  } else {
                    onPlayLive();
                  }
                }}
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#00FF00] to-[#10B981] hover:from-[#33FF33] hover:to-[#059669] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-[#00FF00]/30 transition-transform hover:scale-105 active:scale-95 cursor-pointer w-full sm:w-auto text-center"
              >
                {isLive && playing ? (
                  <>
                    <Pause className="w-4 h-4 fill-slate-950 text-slate-950" />
                    <span>Pause Live Stream</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-950 text-slate-950 ml-0.5" />
                    <span>Listen Live Now</span>
                  </>
                )}
              </button>

              {onRequestSong && (
                <button
                  onClick={onRequestSong}
                  className="px-5 py-3.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-[#00FF00]/30 hover:border-[#00FF00]/60 transition-all cursor-pointer w-full sm:w-auto text-center shadow-md shadow-[#00FF00]/10"
                >
                  <Radio className="w-4 h-4 text-[#00FF00]" />
                  <span>Request Song & Shoutout</span>
                </button>
              )}

              <div className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FF00] shrink-0" />
                <span>FM Transmitter Online (90.4 MHz)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Programming Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-extrabold text-white">Broadcast Programming Lineup</h2>
            <p className="text-xs text-slate-400">Official daily schedule for SGT University campus broadcast</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#00FF00]/10 text-[#00FF00] text-xs font-semibold border border-[#00FF00]/30">
            Indian Standard Time (IST)
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {schedule.map((item, idx) => {
            const isItemLive = item.status === 'live';
            return (
              <div
                key={idx}
                className={`card-warm p-5 rounded-3xl border transition-all ${
                  isItemLive
                    ? 'bg-[#0B180B] border-[#00FF00]/50 shadow-lg shadow-emerald-950/50'
                    : 'bg-[#0E1A0E] border-[#00FF00]/20'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-semibold text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#00FF00]" />
                    {item.time}
                  </span>
                  {isItemLive ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#00FF00] to-[#10B981] text-slate-950 font-black">
                      ON AIR NOW
                    </span>
                  ) : item.status === 'next' ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30">
                      UP NEXT
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-900 text-slate-400">
                      COMPLETED
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mb-1 leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-400">Host: <span className="font-semibold text-white">{item.rj}</span></p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recently Played / Popular Vault Episodes */}
      {programs.length > 0 && onPlayProgram && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-display font-extrabold text-white">Recently Streamed from the Vault</h2>
              <span className="text-xs text-slate-400">Master audio recordings archived for on-demand playback</span>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {programs.slice(0, 3).map((prog) => (
              <div
                key={prog.id}
                className="card-warm p-4 sm:p-5 rounded-2xl bg-[#0E1A0E] border border-[#00FF00]/20 flex flex-col justify-between hover:border-[#00FF00]/50 hover:shadow-xl transition-all group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30">
                      {prog.cat.replace('-', ' ')}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#00FF00]" />
                      {prog.duration}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-[#00FF00] transition-colors break-words">
                      {prog.title}
                    </h4>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mt-1">
                      {prog.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#00FF00]/15 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Broadcaster</span>
                    <span className="text-xs font-semibold text-white truncate block">
                      {prog.rj}
                    </span>
                  </div>

                  <button
                    onClick={() => onPlayProgram(prog)}
                    className="w-9 h-9 rounded-full bg-gradient-to-r from-[#00FF00] to-[#10B981] hover:from-[#33FF33] hover:to-[#059669] text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md shadow-[#00FF00]/30 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    title={`Play ${prog.title}`}
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950 ml-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ===================================================================
// 2. SHOWS DIRECTORY VIEW
// ===================================================================
interface ShowsDirectoryViewProps {
  programs: Program[];
  categories: Category[];
  onPlayProgram: (prog: Program) => void;
}

export const ShowsDirectoryView: React.FC<ShowsDirectoryViewProps> = ({
  programs,
  categories,
  onPlayProgram,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = programs.filter((p) => {
    const matchCat = selectedCat === 'all' || p.cat === selectedCat;
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.rj.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
          Flagship Shows & <span className="bg-gradient-to-r from-[#00FF00] via-[#4ADE80] to-[#10B981] bg-clip-text text-transparent">Campus Series</span>
        </h1>
        <p className="text-sm text-slate-300">
          Explore podcasts, cinema roundtables, career dialogues, and comedy hosted by SGT University media students.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCat === 'all'
                ? 'bg-gradient-to-r from-[#00FF00] to-[#10B981] text-slate-950 font-black shadow-md shadow-[#00FF00]/30'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-[#00FF00]/20'
            }`}
          >
            All Programs ({programs.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setSelectedCat(c.slug)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCat === c.slug
                  ? 'bg-gradient-to-r from-[#00FF00] to-[#10B981] text-slate-950 font-black shadow-md shadow-[#00FF00]/30'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-[#00FF00]/20'
              }`}
            >
              {c.en}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-auto min-w-0 sm:min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search shows, topics, hosts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-[#060E06] border border-[#00FF00]/25 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00FF00] transition-colors"
          />
        </div>
      </div>

      {/* Shows Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((prog) => (
          <div
            key={prog.id}
            className="card-warm rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-[#0E1A0E] border border-[#00FF00]/20 flex flex-col justify-between hover:border-[#00FF00]/50 hover:shadow-xl transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30">
                  {prog.cat.replace('-', ' ')}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{prog.duration}</span>
              </div>

              <h3 className="text-lg font-bold text-white leading-snug line-clamp-2">{prog.title}</h3>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{prog.desc}</p>
            </div>

            <div className="mt-5 pt-4 border-t border-[#00FF00]/15 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wide">Broadcaster</span>
                <span className="text-white font-semibold">{prog.rj}</span>
              </div>

              <div className="flex items-center gap-2">
                {prog.driveUrl && (
                  <a
                    href={prog.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Open Google Drive File"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={() => onPlayProgram(prog)}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00FF00] to-[#10B981] hover:from-[#33FF33] hover:to-[#059669] text-slate-950 font-black flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md shadow-[#00FF00]/30 cursor-pointer"
                  aria-label={`Play ${prog.title}`}
                >
                  <Play className="w-4 h-4 ml-0.5 fill-slate-950 text-slate-950" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===================================================================
// 3. EPISODE ARCHIVE VIEW
// ===================================================================
interface EpisodeArchiveViewProps {
  programs: Program[];
  onPlayProgram: (prog: Program) => void;
  currentUserId?: string;
  onCommentEpisode?: (prog: Program) => void;
}

export const EpisodeArchiveView: React.FC<EpisodeArchiveViewProps> = ({
  programs,
  onPlayProgram,
  currentUserId,
  onCommentEpisode,
}) => {
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState<string>('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>(() =>
    currentUserId ? databaseService.getBookmarks(currentUserId) : []
  );

  const handleToggleBookmark = (episodeId: number) => {
    if (!currentUserId) {
      alert('Please log in to save episodes to your student portal library!');
      return;
    }
    databaseService.toggleBookmark(currentUserId, episodeId);
    setBookmarkedIds(databaseService.getBookmarks(currentUserId));
  };

  const filtered = programs.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.desc.toLowerCase().includes(search.toLowerCase()) ||
      p.rj.toLowerCase().includes(search.toLowerCase());
    const matchLang = filterLang === 'all' || p.lang.toLowerCase() === filterLang.toLowerCase();
    return matchSearch && matchLang;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
          Master Episode Vault & <span className="bg-gradient-to-r from-[#00FF00] via-[#4ADE80] to-[#10B981] bg-clip-text text-transparent">Audio Library</span>
        </h1>
        <p className="text-sm text-slate-300">
          Complete catalog of {programs.length} authentic master studio audio recordings recorded by SMCF Radio.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-warm p-4 rounded-3xl bg-[#0E1A0E] border border-[#00FF00]/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search all archive recordings by keyword or RJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#060E06] border border-[#00FF00]/25 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00FF00]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Language:</span>
          {['all', 'HI', 'EN'].map((l) => (
            <button
              key={l}
              onClick={() => setFilterLang(l)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                filterLang === l
                  ? 'bg-gradient-to-r from-[#00FF00] to-[#10B981] text-slate-950 font-black shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-[#00FF00]/20'
              }`}
            >
              {l === 'all' ? 'All' : l}
            </button>
          ))}
        </div>
      </div>

      {/* Archive List */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const isBookmarked = bookmarkedIds.includes(item.id);

          return (
            <div
              key={item.id}
              className="card-warm p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#0E1A0E] border border-[#00FF00]/20 hover:border-[#00FF00]/50 hover:shadow-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
            >
              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                <button
                  onClick={() => onPlayProgram(item)}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-r from-[#00FF00] to-[#10B981] hover:from-[#33FF33] hover:to-[#059669] text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md shadow-[#00FF00]/30 cursor-pointer transition-transform hover:scale-105"
                  aria-label={`Play ${item.title}`}
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 fill-slate-950 text-slate-950" />
                </button>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30">
                      {item.cat}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{item.duration}</span>
                    <span className="text-[11px] text-slate-400">• {item.plays} verified listens</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug break-words">{item.title}</h3>
                  <p className="text-xs text-slate-300 line-clamp-2">{item.desc}</p>
                  <p className="text-[11px] text-slate-400">
                    Broadcaster: <span className="font-semibold text-white">{item.rj}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {onCommentEpisode && (
                  <button
                    onClick={() => onCommentEpisode(item)}
                    className="p-2 sm:p-2.5 rounded-full bg-[#060E06] border border-[#00FF00]/25 text-slate-400 hover:text-[#00FF00] hover:border-[#00FF00]/60 transition-colors cursor-pointer"
                    title="Comment / Review Episode"
                  >
                    <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleToggleBookmark(item.id)}
                  className={`p-2 sm:p-2.5 rounded-full border transition-colors cursor-pointer ${
                    isBookmarked
                      ? 'bg-[#00FF00]/10 border-[#00FF00] text-[#00FF00]'
                      : 'bg-[#060E06] border-[#00FF00]/25 text-slate-400 hover:text-white'
                  }`}
                  title={isBookmarked ? 'Remove Bookmark' : 'Save to Student Library'}
                >
                  <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isBookmarked ? 'fill-[#00FF00]' : ''}`} />
                </button>

                {item.driveUrl && (
                  <a
                    href={item.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:p-2.5 rounded-full bg-[#060E06] border border-[#00FF00]/25 text-slate-400 hover:text-white transition-colors"
                    title="Open on Google Drive"
                  >
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ===================================================================
// 4. RJ PROFILES VIEW
// ===================================================================
interface RJProfilesViewProps {
  rjs: RJ[];
  onPlayRJVoice: (rj: RJ) => void;
}

export const RJProfilesView: React.FC<RJProfilesViewProps> = ({ rjs, onPlayRJVoice }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
          Meet Your <span className="bg-gradient-to-r from-[#00FF00] via-[#4ADE80] to-[#10B981] bg-clip-text text-transparent">Campus Radio Jockeys</span>
        </h1>
        <p className="text-sm text-slate-300">
          Student voices curating music, philosophy, career insights, and comedy at SGT University.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rjs.map((rj, idx) => (
          <div
            key={idx}
            className="card-warm p-6 rounded-3xl bg-[#0E1A0E] border border-[#00FF00]/20 hover:border-[#00FF00]/50 hover:shadow-xl transition-all flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-extrabold text-xl text-white shadow-md shadow-[#00FF00]/25 bg-gradient-to-tr from-[#00FF00] to-[#10B981]"
                >
                  {rj.initials}
                </div>

                {rj.badge && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30">
                    {rj.badge}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-display font-bold text-white group-hover:text-[#00FF00] transition-colors">
                  {rj.alias}
                </h3>
                <p className="text-xs text-slate-400">{rj.name} · {rj.dept}</p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{rj.bio}</p>

              {rj.showTime && (
                <div className="p-2.5 rounded-2xl bg-[#060E06] border border-[#00FF00]/20 text-[11px] font-mono text-slate-300 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#00FF00]" />
                  <span>{rj.showTime}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#00FF00]/15">
              <button
                onClick={() => onPlayRJVoice(rj)}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#00FF00] to-[#10B981] hover:from-[#33FF33] hover:to-[#059669] text-slate-950 font-black font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-md shadow-[#00FF00]/30"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                <span>Play Voice Sample</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===================================================================
// 5. ANNOUNCEMENTS VIEW
// ===================================================================
interface AnnouncementsViewProps {
  announcements: Announcement[];
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({ announcements }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
          Campus Broadcast <span className="bg-gradient-to-r from-[#00FF00] via-[#4ADE80] to-[#10B981] bg-clip-text text-transparent">Bulletin Board</span>
        </h1>
        <p className="text-sm text-slate-300">
          Official notifications, audition calls, and schedule updates from SMCF Radio station management.
        </p>
      </div>

      <div className="space-y-4">
        {announcements.map((ann, idx) => (
          <div
            key={idx}
            className="card-warm p-6 rounded-3xl bg-[#0E1A0E] border border-[#00FF00]/20 space-y-3 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30">
                Official Station Bulletin
              </span>
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#00FF00]" />
                Semester Fall 2026
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-sm sm:text-base font-bold text-white leading-relaxed">{ann.en}</p>
              <p className="text-xs sm:text-sm text-[#00FF00] font-hi font-semibold leading-relaxed">{ann.hi}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===================================================================
// 6. ABOUT SMCF RADIO VIEW
// ===================================================================
export const AboutView: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="text-center space-y-3">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30">
          About the Station
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
          The Voice of <span className="bg-gradient-to-r from-[#00FF00] via-[#4ADE80] to-[#10B981] bg-clip-text text-transparent">Emerging Media</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          SMCF Radio is the official campus broadcast station of the School of emerging media Communication & Film studies.
        </p>
      </div>

      {/* 3D Audio Visual Spotlight */}
      <div className="flex justify-center">
        <AudioSphere3D size={160} label="Acoustic Broadcasting Cell" sublabel="Live FM 90.4 MHz & Digital Stream" />
      </div>

      {/* Mission & Infrastructure */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card-warm p-6 rounded-3xl bg-[#0E1A0E] border border-[#00FF00]/20 space-y-3 shadow-lg">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00FF00]" />
            Broadcasting Mission
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Empower students with real-world production, voice modulation, digital sound engineering, and journalism skills.
            SMCF Radio bridges academic theory and professional broadcast standard practices.
          </p>
        </div>

        <div className="card-warm p-6 rounded-3xl bg-[#0E1A0E] border border-[#00FF00]/20 space-y-3 shadow-lg">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#00FF00]" />
            Studio Infrastructure
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Equipped with Shure cardioid broadcast microphones, audio mixing consoles, acoustic damping chambers, and automated streaming encoders delivering high-definition stereo streams.
          </p>
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// 7. CONTACT & STUDIO LOCATION VIEW
// ===================================================================
export const ContactView: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    databaseService.logActivity(formData.name, 'Public Inquiry Submitted', `Subject: ${formData.subject}`);
    setSubmitted(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
          Contact the <span className="bg-gradient-to-r from-[#00FF00] via-[#4ADE80] to-[#10B981] bg-clip-text text-transparent">Broadcast Studio</span>
        </h1>
        <p className="text-sm text-slate-300">
          Have an episode proposal, musical request, or want to audition for next semester's RJ roster? Get in touch!
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Studio Info */}
        <div className="space-y-6">
          <div className="card-warm p-6 rounded-3xl bg-[#0E1A0E] border border-[#00FF00]/20 space-y-4 shadow-lg">
            <h3 className="text-base font-bold text-white">Campus Studio Information</h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#00FF00] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  SMCF Radio Studio, 3rd Floor, Media Block,<br />
                  SGT University Campus, Chandu-Budhera, Gurugram, Haryana — 122505
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#00FF00] shrink-0" />
                <span>radio@smcf.edu.in</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#00FF00] shrink-0" />
                <span>Studio Desk: +91 124 2278183 (Ext. 402)</span>
              </div>
            </div>
          </div>

          <div className="card-warm p-6 rounded-3xl bg-[#0E1A0E] border border-[#00FF00]/20 space-y-2 shadow-lg">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#00FF00]">Studio Hours</h4>
            <p className="text-xs text-white">Monday – Friday: 9:00 AM – 5:30 PM IST</p>
            <p className="text-xs text-slate-400">Live Broadcast Slots: Every Friday 11:00 AM – 4:00 PM</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="card-warm p-6 sm:p-8 rounded-3xl bg-[#0E1A0E] border border-[#00FF00]/20 shadow-xl">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#00FF00] mx-auto" />
              <h3 className="text-lg font-bold text-white">Message Transmitted!</h3>
              <p className="text-xs text-slate-300">
                Thank you for contacting SMCF Radio. Our student editorial board will review your inquiry promptly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: '', message: '' });
                }}
                className="mt-4 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00FF00] to-[#10B981] text-slate-950 font-black font-bold text-xs shadow-md shadow-[#00FF00]/30"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ronit Kumar"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#060E06] border border-[#00FF00]/25 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00FF00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">University / Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@smcf.edu.in"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#060E06] border border-[#00FF00]/25 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00FF00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. RJ Audition Inquiry / Podcast Submission"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#060E06] border border-[#00FF00]/25 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00FF00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can the SMCF Radio studio assist you?"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#060E06] border border-[#00FF00]/25 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00FF00] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#00FF00] to-[#10B981] hover:from-[#33FF33] hover:to-[#059669] text-slate-950 font-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00FF00]/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Message to Studio</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
