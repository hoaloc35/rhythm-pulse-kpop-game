import { motion } from "motion/react";
import { useLang } from "@/lib/lang.tsx";
import CyberBackground, { NeonText, LangToggle } from "@/components/cyber-bg.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useAuth } from "@/hooks/use-auth.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Play, Trophy, Music, Zap, Star } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";

type Props = { onNavigate: (screen: string) => void; };

function TopPlayers() {
  const { t } = useLang();
  const players = useQuery(api.users.getTopPlayers);
  if (!players || players.length === 0) return null;
  return (
    <div className="rounded-2xl border border-border p-4 max-w-xs w-full" style={{ background: "oklch(0.12 0.03 270 / 0.8)", backdropFilter: "blur(10px)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold text-primary uppercase tracking-wider">{t.leaderboard}</span>
      </div>
      {players.slice(0, 5).map((p, i) => (
        <div key={p._id} className="flex items-center gap-2 py-1 text-sm border-b border-border/30 last:border-0">
          <span className="w-5 text-center font-bold text-muted-foreground">#{i + 1}</span>
          <span className="flex-1 truncate text-foreground/80">{p.name ?? "Player"}</span>
          <span className="text-primary font-bold tabular-nums">{(p.totalScore ?? 0).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function HomeContent({ onNavigate }: Props) {
  const { t } = useLang();
  const { user } = useAuth();
  const features = [
    { icon: Music, label: "30 Songs" },
    { icon: Zap, label: "3 Difficulties" },
    { icon: Star, label: "Grade System" },
    { icon: Trophy, label: "Leaderboard" },
  ];
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <CyberBackground />
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
        <div className="text-xs text-muted-foreground">RHYTHM PULSE v1.0</div>
        <div className="flex items-center gap-3">
          <LangToggle />
          <Unauthenticated><SignInButton /></Unauthenticated>
          <AuthLoading><Skeleton className="h-8 w-20" /></AuthLoading>
          <Authenticated><div className="text-sm text-muted-foreground">{user?.profile.name ?? "Player"}</div></Authenticated>
        </div>
      </div>
      <div className="relative z-10 text-center space-y-8 px-4">
        <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" as const }}>
          <NeonText className="block text-5xl md:text-7xl font-black tracking-widest uppercase">{t.title}</NeonText>
          <NeonText color="accent" className="block text-lg md:text-2xl font-bold tracking-[0.3em] uppercase mt-2">{t.subtitle}</NeonText>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }} className="flex flex-wrap justify-center gap-3">
          {features.map((f, i) => (
            <motion.div key={f.label} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + i * 0.1, type: "spring" as const }} className="flex items-center gap-2 px-3 py-2 rounded-full border border-accent/40 text-accent text-sm font-bold" style={{ background: "oklch(0.7 0.25 195 / 0.1)" }}>
              <f.icon className="w-4 h-4" />
              <span>{f.label}</span>
            </motion.div>
          ))}
        </motion.div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, type: "spring" as const, bounce: 0.4 }}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onNavigate("select")} className="relative px-16 py-6 text-2xl font-black tracking-widest uppercase rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, oklch(0.72 0.28 330), oklch(0.7 0.25 195))", boxShadow: "0 0 30px oklch(0.72 0.28 330 / 0.7), 0 0 60px oklch(0.7 0.25 195 / 0.4)", color: "oklch(0.08 0.02 280)" }}>
            <span className="relative z-10 flex items-center gap-3"><Play className="w-7 h-7" />{t.play}</span>
          </motion.button>
        </motion.div>
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="flex justify-center">
          <Authenticated><TopPlayers /></Authenticated>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="text-xs text-muted-foreground/70 max-w-sm mx-auto">
          Arrow Keys + WASD + Q/E
        </motion.div>
      </div>
    </div>
  );
}

export default function Home({ onNavigate }: Props) {
  return <HomeContent onNavigate={onNavigate} />;
}
