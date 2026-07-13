import { useState } from "react";
import { type Song, type Difficulty } from "@/lib/songs.ts";
import { type GameStats } from "@/pages/game/page.tsx";
import Home from "@/pages/home/page.tsx";
import SongSelect from "@/pages/song-select/page.tsx";
import GamePlay from "@/pages/game/page.tsx";
import Results from "@/pages/results/page.tsx";

type Screen = "home" | "select" | "game" | "results";

export default function Index() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("normal");
  const [gameStats, setGameStats] = useState<GameStats | null>(null);

  if (screen === "home") {
    return <Home onNavigate={(s) => setScreen(s as Screen)} />;
  }

  if (screen === "select") {
    return (
      <SongSelect
        onBack={() => setScreen("home")}
        onStart={(song, difficulty) => {
          setSelectedSong(song);
          setSelectedDifficulty(difficulty);
          setScreen("game");
        }}
      />
    );
  }

  if (screen === "game" && selectedSong) {
    return (
      <GamePlay
        song={selectedSong}
        difficulty={selectedDifficulty}
        onFinish={(stats) => { setGameStats(stats); setScreen("results"); }}
        onQuit={() => setScreen("select")}
      />
    );
  }

  if (screen === "results" && selectedSong && gameStats) {
    return (
      <Results
        song={selectedSong}
        difficulty={selectedDifficulty}
        stats={gameStats}
        onPlayAgain={() => setScreen("game")}
        onMenu={() => setScreen("home")}
      />
    );
  }

  return null;
}
