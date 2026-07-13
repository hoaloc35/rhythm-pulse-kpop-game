import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useLang } from "@/lib/lang.tsx";
import { type Song, type Difficulty } from "@/lib/songs.ts";
import { type GameStats, getGrade } from "@/pages/game/page.tsx";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import CyberBackground, { NeonText } from "@/components/cyber-bg.tsx";
import { Trophy, RotateCcw, Home } from "lucide-react";

type Props = { song: Song; difficulty: Difficulty; stats: GameStats; onPlayAgain: () => void; onMenu: () => void; };

const GRADE_COLORS: Record<string, string> = {
  S: "oklch(0.8 0.2 85)", A: "oklch(0.65 0.28 145)", B: "oklch(0.7 0.25 195)",
  C: "oklch(0.72 0.28 330)", D: "oklch(0.65 0.25 25)", F: "oklch(0.5 0.15 25)",
};

type LeaderboardEntry = { _id: string; score: number; grade: string; perfect: number; userName: string; };

function Leaderboard({ songId, difficulty }: { songId: string; difficulty: string }) {
  const { t } = useLang();
  const board = useQuery(api.scores.getLeaderboard, { songId, difficulty });
  if (!board || board.length === 0) return null;
  return (
    <div className="mt-4">
      <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1"><Trophy className="w-3 h-3" /> {t.leaderboard}</div>
      <div className="space-y-1">
        {(board as LeaderboardEntry[]).slice(0, 5).map((entry, i) => (
          <div key={entry._id} className="flex items-center gap-2 text-sm py-1 px-2 rounded" style={{ background: i === 0 ? "oklch(0.8 0.2 85 / 0.1)" : "oklch(0.15 0.03 265 / 0.5)" }}>
            <span className="w-5 text-center font-bold" style={{ color: i === 0 ? "oklch(0.8 0.2 85)" : "oklch(0.65 0.05 200)" }}>#{i + 1}</span>
            <span className="flex-1 text-foreground/80 truncate">{entry.userName}</span>
            <span className="font-bold" style={{ color: GRADE_COLORS[entry.grade] ?? "white" }}>{entry.grade}</span>
            <span className="text-muted-foreground tabular-nums">{entry.score.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsContent({ song, difficulty, stats, onPlayAgain, onMenu }: Props) {
  const { t } = useLang();
  const submitScore = useMutation(api.scores.submitScore);
  const submittedRef = useRef(false);
  const grade = getGrade(stats.score, song.difficulties[difficulty].notes.length);
  const calories = Math.round((stats.perfect * 5 + stats.great * 3 + stats.good * 2) / 100);

  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    submitScore({ songId: song.id, score: stats.score, grade, perfect: stats.perfect, great: stats.great, good: stats.good, bad: stats.bad, miss: stats.miss, maxCombo: stats.maxCombo, difficulty, calories }).catch(() => undefined);
  }, []);

  const statRows = [
    { label: t.perfect, value: stats.perfect, color: "#ffd700" },
    { label: t.great, value: stats.great, color: "#00e5ff" },
    { label: t.good, value: stats.good, color: "#00ff88" },
    { label: t.bad, value: stats.bad, color: "#ff8800" },
    { label: t.miss, value: stats.miss, color: "#ff3355" },
    { label: t.maxCombo, value: stats.maxCombo, color: "oklch(0.72 0.28 330)" },
    { label: t.totalScore, value: stats.score.toLocaleString(), color: "white" },
    { label: t.calories, value: `${calories} kcal`, color: "oklch(0.65 0.28 145)" },
  ];

  return (
    <div className="relative z-10 w-full max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <NeonText className="text-2xl font-black tracking-wide">{song.title}</NeonText>
        <div className="text-muted-foreground text-sm">{song.artist} - {difficulty.toUpperCase()}</div>
      </div>
      <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", duration: 0.8, bounce: 0.4 }} className="flex justify-center mb-6">
        <div className="w-32 h-32 rounded-full flex items-center justify-center text-7xl font-black border-4" style={{ color: GRADE_COLORS[grade] ?? "white", borderColor: GRADE_COLORS[grade] ?? "white", textShadow: `0 0 20px ${GRADE_COLORS[grade] ?? "white"}` }}>{grade}</div>
      </motion.div>
      <div className="rounded-2xl border border-border p-4 space-y-2 mb-4" style={{ background: "oklch(0.12 0.03 270 / 0.8)", backdropFilter: "blur(10px)" }}>
        {statRows.map((row, i) => (
          <motion.div key={row.label} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 + 0.3 }} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
            <span className="text-muted-foreground text-sm">{row.label}</span>
            <span className="font-bold tabular-nums" style={{ color: row.color }}>{row.value}</span>
          </motion.div>
        ))}
      </div>
      <div className="rounded-2xl border border-border p-4 mb-6" style={{ background: "oklch(0.12 0.03 270 / 0.8)", backdropFilter: "blur(10px)" }}>
        <Leaderboard songId={song.id} difficulty={difficulty} />
      </div>
      <div className="flex gap-3">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onPlayAgain} className="flex-1 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, oklch(0.72 0.28 330), oklch(0.7 0.25 195))", color: "oklch(0.08 0.02 280)", boxShadow: "0 0 20px oklch(0.72 0.28 330 / 0.5)" }}><RotateCcw className="w-5 h-5" /> {t.playAgain}</motion.button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onMenu} className="flex-1 py-4 rounded-xl font-black text-lg border border-primary/50 text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"><Home className="w-5 h-5" /> {t.backToMenu}</motion.button>
      </div>
    </div>
  );
}

export default function Results(props: Props) {
  const { t } = useLang();
  return (
    <div className="relative min-h-screen overflow-y-auto">
      <CyberBackground />
      <div className="relative z-10 text-center pt-8">
        <NeonText color="accent" className="text-3xl font-black tracking-widest uppercase">{t.results}</NeonText>
      </div>
      <ResultsContent {...props} />
    </div>
  );
}
