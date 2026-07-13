import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import YouTube, { type YouTubePlayer } from "react-youtube";
import { useLang } from "@/lib/lang.tsx";
import { type Song, type Difficulty, type Note, type NoteDirection } from "@/lib/songs.ts";
import { Pause, Play, X } from "lucide-react";

type HitType = "perfect" | "great" | "good" | "bad" | "miss";

export type GameStats = {
  score: number; combo: number; maxCombo: number;
  perfect: number; great: number; good: number; bad: number; miss: number;
};

type ActiveNote = Note & { y: number; opacity: number; };
type JudgmentEffect = { id: number; type: HitType; direction: NoteDirection; };
type Props = { song: Song; difficulty: Difficulty; onFinish: (stats: GameStats) => void; onQuit: () => void; };

const DIRECTIONS: NoteDirection[] = ["upleft", "left", "down", "up", "right", "upright"];
const ARROW_SYMBOLS: Record<NoteDirection, string> = { left: "←", down: "↓", up: "↑", right: "→", upleft: "↖", upright: "↗" };
const KEY_MAP: Record<string, NoteDirection> = {
  ArrowLeft: "left", ArrowDown: "down", ArrowUp: "up", ArrowRight: "right",
  a: "left", s: "down", w: "up", d: "right",
  A: "left", S: "down", W: "up", D: "right",
  q: "upleft", Q: "upleft", e: "upright", E: "upright",
};
const HIT_WINDOWS = { perfect: 50, great: 100, good: 150, bad: 200 };
const SCORE_VALUES = { perfect: 300, great: 200, good: 100, bad: 50, miss: 0 };
const HIT_COLORS: Record<HitType, string> = { perfect: "#ffd700", great: "#00e5ff", good: "#00ff88", bad: "#ff8800", miss: "#ff3355" };
const LANE_COLS: Record<NoteDirection, number> = { upleft: 0, left: 1, down: 2, up: 3, right: 4, upright: 5 };
const NOTE_TRAVEL_MS = 1500;

export function getGrade(score: number, totalNotes: number): string {
  const maxScore = totalNotes * SCORE_VALUES.perfect;
  const pct = maxScore > 0 ? score / maxScore : 0;
  if (pct >= 0.95) return "S";
  if (pct >= 0.85) return "A";
  if (pct >= 0.70) return "B";
  if (pct >= 0.55) return "C";
  if (pct >= 0.40) return "D";
  return "F";
}

export default function GamePlay({ song, difficulty, onFinish, onQuit }: Props) {
  const { t } = useLang();
  const notes = song.difficulties[difficulty].notes;
  const [gameTime, setGameTime] = useState(-3000);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [started, setStarted] = useState(false);
  const [activeNotes, setActiveNotes] = useState<ActiveNote[]>([]);
  const [judgments, setJudgments] = useState<JudgmentEffect[]>([]);
  const [pressedKeys, setPressedKeys] = useState<Set<NoteDirection>>(new Set());
  const [stats, setStats] = useState<GameStats>({ score: 0, combo: 0, maxCombo: 0, perfect: 0, great: 0, good: 0, bad: 0, miss: 0 });
  const playerRef = useRef<YouTubePlayer | null>(null);
  const gameTimeRef = useRef(-3000);
  const lastFrameRef = useRef<number>(0);
  const notesRef = useRef<Note[]>([...notes]);
  const activeNotesRef = useRef<ActiveNote[]>([]);
  const statsRef = useRef<GameStats>({ score: 0, combo: 0, maxCombo: 0, perfect: 0, great: 0, good: 0, bad: 0, miss: 0 });
  const judgmentIdRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);

  const addJudgment = useCallback((type: HitType, direction: NoteDirection) => {
    const id = judgmentIdRef.current++;
    setJudgments((prev) => [...prev, { id, type, direction }]);
    setTimeout(() => setJudgments((prev) => prev.filter((j) => j.id !== id)), 600);
  }, []);

  const processHit = useCallback((direction: NoteDirection) => {
    const now = gameTimeRef.current;
    const hitNote = activeNotesRef.current.filter((n) => n.direction === direction && !n.hit).sort((a, b) => Math.abs(a.time - now) - Math.abs(b.time - now))[0];
    if (!hitNote) { addJudgment("miss", direction); return; }
    const diff = Math.abs(hitNote.time - now);
    let hitType: HitType;
    if (diff <= HIT_WINDOWS.perfect) hitType = "perfect";
    else if (diff <= HIT_WINDOWS.great) hitType = "great";
    else if (diff <= HIT_WINDOWS.good) hitType = "good";
    else if (diff <= HIT_WINDOWS.bad) hitType = "bad";
    else return;
    const resolvedHit = hitType;
    activeNotesRef.current = activeNotesRef.current.map((n) => n.id === hitNote.id ? { ...n, hit: resolvedHit } : n);
    const prev = statsRef.current;
    const resetCombo = resolvedHit === "bad";
    const newCombo = resetCombo ? 0 : prev.combo + 1;
    const comboBonus = Math.floor(newCombo / 10) * 50;
    const newStats: GameStats = { ...prev, score: prev.score + SCORE_VALUES[resolvedHit] + (resolvedHit === "perfect" || resolvedHit === "great" ? comboBonus : 0), combo: newCombo, maxCombo: Math.max(prev.maxCombo, newCombo), [resolvedHit]: prev[resolvedHit] + 1 };
    statsRef.current = newStats;
    setStats({ ...newStats });
    addJudgment(resolvedHit, direction);
  }, [addJudgment]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Escape") { if (!started) { setStarted(true); return; } setIsPaused((p) => { isPausedRef.current = !p; return !p; }); return; }
      const dir = KEY_MAP[e.key];
      if (!dir || !isRunningRef.current || isPausedRef.current) return;
      e.preventDefault();
      setPressedKeys((prev) => new Set([...prev, dir]));
      processHit(dir);
      setTimeout(() => setPressedKeys((prev) => { const s = new Set(prev); s.delete(dir); return s; }), 150);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [processHit, started]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    const interval = setInterval(() => {
      setCountdownValue((v) => { if (v <= 1) { clearInterval(interval); setIsRunning(true); isRunningRef.current = true; return 0; } return v - 1; });
    }, 1000);
    timer = interval;
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const loop = (timestamp: number) => {
      if (lastFrameRef.current === 0) lastFrameRef.current = timestamp;
      const delta = isPausedRef.current ? 0 : timestamp - lastFrameRef.current;
      lastFrameRef.current = timestamp;
      gameTimeRef.current += delta;
      const now = gameTimeRef.current;
      const toSpawn = notesRef.current.filter((n) => n.time - NOTE_TRAVEL_MS <= now && n.time >= now - 500);
      const spawnIds = new Set(toSpawn.map((n) => n.id));
      const existingIds = new Set(activeNotesRef.current.map((n) => n.id));
      const newNotes: ActiveNote[] = toSpawn.filter((n) => !existingIds.has(n.id)).map((n) => ({ ...n, y: 0, opacity: 1 }));
      if (newNotes.length > 0) { notesRef.current = notesRef.current.filter((n) => !spawnIds.has(n.id)); activeNotesRef.current = [...activeNotesRef.current, ...newNotes]; }
      activeNotesRef.current = activeNotesRef.current.map((n) => { const elapsed = now - (n.time - NOTE_TRAVEL_MS); return { ...n, y: Math.min(100, (elapsed / NOTE_TRAVEL_MS) * 100) }; }).filter((n) => {
        if (n.hit) return n.y < 110;
        if (n.y > 95 && !n.hit) { const prev = statsRef.current; const newStats = { ...prev, miss: prev.miss + 1, combo: 0 }; statsRef.current = newStats; setStats({ ...newStats }); addJudgment("miss", n.direction); return false; }
        return true;
      });
      setActiveNotes([...activeNotesRef.current]);
      setGameTime(now);
      if (notesRef.current.length === 0 && activeNotesRef.current.length === 0) { isRunningRef.current = false; setTimeout(() => onFinish(statsRef.current), 1000); return; }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isRunning, addJudgment, onFinish]);

  useEffect(() => { if (isRunning && playerRef.current) playerRef.current.playVideo(); }, [isRunning]);
  useEffect(() => { if (playerRef.current) { if (isPaused) playerRef.current.pauseVideo(); else if (isRunning) playerRef.current.playVideo(); } }, [isPaused, isRunning]);

  const totalNotes = notes.length;
  const progressPct = Math.max(0, Math.min(100, (gameTime / (notes[notes.length - 1]?.time ?? 1)) * 100));
  const healthPct = Math.max(0, Math.min(100, totalNotes > 0 ? ((stats.perfect * 3 + stats.great * 2 + stats.good) / Math.max(1, stats.perfect + stats.great + stats.good + stats.bad + stats.miss)) * 100 : 100));

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <YouTube videoId={song.youtubeId} opts={{ width: "100%", height: "100%", playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, rel: 0, showinfo: 0, mute: 0 } }} onReady={(e) => { playerRef.current = e.target; }} className="w-full h-full" style={{ pointerEvents: "none" }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 z-20 p-3 flex items-center gap-3">
        <div className="flex-1"><div className="text-white font-black text-sm tracking-wider">{song.title}</div><div className="text-white/60 text-xs">{song.artist}</div></div>
        <div className="text-center"><div className="text-white/60 text-xs tracking-widest">{t.score}</div><div className="text-white font-black text-2xl tabular-nums" style={{ textShadow: "0 0 10px oklch(0.72 0.28 330)" }}>{stats.score.toLocaleString()}</div></div>
        <div className="text-right min-w-[80px]">
          <AnimatePresence mode="wait">{stats.combo > 0 && (<motion.div key={stats.combo} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}><div className="text-white/60 text-xs tracking-widest">{t.combo}</div><div className="font-black text-2xl tabular-nums" style={{ color: "oklch(0.72 0.28 330)", textShadow: "0 0 10px oklch(0.72 0.28 330)" }}>{stats.combo}</div></motion.div>)}</AnimatePresence>
        </div>
        <button onClick={() => { setIsPaused((p) => { isPausedRef.current = !p; return !p; }); }} className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors">{isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}</button>
      </div>
      <div className="absolute top-16 left-3 right-3 z-20 h-2 rounded-full bg-white/10 overflow-hidden"><motion.div className="h-full rounded-full" style={{ background: healthPct > 50 ? "linear-gradient(90deg, oklch(0.65 0.28 145), oklch(0.7 0.25 195))" : healthPct > 25 ? "linear-gradient(90deg, oklch(0.8 0.2 85), oklch(0.65 0.28 145))" : "linear-gradient(90deg, oklch(0.72 0.28 330), oklch(0.65 0.25 25))" }} animate={{ width: `${healthPct}%` }} transition={{ duration: 0.3 }} /></div>
      <div className="absolute top-20 left-3 right-3 z-20 h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full transition-all duration-300" style={{ width: `${progressPct}%`, background: "oklch(0.7 0.25 195)" }} /></div>
      <div className="absolute inset-0 z-10 flex items-end pb-20">
        <div className="w-full max-w-2xl mx-auto relative h-full">
          <div className="absolute inset-0 flex">{DIRECTIONS.map((dir) => (<div key={dir} className="flex-1 relative border-x border-white/5" style={{ background: pressedKeys.has(dir) ? "oklch(0.72 0.28 330 / 0.1)" : "transparent" }} />))}</div>
          {activeNotes.map((note) => (
            <motion.div key={note.id} className="absolute" style={{ left: `${(LANE_COLS[note.direction] / DIRECTIONS.length) * 100}%`, width: `${100 / DIRECTIONS.length}%`, top: `${note.y}%`, opacity: note.hit ? 0 : 1, transform: "translateX(4px)" }}>
              <div className="w-full aspect-square flex items-center justify-center text-2xl font-black rounded-lg" style={{ background: note.direction.includes("up") ? "linear-gradient(135deg, oklch(0.72 0.28 330), oklch(0.75 0.22 270))" : note.direction === "left" || note.direction === "right" ? "linear-gradient(135deg, oklch(0.7 0.25 195), oklch(0.72 0.28 330))" : "linear-gradient(135deg, oklch(0.65 0.28 145), oklch(0.7 0.25 195))", boxShadow: "0 0 12px oklch(0.72 0.28 330 / 0.8)", border: "2px solid oklch(1 0 0 / 0.3)", color: "white", textShadow: "0 0 8px white", fontSize: "clamp(14px, 2.5vw, 24px)" }}>{ARROW_SYMBOLS[note.direction]}</div>
            </motion.div>
          ))}
          <div className="absolute bottom-2 left-0 right-0 flex">{DIRECTIONS.map((dir) => (<div key={dir} className="flex-1 px-1"><motion.div className="aspect-square flex items-center justify-center text-2xl font-black rounded-lg border-2" animate={{ scale: pressedKeys.has(dir) ? 0.9 : 1, borderColor: pressedKeys.has(dir) ? "oklch(0.72 0.28 330)" : "oklch(0.4 0.1 270)" }} style={{ background: pressedKeys.has(dir) ? "oklch(0.72 0.28 330 / 0.3)" : "oklch(0.15 0.05 270 / 0.8)", color: pressedKeys.has(dir) ? "oklch(0.72 0.28 330)" : "oklch(0.5 0.1 270)", fontSize: "clamp(14px, 2.5vw, 24px)" }}>{ARROW_SYMBOLS[dir]}</motion.div></div>))}</div>
        </div>
      </div>
      <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
        <AnimatePresence>{judgments.map((j) => (<motion.div key={j.id} initial={{ scale: 0.5, opacity: 1, y: 0 }} animate={{ scale: 1.2, opacity: 0, y: -50 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: "easeOut" as const }} className="absolute font-black text-2xl tracking-widest" style={{ color: HIT_COLORS[j.type], textShadow: `0 0 15px ${HIT_COLORS[j.type]}, 0 0 30px ${HIT_COLORS[j.type]}`, left: `${(LANE_COLS[j.direction] / DIRECTIONS.length) * 100 + 100 / DIRECTIONS.length / 2}%`, bottom: "15%", transform: "translateX(-50%)" }}>{j.type === "perfect" ? t.perfect : j.type === "great" ? t.great : j.type === "good" ? t.good : j.type === "bad" ? t.bad : t.miss}</motion.div>))}</AnimatePresence>
      </div>
      <AnimatePresence>{countdownValue > 0 && (<motion.div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50" exit={{ opacity: 0 }}><motion.div key={countdownValue} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.4 }} className="text-8xl font-black" style={{ color: "oklch(0.72 0.28 330)", textShadow: "0 0 30px oklch(0.72 0.28 330), 0 0 60px oklch(0.72 0.28 330)" }}>{countdownValue}</motion.div></motion.div>)}</AnimatePresence>
      <AnimatePresence>{isPaused && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"><div className="text-6xl font-black tracking-widest mb-8" style={{ color: "oklch(0.72 0.28 330)", textShadow: "0 0 20px oklch(0.72 0.28 330)" }}>{t.paused}</div><div className="flex gap-4"><button onClick={() => { setIsPaused(false); isPausedRef.current = false; }} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-lg" style={{ background: "linear-gradient(135deg, oklch(0.72 0.28 330), oklch(0.7 0.25 195))", color: "oklch(0.08 0.02 280)" }}><Play className="w-5 h-5" /> {t.resume}</button><button onClick={onQuit} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-lg border border-destructive text-destructive hover:bg-destructive/20 transition-colors"><X className="w-5 h-5" /> {t.quit}</button></div></motion.div>)}</AnimatePresence>
    </div>
  );
}
