// Language context for EN/VI bilingual support
import { createContext, useContext, useState, type ReactNode } from "react";

type Lang = "en" | "vi";

type Translations = {
  title: string; subtitle: string; play: string; leaderboard: string; settings: string;
  selectSong: string; difficulty: string; easy: string; normal: string; hard: string;
  bpm: string; startGame: string; bestScore: string; combo: string; score: string;
  perfect: string; great: string; good: string; bad: string; miss: string;
  results: string; grade: string; maxCombo: string; totalScore: string; calories: string;
  playAgain: string; backToMenu: string; rank: string; player: string;
  useArrowKeys: string; pressToStart: string; paused: string; resume: string; quit: string;
};

const en: Translations = {
  title: "RHYTHM PULSE", subtitle: "Dance to the Beat", play: "Play Now",
  leaderboard: "Leaderboard", settings: "Settings",
  selectSong: "Select Song", difficulty: "Difficulty",
  easy: "Easy", normal: "Normal", hard: "Hard",
  bpm: "BPM", startGame: "Start Game", bestScore: "Best Score",
  combo: "COMBO", score: "SCORE",
  perfect: "PERFECT", great: "GREAT", good: "GOOD", bad: "BAD", miss: "MISS",
  results: "Results", grade: "Grade", maxCombo: "Max Combo",
  totalScore: "Total Score", calories: "Calories (kcal)",
  playAgain: "Play Again", backToMenu: "Back to Menu",
  rank: "Rank", player: "Player",
  useArrowKeys: "Use Arrow Keys and WASD to dance!",
  pressToStart: "Press SPACE or tap to start",
  paused: "PAUSED", resume: "Resume", quit: "Quit",
};

const vi: Translations = {
  title: "RHYTHM PULSE", subtitle: "Nhay Theo Nhip Dieu", play: "Choi Ngay",
  leaderboard: "Bang Xep Hang", settings: "Cai Dat",
  selectSong: "Chon Bai Hat", difficulty: "Do Kho",
  easy: "De", normal: "Binh Thuong", hard: "Kho",
  bpm: "BPM", startGame: "Bat Dau", bestScore: "Diem Cao Nhat",
  combo: "COMBO", score: "DIEM",
  perfect: "HOAN HAO", great: "XUAT SAC", good: "TOT", bad: "KEM", miss: "TRUOT",
  results: "Ket Qua", grade: "Xep Loai", maxCombo: "Combo Cao Nhat",
  totalScore: "Tong Diem", calories: "Calo (kcal)",
  playAgain: "Choi Lai", backToMenu: "Ve Menu",
  rank: "Hang", player: "Nguoi Choi",
  useArrowKeys: "Dung phim mui ten va WASD de nhay!",
  pressToStart: "Nhan SPACE hoac cham de bat dau",
  paused: "TAM DUNG", resume: "Tiep Tuc", quit: "Thoat",
};

type LangContextType = { lang: Lang; setLang: (l: Lang) => void; t: Translations; };

const LangContext = createContext<LangContextType>({ lang: "en", setLang: () => undefined, t: en });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  return (
    <LangContext.Provider value={{ lang, setLang, t: lang === "en" ? en : vi }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
