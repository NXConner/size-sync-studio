import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Heart, Clock, Thermometer, Eye } from "lucide-react";

const safetyGuidelines = [
  {
    title: "General Preparation",
    icon: Thermometer,
    items: [
      "Warm up gently (e.g., warm shower or towel)",
      "Ensure a clean, private, comfortable environment",
      "Hydrate and avoid alcohol or recreational drugs",
      "Check that any equipment is clean and undamaged",
      "Set clear stop criteria if anything feels off"
    ]
  },
  {
    title: "While Using Any Method or Equipment",
    icon: Eye,
    items: [
      "Listen to your body and stop at the first sign of pain",
      "Avoid excessive force; slower and gentler is safer",
      "Take regular breaks to assess comfort and circulation",
      "Watch color/temperature changes and restore normal warmth",
      "If unsure, do less and consult a licensed clinician"
    ]
  },
  {
    title: "Warning Signs",
    icon: AlertTriangle,
    items: [
      "Bruising or dark discoloration",
      "Numbness, tingling, or loss of sensation",
      "Sharp, persistent, or increasing pain",
      "Unusual swelling or inflammation",
      "Cold, clammy, or pale skin"
    ]
  },
  {
    title: "Aftercare & Monitoring",
    icon: Heart,
    items: [
      "Gentle massage to restore circulation",
      "Use a cool compress briefly if needed",
      "Monitor for delayed symptoms over the next 24–48 hours",
      "Document any concerns for future reference",
      "Rest adequately before any future activity"
    ]
  }
];

const emergencySteps = [
  "Stop immediately",
  "Remove any equipment carefully",
  "Gently restore circulation and warmth",
  "Monitor symptoms closely",
  "Seek medical attention if symptoms persist or worsen",
  "Document the incident for your clinician"
];

export default function Safety() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Safety Guidelines
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your safety is our top priority. Please read and understand these guidelines 
            before starting any enhancement routine.
          </p>
        </div>

        {/* Critical Warning */}
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive-foreground">
            <strong>IMPORTANT:</strong> These routines carry inherent risks. Use at your own discretion. 
            Stop immediately if you experience any pain, discomfort, or unusual symptoms. 
            Consult a healthcare professional if you have any medical concerns.
          </AlertDescription>
        </Alert>

        {/* Safety Guidelines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {safetyGuidelines.map((section, index) => (
            <Card key={index} className="gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <section.icon className="w-5 h-5 text-primary" />
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Emergency Procedures */}
        <Card className="gradient-card shadow-card border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span>Emergency Procedures</span>
            </CardTitle>
            <CardDescription>
              If you experience any concerning symptoms, follow these steps immediately:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {emergencySteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <Badge variant="destructive" className="flex-shrink-0">
                    {index + 1}
                  </Badge>
                  <span className="text-sm text-destructive-foreground">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Equipment Safety */}
        <Card className="gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>Equipment & Hygiene</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-foreground">Equipment Care</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Clean before and after each use</li>
                  <li>• Use appropriate sanitizing solutions</li>
                  <li>• Inspect for wear, cracks, or damage</li>
                  <li>• Replace equipment regularly</li>
                  <li>• Store in clean, dry environment</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-foreground">Personal Hygiene</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Shower before sessions</li>
                  <li>• Use clean towels and materials</li>
                  <li>• Trim nails to prevent injury</li>
                  <li>• Use quality lubricants</li>
                  <li>• Maintain clean workspace</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="text-center p-6 bg-muted/20 rounded-lg border border-border/20">
          <p className="text-sm text-muted-foreground">
            <strong>Medical Disclaimer:</strong> This app is for educational purposes only and does not constitute medical advice. 
            Consult with a healthcare professional before beginning any enhancement routine. The developers are not responsible 
            for any injuries or adverse effects resulting from the use of this application.
          </p>
        </div>
      </div>
    </div>
  );
}