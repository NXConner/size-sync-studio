import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, Activity, BarChart3 } from "lucide-react";

export default function Analytics() {
  return (
    <div className="container mx-auto px-4 py-6 min-h-screen animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-6">
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
                <div className="text-2xl font-bold text-primary">+15.3%</div>
                <div className="text-xs text-success">Improvement this month</div>
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
                <div className="text-2xl font-bold text-accent">94.7%</div>
                <div className="text-xs text-success">Excellent precision</div>
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
                <div className="text-2xl font-bold text-secondary">Optimal</div>
                <div className="text-xs text-muted-foreground">Based on health screening</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Coming Soon: Advanced Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">🤖 AI Health Assistant</h3>
                <p className="text-sm text-muted-foreground">
                  Personalized recommendations based on measurement history and health data
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-accent">📊 Predictive Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  ML-powered trend predictions and goal achievement forecasting
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-secondary">🔗 Wearable Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Sync with Apple Health, Google Fit, and smart devices
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-warning">⚡ Real-time Collaboration</h3>
                <p className="text-sm text-muted-foreground">
                  Share progress with healthcare providers and coaches
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}