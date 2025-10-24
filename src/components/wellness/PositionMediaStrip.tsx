import React, { useCallback, useEffect, useMemo, useState } from "react";
import { UploadDropzone } from "@mediax/components/UploadDropzone";
import { db, type MediaRecord } from "@mediax/lib/db";
import { usePinLock } from "@mediax/hooks/usePinLock";
import { encryptBlob, decryptToBlob } from "@mediax/lib/crypto";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImagePlus, Play } from "lucide-react";

type StripItem = {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail: string;
  title: string;
  uploadDate: Date;
  size: number;
  encIvHex?: string;
  encData?: Uint8Array;
  encMimeType?: string;
};

export interface PositionMediaStripProps {
  positionId: string;
  positionName: string;
}

const PositionMediaStrip: React.FC<PositionMediaStripProps> = ({ positionId, positionName }) => {
  const inputId = useMemo(() => `position-media-input-${positionId}`,[positionId]);
  const collection = useMemo(() => `wellness:${positionId}`,[positionId]);
  const { key, hasPin } = usePinLock();

  const [items, setItems] = useState<StripItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [active, setActive] = useState<StripItem | null>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string>("");

  const load = useCallback(async () => {
    const rows = await db.media.where("collection").equals(collection).sortBy("uploadDate");
    const mapped: StripItem[] = rows.reverse().map((r) => ({
      id: r.id,
      type: r.type,
      url: r.url,
      thumbnail: r.thumbnail || r.url,
      title: r.title,
      uploadDate: new Date(r.uploadDate),
      size: r.size,
      encIvHex: r.encIvHex,
      encData: r.encData,
      encMimeType: r.encMimeType,
    }));
    setItems(mapped);
  }, [collection]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    let revoked: string | null = null;
    const run = async () => {
      if (!active) { setResolvedUrl(""); return; }
      if (active.encIvHex && active.encData && active.encMimeType) {
        if (key) {
          try {
            const blob = await decryptToBlob(active.encIvHex, active.encData, key, active.encMimeType);
            const url = URL.createObjectURL(blob);
            revoked = url;
            setResolvedUrl(url);
          } catch {
            setResolvedUrl("");
          }
        } else {
          setResolvedUrl("");
        }
      } else {
        setResolvedUrl(active.url);
      }
    };
    run();
    return () => { if (revoked) URL.revokeObjectURL(revoked); };
  }, [active, key]);

  const onFileUpload = async (files: FileList) => {
    setIsUploading(true);
    setError(null);
    setProgress(0);
    try {
      const list = Array.from(files);
      const now = Date.now();
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        const id = `wellness-${positionId}-${now}-${i}`;
        const type: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
        let url = URL.createObjectURL(file);
        let thumb = url;
        let encIvHex: string | undefined;
        let encData: Uint8Array | undefined;
        let encMimeType: string | undefined;
        if (hasPin && key) {
          const enc = await encryptBlob(file, key);
          encIvHex = enc.ivHex;
          encData = enc.data;
          encMimeType = enc.mimeType;
          // Clear plaintext URLs if encrypted
          url = "";
          thumb = "";
        }
        const rec: MediaRecord = {
          id,
          type,
          url,
          thumbnail: thumb,
          title: file.name,
          collection,
          tags: ["wellness", positionId],
          uploadDate: now,
          size: file.size,
          encIvHex,
          encData,
          encMimeType,
        };
        await db.media.put(rec);
        setProgress(Math.round(((i + 1) / list.length) * 100));
      }
      await load();
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(undefined), 500);
    }
  };

  const openViewer = (item: StripItem) => {
    setActive(item);
    setViewerOpen(true);
  };

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-muted-foreground">Personal media</div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => document.getElementById(inputId)?.click()}>
            <ImagePlus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
          No media yet. Upload images, GIFs, or short videos that demonstrate {positionName}.
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.slice(0, 8).map((m) => (
            <button
              key={m.id}
              onClick={() => openViewer(m)}
              className="relative shrink-0 w-24 h-24 rounded-md overflow-hidden border hover:shadow-md transition-transform hover:scale-[1.02]"
              aria-label={`Open media ${m.title}`}
            >
              {m.type === "video" ? (
                <div className="w-full h-full bg-black/80 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
              ) : (
                <img src={m.thumbnail || m.url} alt={m.title} className="w-full h-full object-cover" loading="lazy" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      )}

      {/* Hidden input + optional dropzone portal */}
      <input
        id={inputId}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onFileUpload(e.target.files)}
      />
      {/* Lightweight inline uploader below strip for keyboard users and drag-drop UX */}
      <div className="mt-2">
        <UploadDropzone onFileUpload={onFileUpload} isUploading={isUploading} progress={progress} error={error} inputId={inputId} />
      </div>

      {/* Viewer */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-3xl bg-black text-white border-gray-700">
          {active && (
            <div className="relative">
              {active.type === "image" ? (
                <img src={resolvedUrl || active.url} alt={active.title} className="w-full h-auto rounded-md" />
              ) : (
                <video src={resolvedUrl || active.url} className="w-full h-auto rounded-md" controls autoPlay />
              )}
              <div className="mt-2 text-xs text-gray-300 flex items-center justify-between">
                <div className="truncate">{active.title}</div>
                <div>{(active.size / 1024 / 1024).toFixed(1)} MB</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PositionMediaStrip;
