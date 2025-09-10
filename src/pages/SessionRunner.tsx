import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { saveSession } from "@/utils/storage";
import { Session } from "@/types";
import { Timer, Activity, Pause, Play, LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";
import { sessionPresets } from "@/data/sessionPresets";
import { showLocalNotification } from "@/utils/notifications";

export default function SessionRunner() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const presetIdParam = params.get("presetId") || "custom";
  const [session, setSession] = useState<Session>(() => ({
    id: Date.now().toString(),
    date: new Date().toISOString(),
    presetId: presetIdParam,
    startTime: new Date().toISOString(),
    status: "active",
    notes: "",
    pressureLogs: [],
    tubeIntervals: [],
    breaks: [],
  }));
  const preset = useMemo(() => sessionPresets.find((p) => p.id === session.presetId), [session.presetId]);
  const [isInTube, setIsInTube] = useState<boolean>(false);
  const [isOnBreak, setIsOnBreak] = useState<boolean>(false);
  const [pressure, setPressure] = useState<number>(-20); // kPa example
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const timerRef = useRef<number | null>(null);
  const lastAlertRef = useRef<number>(0);

  useEffect(() => {
    // start timer
    const start = performance.now();
    const loop = (t: number) => {
      setElapsedMs(t - start);
      timerRef.current = requestAnimationFrame(loop);
    };
    timerRef.current = requestAnimationFrame(loop);
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, []);

  const toggleTube = () => {
    setSession((prev) => {
      const now = new Date().toISOString();
      if (!isInTube) {
        return { ...prev, tubeIntervals: [...(prev.tubeIntervals || []), { start: now }] };
      } else {
        const intervals = [...(prev.tubeIntervals || [])];
        const last = intervals[intervals.length - 1];
        if (last && !last.end) last.end = now;
        return { ...prev, tubeIntervals: intervals };
      }
    });
    setIsInTube((v) => !v);
  };

  const toggleBreak = () => {
    setSession((prev) => {
      const now = new Date().toISOString();
      if (!isOnBreak) {
        return { ...prev, breaks: [...(prev.breaks || []), { start: now }] };
      } else {
        const breaks = [...(prev.breaks || [])];
        const last = breaks[breaks.length - 1];
        if (last && !last.end) last.end = now;
        return { ...prev, breaks };
      }
    });
    setIsOnBreak((v) => !v);
  };

  const logPressure = async () => {
    setSession((prev) => ({
      ...prev,
      pressureLogs: [
        ...(prev.pressureLogs || []),
        { timestamp: new Date().toISOString(), pressure },
      ],
    }));
    // Safety alert: too low pressure (e.g., below -40 kPa) or long continuous tube time (>15min)
    const now = Date.now();
    const tooLow = pressure < -40;
    const longTube = isInTube && (session.tubeIntervals?.length ? (() => {
      const last = session.tubeIntervals![session.tubeIntervals!.length - 1];
      if (!last?.start || last.end) return false;
      return Date.now() - new Date(last.start).getTime() > 15 * 60 * 1000;
    })() : false);
    if ((tooLow || longTube) && now - lastAlertRef.current > 60_000) {
      lastAlertRef.current = now;
      try {
        const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.ready : null;
        await showLocalNotification(reg, tooLow ? 'Safety alert: pressure too low' : 'Safety alert: take a break', {
          body: tooLow ? 'Increase pressure (less vacuum) to a safer level.' : 'You have been in-tube > 15 min. Consider a rest.'
        });
      } catch {}
    }
  };

  const finish = () => {
    const finished: Session = {
      ...session,
      endTime: new Date().toISOString(),
      status: "completed",
    };
    try {
      const prefsRaw = localStorage.getItem('appPreferences');
      const prefs = prefsRaw ? JSON.parse(prefsRaw) : null;
      const incognito = Boolean(prefs?.privacy?.incognito);
      if (!incognito) {
        saveSession(finished);
      }
    } catch {
      saveSession(finished);
    }
  };

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5" /> Session Runner
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Elapsed: <span className="font-semibold">{fmt(elapsedMs)}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {preset && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold mb-1">Preset</div>
                  <div className="text-muted-foreground">{preset.name}</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Target Pressure</div>
                  <div className="text-muted-foreground">Level {preset.pressure}</div>
                </div>
                <div className="col-span-2">
                  <div className="font-semibold mb-1">Rest Periods</div>
                  <div className="text-muted-foreground">{preset.restPeriods.join(", ")} min</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant={isInTube ? "destructive" : "default"}
                onClick={toggleTube}
                className="gap-2"
              >
                {isInTube ? <LogOut className="w-4 h-4" /> : <Activity className="w-4 h-4" />}{" "}
                {isInTube ? "End In-Tube" : "Start In-Tube"}
              </Button>
              <Button
                variant={isOnBreak ? "destructive" : "outline"}
                onClick={toggleBreak}
                className="gap-2"
              >
                {isOnBreak ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}{" "}
                {isOnBreak ? "End Break" : "Start Break"}
              </Button>
            </div>

            <div className="space-y-2">
              <div className="text-sm">
                Pressure: <span className="font-semibold">{pressure} kPa</span>
              </div>
              <Slider
                value={[pressure]}
                min={-50}
                max={0}
                step={1}
                onValueChange={(v) => setPressure(v[0])}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={logPressure}>
                  Log Pressure
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold mb-1">In-Tube Intervals</div>
                <ul className="space-y-1">
                  {(session.tubeIntervals || []).map((iv, idx) => (
                    <li key={idx} className="text-muted-foreground">
                      {new Date(iv.start).toLocaleTimeString()} -{" "}
                      {iv.end ? new Date(iv.end).toLocaleTimeString() : "..."}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-semibold mb-1">Breaks</div>
                <ul className="space-y-1">
                  {(session.breaks || []).map((br, idx) => (
                    <li key={idx} className="text-muted-foreground">
                      {new Date(br.start).toLocaleTimeString()} -{" "}
                      {br.end ? new Date(br.end).toLocaleTimeString() : "..."}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <div className="font-semibold mb-1">Pressure Logs</div>
              <ul className="space-y-1 text-sm">
                {(session.pressureLogs || []).map((pl, idx) => (
                  <li key={idx} className="text-muted-foreground">
                    {new Date(pl.timestamp).toLocaleTimeString()}: {pl.pressure} kPa
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <Button onClick={finish}>Finish Session</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              placeholder="Optional notes"
              value={session.notes || ""}
              onChange={(e) => setSession({ ...session, notes: e.target.value })}
            />
            <div className="text-xs text-muted-foreground">Session data autosaves on finish.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
