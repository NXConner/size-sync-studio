import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Target, Maximize, Zap, Calendar, TrendingUp } from "lucide-react";

const lengthTips = [
  {
    title: "Consistent Low Pressure",
    description: "Use lower pressure for longer periods rather than high pressure for short bursts",
    importance: "high"
  },
  {
    title: "Heat Application",
    description: "Warming the area before sessions increases blood flow and tissue elasticity",
    importance: "high"
  },
  {
    title: "Progressive Tension", 
    description: "Gradually increase tension over weeks, not within single sessions",
    importance: "medium"
  },
  {
    title: "Rest Day Importance",
    description: "Allow 24-48 hours between sessions for tissue recovery and growth",
    importance: "high"
  },
  {
    title: "Jelqing Combination",
    description: "Combine pumping with manual exercises for enhanced results",
    importance: "medium"
  }
];

const girthTips = [
  {
    title: "Ring Positioning",
    description: "Proper ring placement at the base maximizes circumferential expansion",
    importance: "high"
  },
  {
    title: "Gradual Pressure Build",
    description: "Build pressure slowly to allow tissue to adapt and expand safely",
    importance: "high"
  },
  {
    title: "Circulation Monitoring",
    description: "Watch for color changes - slight darkening is normal, deep purple is not",
    importance: "high"
  },
  {
    title: "Short Sessions",
    description: "Girth sessions should be shorter than length sessions due to higher pressure",
    importance: "medium"
  },
  {
    title: "Post-Session Massage",
    description: "Gentle massage after sessions helps distribute fluid and maintain gains",
    importance: "medium"
  }
];

const generalTips = [
  {
    title: "Hydration is Key",
    description: "Stay well-hydrated before and after sessions for optimal tissue health",
    importance: "medium"
  },
  {
    title: "Diet and Nutrition",
    description: "Protein-rich diet supports tissue repair and growth",
    importance: "low"
  },
  {
    title: "Sleep Quality",
    description: "Quality sleep is when most tissue repair and growth occurs",
    importance: "medium"
  },
  {
    title: "Stress Management",
    description: "High stress levels can impair circulation and recovery",
    importance: "low"
  },
  {
    title: "Documentation",
    description: "Track progress with photos and measurements for motivation and safety",
    importance: "high"
  }
];

const progressStrategies = [
  {
    icon: Calendar,
    title: "Progressive Programming",
    description: "Start with 3 sessions per week, increase to 5 as you adapt"
  },
  {
    icon: TrendingUp,
    title: "Plateau Breaking",
    description: "If progress stalls, take a 1-week break then resume with modified routine"
  },
  {
    icon: Target,
    title: "Goal Setting",
    description: "Set realistic monthly targets - expect 0.1-0.2 inches per month maximum"
  },
  {
    icon: Zap,
    title: "Intensity Cycling",
    description: "Alternate between high and low intensity weeks to prevent adaptation"
  }
];

const importanceColors = {
  high: "bg-destructive/20 text-destructive border-destructive/30",
  medium: "bg-warning/20 text-warning border-warning/30", 
  low: "bg-success/20 text-success border-success/30"
};

export default function Tips() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Lightbulb className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Tips & Techniques
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Maximize your results with proven techniques and expert insights for safe, 
            effective enhancement routines.
          </p>
        </div>

        {/* Tips Tabs */}
        <Tabs defaultValue="length" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card">
            <TabsTrigger value="length" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Length</span>
            </TabsTrigger>
            <TabsTrigger value="girth" className="flex items-center space-x-2">
              <Maximize className="w-4 h-4" />
              <span className="hidden sm:inline">Girth</span>
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="length" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lengthTips.map((tip, index) => (
                <Card key={index} className="gradient-card shadow-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{tip.title}</CardTitle>
                      <Badge className={importanceColors[tip.importance]}>
                        {tip.importance}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{tip.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="girth" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {girthTips.map((tip, index) => (
                <Card key={index} className="gradient-card shadow-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{tip.title}</CardTitle>
                      <Badge className={importanceColors[tip.importance]}>
                        {tip.importance}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{tip.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generalTips.map((tip, index) => (
                <Card key={index} className="gradient-card shadow-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{tip.title}</CardTitle>
                      <Badge className={importanceColors[tip.importance]}>
                        {tip.importance}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{tip.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {progressStrategies.map((strategy, index) => (
                <Card key={index} className="gradient-card shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <strategy.icon className="w-5 h-5 text-primary" />
                      <span>{strategy.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{strategy.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Best Practices Summary */}
        <Card className="gradient-card shadow-glow">
          <CardHeader>
            <CardTitle className="text-center">🏆 Golden Rules for Success</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🐌</span>
                </div>
                <h4 className="font-semibold">Consistency Over Intensity</h4>
                <p className="text-sm text-muted-foreground">
                  Regular, moderate sessions beat intense, sporadic ones
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h4 className="font-semibold">Safety First Always</h4>
                <p className="text-sm text-muted-foreground">
                  No gain is worth risking injury or damage
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">📊</span>
                </div>
                <h4 className="font-semibold">Track Everything</h4>
                <p className="text-sm text-muted-foreground">
                  Measurements and photos show real progress
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}