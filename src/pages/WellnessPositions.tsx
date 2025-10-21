import React, { useEffect, useMemo, useState } from "react";
import { DEFAULT_WELLNESS_POSITIONS } from "@/data/wellnessPositions";
import type { WellnessPosition, PlaySessionRecord, PlayRound } from "@/types/wellness";
import { getPositions, savePositions, getFavoritePositionIds, toggleFavoritePosition, getPlaySessionRecords, savePlaySessionRecord } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import PoseVisual from "@/components/wellness/PoseVisual";
import { Heart, Search, TimerReset, Shuffle, Star, Info } from "lucide-react";

function ensureCatalogSeeded() {
  if (typeof window === "undefined") return;
  const existing = getPositions();
  if (!existing || existing.length === 0) {
    savePositions(DEFAULT_WELLNESS_POSITIONS);
  }
}

export default function WellnessPositions() {
  const [query, setQuery] = useState("");
  const [positions, setPositions] = useState<WellnessPosition[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [rounds, setRounds] = useState<PlayRound[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [useFavsOnly, setUseFavsOnly] = useState(false);

  useEffect(() => {
    ensureCatalogSeeded();
    setPositions(getPositions());
    setFavorites(getFavoritePositionIds());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = useFavsOnly ? positions.filter(p => favorites.includes(p.id)) : positions;
    if (!q) return base;
    return base.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [positions, query, favorites, useFavsOnly]);

  // Random play helpers
  const pool = useMemo(() => (useFavsOnly ? positions.filter(p => favorites.includes(p.id)) : positions), [positions, favorites, useFavsOnly]);

  function pickRandomIndex(exclude?: number): number {
    if (pool.length === 0) return -1;
    if (pool.length === 1) return 0;
    let idx = Math.floor(Math.random() * pool.length);
    if (exclude != null) {
      let guard = 0;
      while (idx === exclude && guard++ < 5) idx = Math.floor(Math.random() * pool.length);
    }
    return idx;
  }

  function randSecondsFor(position: WellnessPosition): number {
    const range = position.recommendedSeconds || [30, 90];
    const [min, max] = range;
    const secs = Math.floor(min + Math.random() * (max - min + 1));
    return Math.max(15, Math.min(300, secs));
  }

  useEffect(() => {
    if (!isPlaying || pool.length === 0) return;
    if (currentIndex < 0) return;
    let interval: number | null = null;
    interval = window.setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          // record round as completed and advance
          const pos = pool[currentIndex];
          setRounds((rs) => {
            const copy = [...rs];
            const r = copy[copy.length - 1];
            if (r && r.positionId === pos.id && !r.completed) r.completed = true;
            return copy;
          });
          // advance
          const nextIndex = pickRandomIndex(currentIndex);
          if (nextIndex >= 0) {
            const nextPos = pool[nextIndex];
            const secs = randSecondsFor(nextPos);
            setCurrentIndex(nextIndex);
            setRounds((rs) => [...rs, { positionId: nextPos.id, seconds: secs, completed: false }]);
            return secs;
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (interval) window.clearInterval(interval); };
  }, [isPlaying, currentIndex, pool]);

  function startPlay() {
    if (pool.length === 0) return;
    const firstIdx = pickRandomIndex();
    if (firstIdx < 0) return;
    const first = pool[firstIdx];
    const secs = randSecondsFor(first);
    setSessionId(typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()));
    setRounds([{ positionId: first.id, seconds: secs, completed: false }]);
    setCurrentIndex(firstIdx);
    setTimer(secs);
    setIsPlaying(true);
  }

  function stopPlay() {
    if (!isPlaying) return;
    setIsPlaying(false);
    // persist record
    const startedAt = new Date(Date.now() - rounds.reduce((a, r) => a + r.seconds, 0) * 1000).toISOString();
    const endedAt = new Date().toISOString();
    const totalSeconds = rounds.reduce((a, r) => a + r.seconds, 0);
    const record: PlaySessionRecord = {
      id: sessionId || (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now())),
      startedAt,
      endedAt,
      totalSeconds,
      rounds: rounds.map(r => ({ ...r, completed: true })),
    };
    savePlaySessionRecord(record);
  }

  function toggleFav(id: string) {
    const arr = toggleFavoritePosition(id);
    setFavorites(arr);
  }

  const records = getPlaySessionRecords();
  const leaderboard = useMemo(() => {
    const byPositions = [...records].sort((a, b) => b.rounds.length - a.rounds.length);
    const byDuration = [...records].sort((a, b) => b.totalSeconds - a.totalSeconds);
    const leastPositions = [...records].sort((a, b) => a.rounds.length - b.rounds.length);
    const shortestDuration = [...records].sort((a, b) => a.totalSeconds - b.totalSeconds);
    return { byPositions, byDuration, leastPositions, shortestDuration };
  }, [records]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end gap-3 justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wellness Positions</h1>
          <p className="text-sm text-muted-foreground">Informational guide for couples: names, how‑to, safety, and abstract visuals. Favorite items, play a randomizer with timers, and track session records.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={isPlaying ? "destructive" : "default"} onClick={isPlaying ? stopPlay : startPlay}>
            {isPlaying ? <TimerReset className="w-4 h-4 mr-2" /> : <Shuffle className="w-4 h-4 mr-2" />} {isPlaying ? "Stop" : "Play Random"}
          </Button>
          <Button variant={useFavsOnly ? "secondary" : "outline"} onClick={() => setUseFavsOnly(v => !v)}>
            <Star className="w-4 h-4 mr-2" /> {useFavsOnly ? "Using Favorites" : "Use Favorites"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, tag, or summary" className="pl-9" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
      </div>

      {/* Timer banner */}
      {isPlaying && pool[currentIndex] && (
        <div className="gradient-card rounded-xl border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TimerReset className="w-5 h-5" />
            <div>
              <div className="text-sm text-muted-foreground">Current</div>
              <div className="font-semibold">{pool[currentIndex].name}</div>
            </div>
          </div>
          <div className="text-3xl tabular-nums font-bold">{timer}s</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const fav = favorites.includes(p.id);
          return (
            <Card key={p.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{p.name}</CardTitle>
                  <button aria-label={fav ? "Remove favorite" : "Add favorite"} className={`p-2 rounded-md ${fav ? "text-yellow-400" : "text-muted-foreground hover:text-foreground"}`} onClick={() => toggleFav(p.id)}>
                    <Heart className="w-4 h-4" fill={fav ? "currentColor" : "none"} />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">{p.summary}</p>
              </CardHeader>
              <CardContent>
                <PoseVisual visualKey={p.visualKey} className="w-full h-28" />
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                  <Badge variant="outline" className="text-[10px] capitalize">{p.difficulty}</Badge>
                </div>
                <Separator className="my-3" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium"><Info className="w-4 h-4" /> How to</div>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                    {p.howTo.map((s, i) => <li key={i}>{s}</li>)}
                  </ol>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Suggested {p.recommendedSeconds ? `${p.recommendedSeconds[0]}–${p.recommendedSeconds[1]}` : "30–90"}s
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Leaderboards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Records</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="gradient-card rounded-xl p-4">
            <div className="font-semibold mb-2">Most Positions in a Session</div>
            <ul className="text-sm space-y-1">
              {leaderboard.byPositions.slice(0, 5).map((r) => (
                <li key={r.id} className="flex justify-between">
                  <span>{new Date(r.startedAt).toLocaleString()}</span>
                  <span className="font-mono">{r.rounds.length}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="gradient-card rounded-xl p-4">
            <div className="font-semibold mb-2">Longest Total Time</div>
            <ul className="text-sm space-y-1">
              {leaderboard.byDuration.slice(0, 5).map((r) => (
                <li key={r.id} className="flex justify-between">
                  <span>{new Date(r.startedAt).toLocaleString()}</span>
                  <span className="font-mono">{Math.round(r.totalSeconds)}s</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="gradient-card rounded-xl p-4">
            <div className="font-semibold mb-2">Fewest Positions (Opposite)</div>
            <ul className="text-sm space-y-1">
              {leaderboard.leastPositions.slice(0, 5).map((r) => (
                <li key={r.id} className="flex justify-between">
                  <span>{new Date(r.startedAt).toLocaleString()}</span>
                  <span className="font-mono">{r.rounds.length}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="gradient-card rounded-xl p-4">
            <div className="font-semibold mb-2">Shortest Total Time (Opposite)</div>
            <ul className="text-sm space-y-1">
              {leaderboard.shortestDuration.slice(0, 5).map((r) => (
                <li key={r.id} className="flex justify-between">
                  <span>{new Date(r.startedAt).toLocaleString()}</span>
                  <span className="font-mono">{Math.round(r.totalSeconds)}s</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
