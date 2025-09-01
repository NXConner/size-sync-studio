import React from 'react';
import { Slider } from '@mediax/components/ui/slider';
import { Switch } from '@mediax/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@mediax/components/ui/select';
import { WallpaperConfig } from '@mediax/components/BackgroundWallpaper';

interface WallpaperControlsProps {
  value: WallpaperConfig | null;
  onChange: (next: WallpaperConfig | null) => void;
}

export const WallpaperControls: React.FC<WallpaperControlsProps> = ({ value, onChange }) => {
  if (!value) {
    return null;
  }

  const setPartial = (partial: Partial<WallpaperConfig>) => {
    onChange({ ...value, ...partial });
  };

  return (
    <div className="mb-6 rounded-lg border border-gray-700 bg-gray-800/70 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-40">
          <label className="mb-1 block text-xs text-gray-400">Object Fit</label>
          <Select value={value.objectFit ?? 'cover'} onValueChange={(v) => setPartial({ objectFit: v as 'cover' | 'contain' })}>
            <SelectTrigger>
              <SelectValue placeholder="Fit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cover">Cover</SelectItem>
              <SelectItem value="contain">Contain</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grow max-w-sm">
          <label className="mb-1 block text-xs text-gray-400">Opacity ({Math.round((value.opacity ?? 1) * 100)}%)</label>
          <Slider
            value={[Math.round((value.opacity ?? 1) * 100)]}
            min={10}
            max={100}
            step={1}
            onValueChange={([v]) => setPartial({ opacity: v / 100 })}
          />
        </div>

        <div className="grow max-w-sm">
          <label className="mb-1 block text-xs text-gray-400">Blur ({value.blurPx ?? 0}px)</label>
          <Slider
            value={[value.blurPx ?? 0]}
            min={0}
            max={20}
            step={1}
            onValueChange={([v]) => setPartial({ blurPx: v })}
          />
        </div>

        <div className="grow max-w-sm">
          <label className="mb-1 block text-xs text-gray-400">Brightness ({(value.brightness ?? 1).toFixed(2)})</label>
          <Slider
            value={[Math.round(((value.brightness ?? 1) - 0.5) * 100)]}
            min={0}
            max={100}
            step={1}
            onValueChange={([v]) => setPartial({ brightness: 0.5 + v / 100 })}
          />
        </div>

        {value.type === 'video' && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Muted</label>
            <Switch checked={value.muted ?? true} onCheckedChange={(checked) => setPartial({ muted: !!checked })} />
            <label className="ml-4 text-xs text-gray-400">Loop</label>
            <Switch checked={value.loop ?? true} onCheckedChange={(checked) => setPartial({ loop: !!checked })} />
          </div>
        )}

        <div className="w-48">
          <label className="mb-1 block text-xs text-gray-400">Animation</label>
          <Select value={value.animation ?? 'none'} onValueChange={(v) => setPartial({ animation: v as WallpaperConfig['animation'] })}>
            <SelectTrigger>
              <SelectValue placeholder="Animation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="kenburns">Ken Burns</SelectItem>
              <SelectItem value="float">Float</SelectItem>
              <SelectItem value="tilt">Tilt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grow max-w-sm">
          <label className="mb-1 block text-xs text-gray-400">Animation Speed ({Math.round((value.animationSpeedMs ?? 20000) / 1000)}s)</label>
          <Slider
            value={[Math.max(5, Math.min(60, Math.round((value.animationSpeedMs ?? 20000) / 1000)))]}
            min={5}
            max={60}
            step={1}
            onValueChange={([v]) => setPartial({ animationSpeedMs: v * 1000 })}
          />
        </div>
      </div>
    </div>
  );
};

export default WallpaperControls;

