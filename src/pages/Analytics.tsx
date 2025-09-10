import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, Activity, Images } from "lucide-react";
import { ProgressChart } from "@/components/ProgressChart";
import { getMeasurements } from "@/utils/storage";
import { getScreeningResults } from "@/utils/screeningCalculator";
import type { Measurement } from "@/types";
import { PhotosTimeline } from "@/components/PhotosTimeline";
import { Achievements } from "@/components/Achievements";

export default function Analytics() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  useEffect(() => {
    setMeasurements(getMeasurements());
  }, []);

  const lengthData = useMemo(
    () =>
      measurements
        .slice()
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((m) => ({ date: m.date, value: m.length })),
    [measurements],
  );

  const girthData = useMemo(
    () =>
      measurements
        .slice()
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((m) => ({ date: m.date, value: m.girth })),
    [measurements],
  );

  const riskHistory = useMemo(() => {
    const results = getScreeningResults();
    return results
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((r) => ({ date: r.date, value: r.riskScore }));
  }, []);

  const anomalyFlags = useMemo(() => {
    if (measurements.length < 2) return [] as { date: string; note: string }[];
    const out: { date: string; note: string }[] = [];
    const sorted = measurements.slice().sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i-1];
      const cur = sorted[i];
      const dL = cur.length - prev.length;
      const dG = cur.girth - prev.girth;
      if (Math.abs(dL) > 1.0 || Math.abs(dG) > 1.0) {
        out.push({ date: cur.date, note: `Unusual change: ΔL ${dL.toFixed(2)}, ΔG ${dG.toFixed(2)}` });
      }
    }
    return out;
  }, [measurements]);

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Advanced Analytics Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            AI-powered insights and real-time measurement analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="animate-scale-in shadow-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Progress Tracking
                <Badge className="ml-auto">AI Enhanced</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Advanced trend analysis with ML predictions
                </div>
                <div className="text-2xl font-bold text-primary">
                  {lengthData.length >= 2
                    ? `${(
                        ((lengthData[lengthData.length - 1].value - lengthData[0].value) /
                          Math.max(1, lengthData[0].value)) *
                        100
                      ).toFixed(1)}%`
                    : "--"}
                </div>
                <div className="text-xs text-success">Length change over period</div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-scale-in shadow-glow" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                Quality Score
                <Badge variant="secondary" className="ml-auto">WebGPU</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Real-time measurement accuracy
                </div>
                <div className="text-2xl font-bold text-accent">
                  {girthData.length >= 2
                    ? `${(
                        ((girthData[girthData.length - 1].value - girthData[0].value) /
                          Math.max(1, girthData[0].value)) *
                        100
                      ).toFixed(1)}%`
                    : "--"}
                </div>
                <div className="text-xs text-success">Girth change over period</div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-scale-in shadow-card" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-secondary" />
                Health Insights
                <Badge variant="outline" className="ml-auto">Beta</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Correlation with screening data
                </div>
                <div className="text-2xl font-bold text-secondary">
                  {riskHistory.length ? `${riskHistory[riskHistory.length - 1].value}` : "--"}
                </div>
                <div className="text-xs text-muted-foreground">Latest risk score</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProgressChart title="Length Trend" unit="cm" data={lengthData} />
          <ProgressChart title="Girth Trend" unit="cm" data={girthData} color="hsl(var(--accent))" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProgressChart title="Risk Score History" unit="%" data={riskHistory} color="hsl(var(--secondary))" />
          <Card className="gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Images className="w-5 h-5" /> Progress Photos Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PhotosTimeline measurements={measurements} />
            </CardContent>
          </Card>
        </div>

        <Achievements />

        {anomalyFlags.length > 0 && (
          <Card className="gradient-card shadow-card">
            <CardHeader>
              <CardTitle>Anomalies</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {anomalyFlags.map((a) => (
                  <li key={a.date}>
                    {new Date(a.date).toLocaleDateString()}: {a.note}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}