// Song data with YouTube video IDs and note charts
export type Difficulty = "easy" | "normal" | "hard";

export type NoteDirection = "left" | "down" | "up" | "right" | "upleft" | "upright";

export type Note = {
  id: number;
  direction: NoteDirection;
  time: number;
  hit?: "perfect" | "great" | "good" | "bad" | "miss";
};

export type Song = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  youtubeId: string;
  coverUrl: string;
  difficulties: Record<Difficulty, { level: number; notes: Note[] }>;
};

function generateNotes(bpm: number, difficulty: Difficulty, durationSeconds = 90, seed0 = 0): Note[] {
  const msPerBeat = 1000 / (bpm / 60);
  const directions: NoteDirection[] = ["left", "down", "up", "right", "upleft", "upright"];
  const notes: Note[] = [];
  let id = 0;
  const densityMap: Record<Difficulty, number> = { easy: 2, normal: 1, hard: 0.5 };
  const stepMs = msPerBeat * densityMap[difficulty];
  const startMs = 3000;
  const endMs = durationSeconds * 1000;
  let seed = bpm * (difficulty === "easy" ? 1 : difficulty === "normal" ? 2 : 3) + seed0;
  const rng = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let t = startMs; t < endMs; t += stepMs) {
    const jitter = (rng() - 0.5) * stepMs * 0.2;
    const time = Math.round(t + jitter);
    const dir = directions[Math.floor(rng() * directions.length)];
    if (difficulty === "easy" && rng() < 0.3) continue;
    if (difficulty === "normal" && rng() < 0.1) continue;
    notes.push({ id: id++, direction: dir, time });
  }
  return notes;
}

function makeDiffs(bpm: number, levels: [number, number, number], seedOff = 0) {
  return {
    easy:   { level: levels[0], notes: generateNotes(bpm, "easy",   90, seedOff) },
    normal: { level: levels[1], notes: generateNotes(bpm, "normal", 90, seedOff) },
    hard:   { level: levels[2], notes: generateNotes(bpm, "hard",   90, seedOff) },
  };
}

const COVER_A = "https://hercules-cdn.com/file_03QSaFuPF3fPoTH82Ib69Zxv";
const COVER_B = "https://hercules-cdn.com/file_wG2OcwNrpn1vOk00QZyctQGc";

export const SONGS: Song[] = [
  { id: "blackpink-boombayah", title: "BOOMBAYAH", artist: "BLACKPINK", genre: "K-Pop", bpm: 125, youtubeId: "bwmSjveL3Lc", coverUrl: COVER_A, difficulties: makeDiffs(125, [2, 4, 7], 1) },
  { id: "blackpink-ddu", title: "DDU-DU DDU-DU", artist: "BLACKPINK", genre: "K-Pop", bpm: 126, youtubeId: "IHNzOHi8sJs", coverUrl: COVER_B, difficulties: makeDiffs(126, [2, 5, 8], 2) },
  { id: "blackpink-lovesick", title: "Lovesick Girls", artist: "BLACKPINK", genre: "K-Pop", bpm: 100, youtubeId: "dyRsQFBH0GE", coverUrl: COVER_A, difficulties: makeDiffs(100, [2, 4, 7], 3) },
  { id: "blackpink-pink-venom", title: "Pink Venom", artist: "BLACKPINK", genre: "K-Pop", bpm: 132, youtubeId: "tyR2JkTiMOE", coverUrl: COVER_B, difficulties: makeDiffs(132, [3, 6, 9], 4) },
  { id: "bts-dynamite", title: "Dynamite", artist: "BTS", genre: "K-Pop", bpm: 114, youtubeId: "gdZLi9oWNZg", coverUrl: COVER_B, difficulties: makeDiffs(114, [1, 4, 6], 5) },
  { id: "bts-butter", title: "Butter", artist: "BTS", genre: "K-Pop", bpm: 110, youtubeId: "WMweEpGlu_U", coverUrl: COVER_A, difficulties: makeDiffs(110, [1, 3, 6], 6) },
  { id: "bts-fake-love", title: "FAKE LOVE", artist: "BTS", genre: "K-Pop", bpm: 130, youtubeId: "7C2z4GqqS5E", coverUrl: COVER_B, difficulties: makeDiffs(130, [2, 5, 8], 7) },
  { id: "bts-boy-with-luv", title: "Boy With Luv", artist: "BTS ft. Halsey", genre: "K-Pop", bpm: 194, youtubeId: "XsX3ATc3FbA", coverUrl: COVER_A, difficulties: makeDiffs(194, [3, 6, 9], 8) },
  { id: "twice-fancy", title: "FANCY", artist: "TWICE", genre: "K-Pop", bpm: 116, youtubeId: "kOHB85vDuow", coverUrl: COVER_A, difficulties: makeDiffs(116, [2, 5, 8], 9) },
  { id: "twice-cheer-up", title: "CHEER UP", artist: "TWICE", genre: "K-Pop", bpm: 128, youtubeId: "c9RIlPsM9gg", coverUrl: COVER_B, difficulties: makeDiffs(128, [2, 4, 7], 10) },
  { id: "twice-feel-special", title: "Feel Special", artist: "TWICE", genre: "K-Pop", bpm: 96, youtubeId: "3ymwOvzhwHs", coverUrl: COVER_A, difficulties: makeDiffs(96, [1, 3, 6], 11) },
  { id: "aespa-next-level", title: "Next Level", artist: "aespa", genre: "K-Pop", bpm: 106, youtubeId: "4TWR90KJl84", coverUrl: COVER_B, difficulties: makeDiffs(106, [3, 6, 9], 12) },
  { id: "aespa-savage", title: "Savage", artist: "aespa", genre: "K-Pop", bpm: 137, youtubeId: "iCV_MABS1p8", coverUrl: COVER_A, difficulties: makeDiffs(137, [3, 7, 10], 13) },
  { id: "aespa-spicy", title: "Spicy", artist: "aespa", genre: "K-Pop", bpm: 132, youtubeId: "lAg_J8k1Shw", coverUrl: COVER_B, difficulties: makeDiffs(132, [2, 6, 8], 14) },
  { id: "newjeans-hype-boy", title: "Hype Boy", artist: "NewJeans", genre: "K-Pop", bpm: 132, youtubeId: "H3eLKRqSPBY", coverUrl: COVER_A, difficulties: makeDiffs(132, [2, 5, 9], 15) },
  { id: "newjeans-omg", title: "OMG", artist: "NewJeans", genre: "K-Pop", bpm: 120, youtubeId: "e9ANDZXkVAw", coverUrl: COVER_B, difficulties: makeDiffs(120, [2, 4, 7], 16) },
  { id: "newjeans-super-shy", title: "Super Shy", artist: "NewJeans", genre: "K-Pop", bpm: 110, youtubeId: "ArmDp-zijuc", coverUrl: COVER_A, difficulties: makeDiffs(110, [1, 4, 6], 17) },
  { id: "itzy-dalla-dalla", title: "DALLA DALLA", artist: "ITZY", genre: "K-Pop", bpm: 130, youtubeId: "pCHtJM9nzgI", coverUrl: COVER_B, difficulties: makeDiffs(130, [2, 5, 8], 18) },
  { id: "itzy-loco", title: "LOCO", artist: "ITZY", genre: "K-Pop", bpm: 120, youtubeId: "Nf7lMzGMB44", coverUrl: COVER_A, difficulties: makeDiffs(120, [2, 5, 7], 19) },
  { id: "ive-eleven", title: "ELEVEN", artist: "IVE", genre: "K-Pop", bpm: 116, youtubeId: "Ky9jBEMXzpY", coverUrl: COVER_B, difficulties: makeDiffs(116, [2, 4, 7], 20) },
  { id: "ive-love-dive", title: "LOVE DIVE", artist: "IVE", genre: "K-Pop", bpm: 120, youtubeId: "YMMEH2vz5sg", coverUrl: COVER_A, difficulties: makeDiffs(120, [2, 5, 8], 21) },
  { id: "ive-after-like", title: "After LIKE", artist: "IVE", genre: "K-Pop", bpm: 117, youtubeId: "f5IWH0bFNGQ", coverUrl: COVER_B, difficulties: makeDiffs(117, [3, 6, 9], 22) },
  { id: "gidle-tomboy", title: "TOMBOY", artist: "(G)I-DLE", genre: "K-Pop", bpm: 94, youtubeId: "dFBLn4dFCaY", coverUrl: COVER_A, difficulties: makeDiffs(94, [2, 4, 7], 23) },
  { id: "gidle-queencard", title: "Queencard", artist: "(G)I-DLE", genre: "K-Pop", bpm: 100, youtubeId: "WrP4Xqd7za0", coverUrl: COVER_B, difficulties: makeDiffs(100, [2, 5, 7], 24) },
  { id: "stayc-so-bad", title: "SO BAD", artist: "STAYC", genre: "K-Pop", bpm: 120, youtubeId: "MKi43PJUsQk", coverUrl: COVER_A, difficulties: makeDiffs(120, [1, 3, 6], 25) },
  { id: "lesserafim-antifragile", title: "ANTIFRAGILE", artist: "LE SSERAFIM", genre: "K-Pop", bpm: 118, youtubeId: "PvSj-bXJmZY", coverUrl: COVER_B, difficulties: makeDiffs(118, [3, 6, 9], 26) },
  { id: "lesserafim-unforgiven", title: "UNFORGIVEN", artist: "LE SSERAFIM", genre: "K-Pop", bpm: 130, youtubeId: "v8gNSlhxSNQ", coverUrl: COVER_A, difficulties: makeDiffs(130, [3, 6, 8], 27) },
  { id: "redvelvet-psycho", title: "Psycho", artist: "Red Velvet", genre: "K-Pop", bpm: 127, youtubeId: "uR8Mrt1IpXg", coverUrl: COVER_B, difficulties: makeDiffs(127, [2, 5, 8], 28) },
  { id: "redvelvet-bad-boy", title: "Bad Boy", artist: "Red Velvet", genre: "K-Pop", bpm: 104, youtubeId: "J2EcVGmh3qY", coverUrl: COVER_A, difficulties: makeDiffs(104, [2, 4, 7], 29) },
  { id: "exo-growl", title: "Growl", artist: "EXO", genre: "K-Pop", bpm: 132, youtubeId: "mPnQPWpRbIA", coverUrl: COVER_B, difficulties: makeDiffs(132, [2, 5, 8], 30) },
];
