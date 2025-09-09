import { ReactNode } from "react";
import { MeasureLayoutType } from "../MeasureLayoutSelector";
import { cn } from "@/lib/utils";

interface LayoutRendererProps {
  layout: MeasureLayoutType;
  cameraSection: ReactNode;
  controlsSection: ReactNode;
  analyticsSection?: ReactNode;
  instructionsSection?: ReactNode;
  calibrationSection?: ReactNode;
  additionalSections?: ReactNode[];
  className?: string;
}

export function LayoutRenderer({
  layout,
  cameraSection,
  controlsSection,
  analyticsSection,
  instructionsSection,
  calibrationSection,
  additionalSections = [],
  className
}: LayoutRendererProps) {
  const renderLayout = () => {
    switch (layout) {
      case 'fullscreen':
        return (
          <div className="relative w-full h-screen">
            {cameraSection}
            <div className="absolute top-4 right-4 z-10 max-w-sm">
              {controlsSection}
            </div>
          </div>
        );

      case 'mobile-stack':
        return (
          <div className="flex flex-col space-y-4 p-4">
            <div className="w-full">
              {cameraSection}
            </div>
            <div className="w-full">
              {controlsSection}
            </div>
            {instructionsSection && (
              <div className="w-full">
                {instructionsSection}
              </div>
            )}
            {calibrationSection && (
              <div className="w-full">
                {calibrationSection}
              </div>
            )}
            {analyticsSection && (
              <div className="w-full">
                {analyticsSection}
              </div>
            )}
          </div>
        );

      case 'split-horizontal':
        return (
          <div className="flex flex-col h-screen">
            <div className="flex-1 p-4">
              {cameraSection}
            </div>
            <div className="h-1/3 border-t p-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>{controlsSection}</div>
                {calibrationSection && <div>{calibrationSection}</div>}
                {analyticsSection && <div>{analyticsSection}</div>}
              </div>
            </div>
          </div>
        );

      case 'grid-view':
        return (
          <div className="grid grid-cols-12 grid-rows-12 gap-4 h-screen p-4">
            <div className="col-span-8 row-span-8">
              {cameraSection}
            </div>
            <div className="col-span-4 row-span-6">
              {controlsSection}
            </div>
            <div className="col-span-4 row-span-6">
              {calibrationSection}
            </div>
            <div className="col-span-6 row-span-4">
              {instructionsSection}
            </div>
            <div className="col-span-6 row-span-4">
              {analyticsSection}
            </div>
          </div>
        );

      case 'sidebar-left':
        return (
          <div className="flex h-screen">
            <div className="w-80 border-r p-4 overflow-y-auto">
              <div className="space-y-4">
                {controlsSection}
                {calibrationSection}
                {instructionsSection && instructionsSection}
                {analyticsSection}
              </div>
            </div>
            <div className="flex-1 p-4">
              {cameraSection}
            </div>
          </div>
        );

      case 'sidebar-right':
        return (
          <div className="flex h-screen">
            <div className="flex-1 p-4">
              {cameraSection}
            </div>
            <div className="w-80 border-l p-4 overflow-y-auto">
              <div className="space-y-4">
                {controlsSection}
                {calibrationSection}
                {instructionsSection}
                {analyticsSection}
              </div>
            </div>
          </div>
        );

      case 'compact':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
            <div className="lg:col-span-2">
              {cameraSection}
            </div>
            <div className="space-y-4">
              {controlsSection}
              {calibrationSection}
            </div>
          </div>
        );

      case 'professional':
        return (
          <div className="grid grid-cols-12 gap-4 h-screen p-4">
            <div className="col-span-6">
              {cameraSection}
            </div>
            <div className="col-span-3 space-y-4 overflow-y-auto">
              {controlsSection}
              {calibrationSection}
            </div>
            <div className="col-span-3 space-y-4 overflow-y-auto">
              {analyticsSection}
              {instructionsSection}
              {additionalSections.map((section, index) => (
                <div key={index}>{section}</div>
              ))}
            </div>
          </div>
        );

      case 'beginner':
        return (
          <div className="max-w-6xl mx-auto p-4 space-y-6">
            {instructionsSection && (
              <div className="mb-6">
                {instructionsSection}
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {cameraSection}
              </div>
              <div className="space-y-4">
                {calibrationSection}
                {controlsSection}
              </div>
            </div>
          </div>
        );

      case 'tablet-landscape':
        return (
          <div className="flex h-screen">
            <div className="flex-1 p-4">
              {cameraSection}
            </div>
            <div className="w-96 p-4 overflow-y-auto">
              <div className="space-y-4">
                {controlsSection}
                {calibrationSection}
                {analyticsSection}
              </div>
            </div>
          </div>
        );

      case 'tablet-portrait':
        return (
          <div className="flex flex-col h-screen">
            <div className="flex-1 p-4">
              {cameraSection}
            </div>
            <div className="h-80 border-t p-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>{controlsSection}</div>
                <div>{calibrationSection}</div>
              </div>
              {analyticsSection && (
                <div className="mt-4">
                  {analyticsSection}
                </div>
              )}
            </div>
          </div>
        );

      case 'desktop-ultrawide':
        return (
          <div className="grid grid-cols-16 gap-4 h-screen p-4">
            <div className="col-span-10">
              {cameraSection}
            </div>
            <div className="col-span-3 space-y-4 overflow-y-auto">
              {controlsSection}
              {calibrationSection}
            </div>
            <div className="col-span-3 space-y-4 overflow-y-auto">
              {analyticsSection}
              {instructionsSection}
            </div>
          </div>
        );

      case 'focus-mode':
        return (
          <div className="relative w-full h-screen bg-black">
            <div className="absolute inset-4">
              {cameraSection}
            </div>
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-black/80 rounded-lg p-4 max-w-sm">
                {controlsSection}
              </div>
            </div>
          </div>
        );

      case 'comparison-mode':
        return (
          <div className="grid grid-cols-2 gap-4 h-screen p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Current Measurement</h3>
              {cameraSection}
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Previous Comparison</h3>
              <div className="bg-muted/50 rounded-lg aspect-video flex items-center justify-center">
                <span className="text-muted-foreground">Previous measurement overlay</span>
              </div>
              {controlsSection}
              {calibrationSection}
            </div>
          </div>
        );

      default: // 'default' layout
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
            <div className="lg:col-span-2 space-y-4">
              {cameraSection}
            </div>
            <div className="space-y-4">
              {instructionsSection}
              {calibrationSection}
              {controlsSection}
              {analyticsSection}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {renderLayout()}
    </div>
  );
}