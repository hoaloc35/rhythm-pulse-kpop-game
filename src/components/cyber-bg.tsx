import { motion } from "motion/react";
import { useLang } from "@/lib/lang.tsx";

export default function CyberBackground() {
  const particles = Array.from({ length: 20 }, (_, i) => i);
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(oklch(0.7 0.25 195 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.25 195 / 0.3) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 opacity-20" style={{ backgroundImage: "linear-gradient(oklch(0.72 0.28 330 / 0.6) 1px, transparent 1px), linear-gradient(90deg, oklch(0.72 0.28 330 / 0.6) 1px, transparent 1px)", backgroundSize: "80px 40px", transform: "perspective(300px) rotateX(60deg)", transformOrigin: "bottom" }} />
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${(i * 5.3) % 100}%`,
            top: `${(i * 7.7) % 100}%`,
            background: i % 3 === 0 ? "oklch(0.72 0.28 330)" : i % 3 === 1 ? "oklch(0.7 0.25 195)" : "oklch(0.75 0.22 270)",
            boxShadow: `0 0 6px 2px ${i % 3 === 0 ? "oklch(0.72 0.28 330 / 0.8)" : i % 3 === 1 ? "oklch(0.7 0.25 195 / 0.8)" : "oklch(0.75 0.22 270 / 0.8)"}`,
          }}
          animate={{ y: [0, -30, 0], opacity: [0.3, 1, 0.3], scale: [1, 1.5, 1] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
        />
      ))}
      <div className="absolute top-0 left-0 right-0 h-40" style={{ background: "linear-gradient(to bottom, oklch(0.72 0.28 330 / 0.15), transparent)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-40" style={{ background: "linear-gradient(to top, oklch(0.7 0.25 195 / 0.15), transparent)" }} />
    </div>
  );
}

export function NeonText({ children, color = "primary", className = "" }: { children: React.ReactNode; color?: "primary" | "accent"; className?: string; }) {
  const neonColor = color === "primary" ? "oklch(0.72 0.28 330)" : "oklch(0.7 0.25 195)";
  return (
    <span className={className} style={{ color: neonColor, textShadow: `0 0 10px ${neonColor}, 0 0 20px ${neonColor}, 0 0 40px ${neonColor}` }}>
      {children}
    </span>
  );
}

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "vi" : "en")}
      className="px-3 py-1 rounded border border-primary/50 text-primary text-sm font-bold hover:bg-primary/20 transition-colors"
      style={{ textShadow: "0 0 8px oklch(0.72 0.28 330)", boxShadow: "0 0 8px oklch(0.72 0.28 330 / 0.3)" }}
    >
      {lang === "en" ? "VI" : "EN"}
    </button>
  );
}
