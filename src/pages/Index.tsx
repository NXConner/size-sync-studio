import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Shield, Lightbulb, Camera, Play } from "lucide-react";
import { getMeasurements, getSessions, getGoals } from "@/utils/storage";
import { Measurement, Session, Goal } from "@/types";

const Index = () => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMeasurements(getMeasurements());
    setSessions(getSessions());
    setGoals(getGoals());
  };

  const recentMeasurements = [...measurements]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const activeGoals = goals.filter(g => g.isActive).slice(0, 2);

  const quickStats = {
    totalSessions: sessions.length,
    thisWeek: sessions.filter(s => {
      const sessionDate = new Date(s.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    }).length,
    totalMeasurements: measurements.length,
    bestLength: measurements.length > 0 ? 
      Math.max(...measurements.map(m => m.length)) : 0,
    bestGirth: measurements.length > 0 ? 
      Math.max(...measurements.map(m => m.girth)) : 0
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="relative container mx-auto px-4 py-20 text-center">
          <Badge 
            variant="secondary" 
            className="mb-6 bg-primary/20 text-primary border-primary/30 backdrop-blur-sm animate-float"
          >
            Professional Enhancement Tracking
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            Size Seeker
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Dashboard</span>
          </h1>
          
          <p className="text-lg md:text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
            Guided sessions, safety protocols, and precise measurement tracking — all in one dark, neon-themed experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/sessions">
              <Button size="lg" className="gradient-primary hover:shadow-primary shadow-lg">
                <Play className="w-5 h-5 mr-2" />
                Start Session
              </Button>
            </Link>
            <Link to="/safety">
              <Button variant="outline" size="lg" className="border-border">
                <Shield className="w-5 h-5 mr-2" />
                Safety Guide
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to="/sessions" className="gradient-card p-4 rounded-xl border border-border/20 hover:shadow-card transition">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-primary" />
              <div>
                <div className="font-semibold">Sessions</div>
                <div className="text-xs text-muted-foreground">Start training</div>
              </div>
            </div>
          </Link>
          <Link to="/safety" className="gradient-card p-4 rounded-xl border border-border/20 hover:shadow-card transition">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-secondary" />
              <div>
                <div className="font-semibold">Safety</div>
                <div className="text-xs text-muted-foreground">Guidelines</div>
              </div>
            </div>
          </Link>
          <Link to="/tips" className="gradient-card p-4 rounded-xl border border-border/20 hover:shadow-card transition">
            <div className="flex items-center space-x-3">
              <Lightbulb className="w-5 h-5 text-accent" />
              <div>
                <div className="font-semibold">Tips</div>
                <div className="text-xs text-muted-foreground">Expert advice</div>
              </div>
            </div>
          </Link>
          <Link to="/gallery" className="gradient-card p-4 rounded-xl border border-border/20 hover:shadow-card transition">
            <div className="flex items-center space-x-3">
              <Camera className="w-5 h-5 text-purple-400" />
              <div>
                <div className="font-semibold">Gallery</div>
                <div className="text-xs text-muted-foreground">Progress pics</div>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="gradient-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Quick Stats</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="text-2xl font-bold text-primary">{quickStats.totalSessions}</div>
                  <div className="text-xs text-muted-foreground">Total Sessions</div>
                </div>
                <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                  <div className="text-2xl font-bold text-secondary">{quickStats.thisWeek}</div>
                  <div className="text-xs text-muted-foreground">This Week</div>
                </div>
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="text-2xl font-bold text-accent">{quickStats.bestLength.toFixed(1)}"</div>
                  <div className="text-xs text-muted-foreground">Best Length</div>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-400">{quickStats.bestGirth.toFixed(1)}"</div>
                  <div className="text-xs text-muted-foreground">Best Girth</div>
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="gradient-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recent Sessions</h2>
                <Link to="/sessions" className="text-xs text-muted-foreground hover:text-foreground">View All</Link>
              </div>
              {recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="p-3 rounded-lg bg-muted/20 border border-border/20 flex items-center justify-between">
                      <div className="text-sm">
                        <div className="font-medium">{new Date(session.date).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">{session.status === 'completed' ? 'Completed' : 'In Progress'}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">{session.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground">No sessions yet</div>
              )}
            </div>
          </div>

          {/* Right Column - Recent Measurements & Goals */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Measurements */}
            <div className="gradient-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recent Measurements</h2>
                <Link to="/gallery" className="text-xs text-muted-foreground hover:text-foreground">View All</Link>
              </div>
              {recentMeasurements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentMeasurements.map((measurement) => (
                    <div key={measurement.id} className="p-4 rounded-lg bg-muted/20 border border-border/20">
                      <div className="text-sm font-medium mb-1">{new Date(measurement.date).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">Length: {measurement.length}"</div>
                      <div className="text-xs text-muted-foreground">Girth: {measurement.girth}"</div>
                      {measurement.notes && (
                        <div className="mt-2 text-xs italic text-muted-foreground">"{measurement.notes}"</div>
                      )}
                      {measurement.sessionId && (
                        <Badge variant="secondary" className="mt-2 text-[10px]">Session</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground">No measurements yet</div>
              )}
            </div>

            {/* Active Goals */}
            {activeGoals.length > 0 && (
              <div className="gradient-card rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Active Goals</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeGoals.map((goal) => (
                    <div key={goal.id} className="p-4 rounded-lg bg-muted/20 border border-border/20">
                      <div className="text-sm font-medium mb-1 capitalize">{goal.type} Goal</div>
                      <div className="text-xs text-muted-foreground">Current: {goal.current}" → Target: {goal.target}"</div>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">
                          {Math.round((goal.current / goal.target) * 100)}%
                        </Badge>
                        <div className="text-[10px] text-muted-foreground">{(goal.target - goal.current).toFixed(1)}" to go</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
