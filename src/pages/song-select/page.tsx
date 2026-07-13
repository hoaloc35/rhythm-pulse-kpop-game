import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLang } from "@/lib/lang.tsx";
import { SONGS, type Song, type Difficulty } from "@/lib/songs.ts";
import CyberBackground, { NeonText, LangToggle } from "@/components/cyber-bg.tsx";
import { useQuery, Authenticated } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { cn } from "@/lib/utils.ts";
import { ChevronLeft, ChevronRight, Zap, Search, ArrowLeft } from "lucide-react";

type Props = { onStart: (song: Song, difficulty: Difficulty) => void; onBack: () => void; };

const DIFF_BG: Record<Difficulty, string> = {
  easy: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400",
  normal: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
  hard: "bg-pink-500/20 border-pink-500/50 text-pink-400",
};

const ALL_ARTISTS = ["All", ...Array.from(new Set(SONGS.map((s) => s.artist)))];

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className={cn("w-2.5 h-2.5 rounded-sm", i < level ? "bg-primary" : "bg-primary/20")} style={i < level ? { boxShadow: "0 0 4px oklch(0.72 0.28 330)" } : undefined} />
      ))}
    </div>
  );
}

function SongBestScore({ songId, difficulty }: { songId: string; difficulty: Difficulty }) {
  const best = useQuery(api.scores.getMyBest, { songId, difficulty });
  const { t } = useLang();
  if (!best) return null;
  return <div className="text-xs text-muted-foreground">{t.bestScore}: <span className="text-accent font-bold">{best.score.toLocaleString()}</span></div>;
}

export default function SongSelect({ onStart, onBack }: Props) {
  const { t } = useLang();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [animDir, setAnimDir] = useState<1 | -1>(1);
  const [search, setSearch] = useState("");
  const [artistFilter, setArtistFilter] = useState("All");

  const filteredSongs = useMemo(() => SONGS.filter((s) => {
    const matchSearch = search.trim() === "" || s.title.toLowerCase().includes(search.toLowerCase()) || s.artist.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (artistFilter === "All" || s.artist === artistFilter);
  }), [search, artistFilter]);

  const song = filteredSongs[selectedIndex] ?? SONGS[0];
  const prev = () => { setAnimDir(-1); setSelectedIndex((i) => (i - 1 + filteredSongs.length) % filteredSongs.length); };
  const next = () => { setAnimDir(1); setSelectedIndex((i) => (i + 1) % filteredSongs.length); };
  const difficulties: Difficulty[] = ["easy", "normal", "hard"];
  const diffLabels: Record<Difficulty, string> = { easy: t.easy, normal: t.normal, hard: t.hard };
  const handleSearch = (v: string) => { setSearch(v); setSelectedIndex(0); };
  const handleArtist = (v: string) => { setArtistFilter(v); setSelectedIndex(0); };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <CyberBackground />
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={onBack} className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors text-sm font-bold"><ArrowLeft className="w-4 h-4" /> Menu</button>
        <NeonText className="text-xl md:text-3xl font-black tracking-widest uppercase">{t.selectSong}</NeonText>
        <LangToggle />
      </div>
      <div className="relative z-10 px-4 pb-3 flex flex-col md:flex-row gap-2 max-w-5xl mx-auto w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search song / artist..." value={search} onChange={(e) => handleSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {ALL_ARTISTS.slice(0, 8).map((a) => (
            <button key={a} onClick={() => handleArtist(a)} className={cn("px-2 py-1 rounded-lg border text-xs font-bold transition-all", artistFilter === a ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}>{a === "All" ? "All" : a.split(" ")[0]}</button>
          ))}
        </div>
      </div>
      <div className="relative z-10 px-4 text-xs text-muted-foreground text-center mb-1">{filteredSongs.length} songs</div>
      <div className="relative z-10 flex-1 flex flex-col md:flex-row gap-4 px-4 pb-4 max-w-5xl mx-auto w-full">
        <div className="hidden md:flex flex-col gap-1 w-48 overflow-y-auto max-h-[500px] pr-1">
          {filteredSongs.map((s, i) => (
            <button key={s.id} onClick={() => { setAnimDir(i > selectedIndex ? 1 : -1); setSelectedIndex(i); }} className={cn("flex items-center gap-2 p-2 rounded-xl border text-left transition-all", i === selectedIndex ? "border-primary bg-primary/10" : "border-border hover:border-primary/40 hover:bg-card")}>
              <img src={s.coverUrl} alt={s.title} className="w-10 h-8 object-cover rounded" />
              <div className="flex-1 min-w-0"><div className="text-xs font-bold truncate text-foreground">{s.title}</div><div className="text-xs text-muted-foreground truncate">{s.artist}</div></div>
            </button>
          ))}
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex md:hidden items-center gap-2 mb-2">
            <button onClick={prev} className="w-9 h-9 rounded-full border border-primary/50 flex items-center justify-center text-primary"><ChevronLeft className="w-5 h-5" /></button>
            <div className="flex-1 text-center text-sm text-muted-foreground">{selectedIndex + 1} / {filteredSongs.length}</div>
            <button onClick={next} className="w-9 h-9 rounded-full border border-primary/50 flex items-center justify-center text-primary"><ChevronRight className="w-5 h-5" /></button>
          </div>
          {filteredSongs.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">No songs found</div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={song.id} initial={{ x: animDir * 80, opacity: 0, scale: 0.95 }} animate={{ x: 0, opacity: 1, scale: 1 }} exit={{ x: animDir * -80, opacity: 0, scale: 0.95 }} transition={{ duration: 0.25, ease: "easeOut" as const }}>
                <div className="rounded-2xl border-2 border-primary/50 overflow-hidden" style={{ boxShadow: "0 0 30px oklch(0.72 0.28 330 / 0.25)" }}>
                  <div className="relative" style={{ aspectRatio: "16/7" }}>
                    <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                    <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/50 border border-primary/40 text-primary text-xs font-bold backdrop-blur-sm">{song.genre}</div>
                    <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/50 border border-accent/40 text-accent text-xs font-bold backdrop-blur-sm">{song.bpm} BPM</div>
                    <div className="absolute bottom-3 left-3">
                      <h2 className="text-xl md:text-2xl font-black tracking-wide" style={{ color: "oklch(0.72 0.28 330)", textShadow: "0 0 10px oklch(0.72 0.28 330 / 0.6)" }}>{song.title}</h2>
                      <p className="text-muted-foreground font-semibold text-sm">{song.artist}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-card space-y-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-primary"><Zap className="w-4 h-4" /><span className="font-bold">Lv. {song.difficulties[difficulty].level}</span></div>
                      <Authenticated><SongBestScore songId={song.id} difficulty={difficulty} /></Authenticated>
                    </div>
                    <div className="flex gap-2">
                      {difficulties.map((d) => (
                        <button key={d} onClick={() => setDifficulty(d)} className={cn("flex-1 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all", difficulty === d ? DIFF_BG[d] + " scale-105" : "border-border text-muted-foreground hover:border-primary/40")}>
                          {diffLabels[d]}<div className="text-xs opacity-60">Lv.{song.difficulties[d].level}</div>
                        </button>
                      ))}
                    </div>
                    <DifficultyDots level={song.difficulties[difficulty].level} />
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => onStart(song, difficulty)} className="w-full py-4 rounded-xl text-xl font-black tracking-widest uppercase" style={{ background: "linear-gradient(135deg, oklch(0.72 0.28 330), oklch(0.7 0.25 195))", boxShadow: "0 0 20px oklch(0.72 0.28 330 / 0.5)", color: "oklch(0.08 0.02 280)" }}>{t.startGame}</motion.button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
      <div className="relative z-10 text-center text-xs text-muted-foreground pb-3 px-4">{t.useArrowKeys}</div>
    </div>
  );
}
