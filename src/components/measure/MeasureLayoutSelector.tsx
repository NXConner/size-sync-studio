import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Layout,
  Columns2,
  Rows2,
  Grid3X3,
  Maximize,
  Monitor,
  Smartphone,
  Tablet,
  PanelLeft,
  PanelRight,
  Square,
  Target
} from "lucide-react";

export type MeasureLayoutType = 
  | 'default'           // Camera left, controls right
  | 'fullscreen'        // Camera only, minimal controls
  | 'mobile-stack'      // Vertical stack for mobile
  | 'split-horizontal'  // Top/bottom split
  | 'grid-view'         // Grid layout
  | 'sidebar-left'      // Controls on left
  | 'sidebar-right'     // Controls on right
  | 'compact'           // Minimal space usage
  | 'professional'      // Advanced analytics focus
  | 'beginner'          // Simplified interface
  | 'tablet-landscape'  // Optimized for tablets
  | 'tablet-portrait'   // Vertical tablet layout
  | 'desktop-ultrawide' // Wide screen optimization
  | 'focus-mode'        // Distraction-free measurement
  | 'comparison-mode';  // Side-by-side comparison

interface LayoutOption {
  id: MeasureLayoutType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'mobile' | 'tablet' | 'desktop' | 'specialized';
  features: string[];
  pros: string[];
  cons: string[];
  recommended: 'beginner' | 'intermediate' | 'advanced' | 'all';
}

const layoutOptions: LayoutOption[] = [
  {
    id: 'default',
    name: 'Default Layout',
    description: 'Standard camera-left, controls-right layout',
    icon: Columns2,
    category: 'desktop',
    features: ['Responsive design', 'Balanced layout', 'Easy navigation'],
    pros: ['Familiar interface', 'Good for all screen sizes', 'Quick access to controls'],
    cons: ['May feel cluttered on small screens'],
    recommended: 'all'
  },
  {
    id: 'fullscreen',
    name: 'Fullscreen Camera',
    description: 'Camera takes full screen with minimal overlay controls',
    icon: Maximize,
    category: 'specialized',
    features: ['Maximum camera view', 'Overlay controls', 'Gesture support'],
    pros: ['Maximum visibility', 'Immersive experience', 'Better for detailed work'],
    cons: ['Limited control access', 'May hide important settings'],
    recommended: 'intermediate'
  },
  {
    id: 'mobile-stack',
    name: 'Mobile Stack',
    description: 'Vertical stacking optimized for mobile devices',
    icon: Smartphone,
    category: 'mobile',
    features: ['Touch-optimized', 'Vertical scrolling', 'Large buttons'],
    pros: ['Perfect for phones', 'Easy thumb navigation', 'No horizontal scrolling'],
    cons: ['Less efficient on desktop', 'More scrolling required'],
    recommended: 'all'
  },
  {
    id: 'split-horizontal',
    name: 'Horizontal Split',
    description: 'Camera on top, controls on bottom',
    icon: Rows2,
    category: 'tablet',
    features: ['Wide camera view', 'Bottom control panel', 'Landscape optimized'],
    pros: ['Great for tablets', 'Wide aspect ratio support', 'Natural eye movement'],
    cons: ['Vertical space usage', 'May not suit portrait orientation'],
    recommended: 'intermediate'
  },
  {
    id: 'grid-view',
    name: 'Grid Layout',
    description: 'Multi-panel grid with customizable sections',
    icon: Grid3X3,
    category: 'desktop',
    features: ['Customizable panels', 'Multi-view support', 'Advanced analytics'],
    pros: ['Highly customizable', 'Professional appearance', 'Multiple data views'],
    cons: ['Complex for beginners', 'Requires larger screens'],
    recommended: 'advanced'
  },
  {
    id: 'sidebar-left',
    name: 'Left Sidebar',
    description: 'Controls in collapsible left sidebar',
    icon: PanelLeft,
    category: 'desktop',
    features: ['Collapsible sidebar', 'More camera space', 'Organized controls'],
    pros: ['Clean camera view', 'Organized layout', 'Space efficient'],
    cons: ['Extra clicks to access controls', 'Learning curve'],
    recommended: 'intermediate'
  },
  {
    id: 'sidebar-right',
    name: 'Right Sidebar',
    description: 'Controls in collapsible right sidebar',
    icon: PanelRight,
    category: 'desktop',
    features: ['Right-handed optimization', 'Collapsible sidebar', 'Clean interface'],
    pros: ['Right-handed friendly', 'Maximized camera view', 'Professional look'],
    cons: ['May feel backwards to some users', 'Requires sidebar interaction'],
    recommended: 'intermediate'
  },
  {
    id: 'compact',
    name: 'Compact Mode',
    description: 'Minimal interface with essential controls only',
    icon: Square,
    category: 'specialized',
    features: ['Minimal UI', 'Essential controls only', 'Space efficient'],
    pros: ['Less distracting', 'Faster loading', 'Good for small screens'],
    cons: ['Limited functionality', 'Advanced features hidden'],
    recommended: 'beginner'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Advanced analytics and professional tools focus',
    icon: Monitor,
    category: 'desktop',
    features: ['Advanced analytics', 'Multiple data panels', 'Professional tools'],
    pros: ['Maximum functionality', 'Detailed analytics', 'Professional appearance'],
    cons: ['Overwhelming for beginners', 'Requires large screen'],
    recommended: 'advanced'
  },
  {
    id: 'beginner',
    name: 'Beginner Friendly',
    description: 'Simplified interface with guided workflow',
    icon: Square,
    category: 'specialized',
    features: ['Step-by-step guidance', 'Simplified controls', 'Helpful tooltips'],
    pros: ['Easy to learn', 'Guided experience', 'Less overwhelming'],
    cons: ['Limited advanced features', 'May feel restrictive'],
    recommended: 'beginner'
  },
  {
    id: 'tablet-landscape',
    name: 'Tablet Landscape',
    description: 'Optimized for landscape tablet orientation',
    icon: Tablet,
    category: 'tablet',
    features: ['Touch-optimized', 'Landscape layout', 'Gesture support'],
    pros: ['Perfect for tablets', 'Touch-friendly', 'Good use of wide screen'],
    cons: ['Not ideal for other devices', 'Orientation dependent'],
    recommended: 'all'
  },
  {
    id: 'tablet-portrait',
    name: 'Tablet Portrait',
    description: 'Optimized for portrait tablet orientation',
    icon: Tablet,
    category: 'tablet',
    features: ['Portrait optimization', 'Vertical layout', 'Large touch targets'],
    pros: ['Natural tablet holding', 'Vertical space usage', 'Easy one-handed use'],
    cons: ['Limited to portrait', 'Less horizontal space'],
    recommended: 'all'
  },
  {
    id: 'desktop-ultrawide',
    name: 'Ultrawide Desktop',
    description: 'Optimized for ultrawide monitors and large displays',
    icon: Monitor,
    category: 'desktop',
    features: ['Multi-panel layout', 'Ultrawide support', 'Maximum screen usage'],
    pros: ['Uses full screen space', 'Multiple data views', 'Highly efficient'],
    cons: ['Requires ultrawide monitor', 'May be overwhelming'],
    recommended: 'advanced'
  },
  {
    id: 'focus-mode',
    name: 'Focus Mode',
    description: 'Distraction-free measurement interface',
    icon: Target,
    category: 'specialized',
    features: ['Minimal distractions', 'Focus on measurement', 'Clean interface'],
    pros: ['Better concentration', 'Reduced errors', 'Calming interface'],
    cons: ['Limited quick access', 'May hide useful features'],
    recommended: 'intermediate'
  },
  {
    id: 'comparison-mode',
    name: 'Comparison Mode',
    description: 'Side-by-side comparison with previous measurements',
    icon: Columns2,
    category: 'specialized',
    features: ['Side-by-side view', 'Progress comparison', 'Historical overlay'],
    pros: ['Easy comparison', 'Track progress', 'Visual feedback'],
    cons: ['Reduced individual view size', 'Requires previous data'],
    recommended: 'intermediate'
  }
];

interface MeasureLayoutSelectorProps {
  currentLayout: MeasureLayoutType;
  onLayoutChange: (layout: MeasureLayoutType) => void;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export function MeasureLayoutSelector({
  currentLayout,
  onLayoutChange,
  deviceType = 'desktop',
  userLevel = 'intermediate'
}: MeasureLayoutSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'mobile' | 'tablet' | 'desktop' | 'specialized'>('all');
  const [showPreview, setShowPreview] = useState(false);

  const filteredLayouts = layoutOptions.filter(layout => {
    if (selectedCategory === 'all') return true;
    return layout.category === selectedCategory;
  });

  const recommendedLayouts = layoutOptions.filter(layout => 
    layout.recommended === userLevel || layout.recommended === 'all'
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      case 'desktop': return Monitor;
      case 'specialized': return Grid3X3;
      default: return Layout;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mobile': return 'bg-blue-100 text-blue-700';
      case 'tablet': return 'bg-green-100 text-green-700';
      case 'desktop': return 'bg-purple-100 text-purple-700';
      case 'specialized': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRecommendedBadge = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-blue-100 text-blue-700';
      case 'advanced': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Measurement Layout Options
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Current: {layoutOptions.find(l => l.id === currentLayout)?.name}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Hide' : 'Show'} Previews
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
          >
            All Layouts
          </Button>
          {['mobile', 'tablet', 'desktop', 'specialized'].map((category) => {
            const Icon = getCategoryIcon(category);
            return (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category as any)}
              >
                <Icon className="w-4 h-4 mr-1" />
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            );
          })}
        </div>

        {/* Recommended Layouts */}
        {recommendedLayouts.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 text-sm text-muted-foreground">
              Recommended for {userLevel} users:
            </h4>
            <div className="flex flex-wrap gap-2">
              {recommendedLayouts.slice(0, 4).map((layout) => {
                const Icon = layout.icon;
                return (
                  <Button
                    key={layout.id}
                    size="sm"
                    variant={currentLayout === layout.id ? 'default' : 'outline'}
                    onClick={() => onLayoutChange(layout.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {layout.name}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLayouts.map((layout) => {
            const Icon = layout.icon;
            const isActive = currentLayout === layout.id;
            
            return (
              <Card 
                key={layout.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isActive ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => onLayoutChange(layout.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <CardTitle className="text-base">{layout.name}</CardTitle>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getCategoryColor(layout.category)}`}
                      >
                        {layout.category}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getRecommendedBadge(layout.recommended)}`}
                      >
                        {layout.recommended}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {layout.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-xs font-medium text-green-600 mb-1">Pros:</h5>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        {layout.pros.slice(0, 2).map((pro, index) => (
                          <li key={index}>• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-medium text-orange-600 mb-1">Features:</h5>
                      <div className="flex flex-wrap gap-1">
                        {layout.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {showPreview && (
                      <div className="border rounded p-2 bg-muted/50">
                        <div className="text-xs text-center text-muted-foreground">
                          Layout Preview Coming Soon
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Device-Specific Recommendations */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            {getCategoryIcon(deviceType) && React.createElement(getCategoryIcon(deviceType), { className: "w-4 h-4" })}
            {deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} Recommendations
          </h4>
          <div className="text-sm text-muted-foreground">
            {deviceType === 'mobile' && (
              <p>For mobile devices, consider <strong>Mobile Stack</strong> or <strong>Compact Mode</strong> for the best experience.</p>
            )}
            {deviceType === 'tablet' && (
              <p>For tablets, <strong>Tablet Landscape</strong> or <strong>Horizontal Split</strong> layouts work best depending on orientation.</p>
            )}
            {deviceType === 'desktop' && (
              <p>Desktop users can take advantage of <strong>Grid View</strong>, <strong>Professional</strong>, or <strong>Sidebar</strong> layouts for maximum functionality.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}