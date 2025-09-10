import { useEffect, useState } from 'react';
import type { Measurement } from '@/types';
import { getPhoto } from '@/utils/storage';

interface TimelineItem {
  id: string;
  date: string;
  url: string;
}

export const PhotosTimeline = ({ measurements }: { measurements: Measurement[] }) => {
  const [items, setItems] = useState<TimelineItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const withPhotos = measurements
        .filter((m) => m.photoUrl)
        .slice()
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const results: TimelineItem[] = [];
      for (const m of withPhotos) {
        try {
          const blob = await getPhoto(m.id);
          if (blob) {
            const url = URL.createObjectURL(blob);
            results.push({ id: m.id, date: m.date, url });
          }
        } catch {}
      }
      if (!cancelled) setItems(results);
      return () => {
        results.forEach((r) => URL.revokeObjectURL(r.url));
      };
    })();
    return () => {
      cancelled = true;
    };
  }, [measurements]);

  if (items.length === 0) {
    return <div className="text-sm text-muted-foreground">No progress photos yet.</div>;
  }

  return (
    <div className="flex gap-4 overflow-x-auto py-2">
      {items.map((it) => (
        <div key={it.id} className="min-w-[140px] flex-shrink-0">
          <div className="text-xs text-muted-foreground mb-1">{new Date(it.date).toLocaleDateString()}</div>
          <img src={it.url} alt="Progress" className="w-[140px] h-[140px] object-cover rounded-md border" />
        </div>
      ))}
    </div>
  );
};

