import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Box,
  Layers,
  TrendingUp,
  Users,
  FileText,
  Download,
  Share2,
  Globe,
  Shield,
  Zap,
  Brain,
  Camera,
  BarChart3,
  Settings,
  Smartphone
} from "lucide-react";

interface Phase3FeaturesProps {
  onFeatureToggle: (feature: string, enabled: boolean) => void;
  enabledFeatures: string[];
}

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: '3d' | 'reporting' | 'collaboration' | 'mobile' | 'analytics';
  status: 'active' | 'beta' | 'coming-soon';
  complexity: 'basic' | 'intermediate' | 'advanced';
  dependencies?: string[];
}

const phase3Features: Feature[] = [
  // 3D Measurement Capabilities
  {
    id: '3d-volume-estimation',
    name: '3D Volume Estimation',
    description: 'Calculate volume using multiple angle measurements',
    icon: Box,
    category: '3d',
    status: 'active',
    complexity: 'advanced'
  },
  {
    id: 'curvature-mapping',
    name: 'Curvature Heat Mapping',
    description: 'Visual curvature analysis with color-coded heat maps',
    icon: Layers,
    category: '3d',
    status: 'active',
    complexity: 'advanced'
  },
  {
    id: 'multi-angle-capture',
    name: 'Multi-Angle Capture',
    description: 'Capture and analyze from multiple camera angles',
    icon: Camera,
    category: '3d',
    status: 'beta',
    complexity: 'intermediate'
  },

  // Professional Reporting
  {
    id: 'medical-reports',
    name: 'Medical-Grade Reports',
    description: 'Generate professional medical reports with DICOM compliance',
    icon: FileText,
    category: 'reporting',
    status: 'active',
    complexity: 'advanced'
  },
  {
    id: 'progress-analytics',
    name: 'Advanced Progress Analytics',
    description: 'Comprehensive statistical analysis and trending',
    icon: TrendingUp,
    category: 'reporting',
    status: 'active',
    complexity: 'intermediate'
  },
  {
    id: 'export-formats',
    name: 'Multiple Export Formats',
    description: 'Export data in CSV, PDF, JSON, and medical formats',
    icon: Download,
    category: 'reporting',
    status: 'active',
    complexity: 'basic'
  },

  // Multi-User Collaboration
  {
    id: 'shared-sessions',
    name: 'Shared Measurement Sessions',
    description: 'Collaborate on measurements with healthcare providers',
    icon: Users,
    category: 'collaboration',
    status: 'beta',
    complexity: 'advanced',
    dependencies: ['cloud-sync']
  },
  {
    id: 'cloud-sync',
    name: 'Encrypted Cloud Sync',
    description: 'Secure cloud synchronization across devices',
    icon: Globe,
    category: 'collaboration',
    status: 'active',
    complexity: 'intermediate'
  },
  {
    id: 'share-results',
    name: 'Secure Result Sharing',
    description: 'Share measurement results with controlled access',
    icon: Share2,
    category: 'collaboration',
    status: 'active',
    complexity: 'intermediate'
  },

  // Mobile Enhancements
  {
    id: 'native-camera',
    name: 'Native Camera Integration',
    description: 'Enhanced mobile camera controls and optimization',
    icon: Smartphone,
    category: 'mobile',
    status: 'active',
    complexity: 'intermediate'
  },
  {
    id: 'haptic-feedback',
    name: 'Haptic Feedback',
    description: 'Tactile feedback for measurement events and guidance',
    icon: Zap,
    category: 'mobile',
    status: 'active',
    complexity: 'basic'
  },
  {
    id: 'offline-mode',
    name: 'Offline Measurement Mode',
    description: 'Full measurement capability without internet connection',
    icon: Shield,
    category: 'mobile',
    status: 'beta',
    complexity: 'intermediate'
  },

  // Advanced Analytics
  {
    id: 'ai-insights',
    name: 'AI-Powered Insights',
    description: 'Machine learning insights and recommendations',
    icon: Brain,
    category: 'analytics',
    status: 'active',
    complexity: 'advanced'
  },
  {
    id: 'statistical-analysis',
    name: 'Statistical Analysis Suite',
    description: 'Comprehensive statistical tools and modeling',
    icon: BarChart3,
    category: 'analytics',
    status: 'active',
    complexity: 'advanced'
  },
  {
    id: 'custom-dashboards',
    name: 'Customizable Dashboards',
    description: 'Create personalized analytics dashboards',
    icon: Settings,
    category: 'analytics',
    status: 'beta',
    complexity: 'intermediate'
  }
];

export function Phase3Features({ onFeatureToggle, enabledFeatures }: Phase3FeaturesProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | '3d' | 'reporting' | 'collaboration' | 'mobile' | 'analytics'>('all');
  const [featureProgress, setFeatureProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    // Simulate feature loading progress
    const progressUpdates = enabledFeatures.reduce((acc, featureId) => {
      acc[featureId] = Math.random() * 100;
      return acc;
    }, {} as Record<string, number>);
    setFeatureProgress(progressUpdates);
  }, [enabledFeatures]);

  const filteredFeatures = phase3Features.filter(feature => 
    selectedCategory === 'all' || feature.category === selectedCategory
  );

  const getCategoryStats = () => {
    const stats = {
      '3d': { total: 0, active: 0 },
      'reporting': { total: 0, active: 0 },
      'collaboration': { total: 0, active: 0 },
      'mobile': { total: 0, active: 0 },
      'analytics': { total: 0, active: 0 }
    };

    phase3Features.forEach(feature => {
      stats[feature.category].total++;
      if (enabledFeatures.includes(feature.id)) {
        stats[feature.category].active++;
      }
    });

    return stats;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'beta': return 'bg-blue-100 text-blue-700';
      case 'coming-soon': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'basic': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const canEnableFeature = (feature: Feature) => {
    if (!feature.dependencies) return true;
    return feature.dependencies.every(dep => enabledFeatures.includes(dep));
  };

  const stats = getCategoryStats();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Phase 3: Professional Tools
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {enabledFeatures.length} / {phase3Features.length} features enabled
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="3d">3D ({stats['3d'].active}/{stats['3d'].total})</TabsTrigger>
            <TabsTrigger value="reporting">Reports ({stats.reporting.active}/{stats.reporting.total})</TabsTrigger>
            <TabsTrigger value="collaboration">Collab ({stats.collaboration.active}/{stats.collaboration.total})</TabsTrigger>
            <TabsTrigger value="mobile">Mobile ({stats.mobile.active}/{stats.mobile.total})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics ({stats.analytics.active}/{stats.analytics.total})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFeatures.map((feature) => {
                const isEnabled = enabledFeatures.includes(feature.id);
                const canEnable = canEnableFeature(feature);
                const Icon = feature.icon;
                const progress = featureProgress[feature.id] || 0;

                return (
                  <Card 
                    key={feature.id} 
                    className={`transition-all duration-200 ${
                      isEnabled ? 'ring-2 ring-primary bg-primary/5' : ''
                    } ${!canEnable ? 'opacity-60' : ''}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5" />
                          <CardTitle className="text-base">{feature.name}</CardTitle>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getStatusColor(feature.status)}`}
                          >
                            {feature.status.replace('-', ' ')}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getComplexityColor(feature.complexity)}`}
                          >
                            {feature.complexity}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {feature.dependencies && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Dependencies:</p>
                            <div className="flex flex-wrap gap-1">
                              {feature.dependencies.map((dep) => (
                                <Badge 
                                  key={dep} 
                                  variant="outline" 
                                  className={`text-xs ${
                                    enabledFeatures.includes(dep) ? 'bg-green-100 text-green-700' : ''
                                  }`}
                                >
                                  {dep.replace('-', ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {isEnabled && progress > 0 && (
                          <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Loading...</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <Button
                            size="sm"
                            variant={isEnabled ? "default" : "outline"}
                            onClick={() => onFeatureToggle(feature.id, !isEnabled)}
                            disabled={!canEnable || feature.status === 'coming-soon'}
                          >
                            {isEnabled ? 'Enabled' : 'Enable'}
                          </Button>
                          
                          {feature.status === 'beta' && (
                            <Badge variant="secondary" className="text-xs">
                              Beta
                            </Badge>
                          )}
                          
                          {feature.status === 'coming-soon' && (
                            <Badge variant="outline" className="text-xs">
                              Coming Soon
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredFeatures.length === 0 && (
              <Alert>
                <AlertDescription>
                  No features available in this category.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>

        {/* Overall Progress */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Phase 3 Progress</span>
            <span className="text-sm text-muted-foreground">
              {enabledFeatures.length} / {phase3Features.length} features
            </span>
          </div>
          <Progress 
            value={(enabledFeatures.length / phase3Features.length) * 100} 
            className="h-3"
          />
        </div>
      </CardContent>
    </Card>
  );
}