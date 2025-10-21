import React, { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, RefreshCw, Shield, Video } from 'lucide-react';

const DEV_DEFAULT_URL = 'http://localhost:8081/';

function computeIframeSrc(): string {
  if (import.meta.env.DEV) {
    const devUrl = (import.meta.env.VITE_STUDIO_DEV_URL as string) || DEV_DEFAULT_URL;
    return devUrl;
  }
  return '/ssstudio/index.html';
}

export default function Studio() {
  const [key, setKey] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const src = useMemo(() => computeIframeSrc(), []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Video className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold">Size Sync Studio</h1>
            {import.meta.env.DEV ? (
              <Badge variant="secondary" className="ml-1">Dev</Badge>
            ) : (
              <Badge className="ml-1">Production</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setKey((v) => v + 1)} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Reload
            </Button>
            <a href={src} target="_blank" rel="noreferrer" className="inline-flex">
              <Button variant="secondary" size="sm" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> Open in new tab
              </Button>
            </a>
          </div>
        </div>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">About this integration</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              This page embeds the Size Sync Studio experience {import.meta.env.DEV ? 'from a local dev server' : 'from bundled static assets'}.
              Camera and microphone access remain within the embedded app when you grant permission.
            </p>
            {import.meta.env.DEV ? (
              <>
                <p>
                  Dev source: <code className="text-xs">{src}</code>
                </p>
                <p>
                  If the frame is blank, ensure the Studio dev server is running on port 8081, or set
                  <code className="mx-1">VITE_STUDIO_DEV_URL</code> and restart the dev server.
                </p>
              </>
            ) : (
              <p>
                Bundled path: <code className="text-xs">/ssstudio/index.html</code>. Use the build script to refresh assets.
              </p>
            )}
            <Separator />
            <div className="flex items-start gap-2 text-foreground">
              <Shield className="w-4 h-4 mt-0.5" />
              <div>
                Permissions: When prompted inside the frame, allow camera and microphone. No raw media is stored by the host app.
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-xl overflow-hidden border border-border/20 bg-muted/10">
          <iframe
            key={key}
            id="studio-iframe"
            ref={iframeRef}
            title="Size Sync Studio"
            src={src}
            className="w-full min-h-[80vh] bg-background"
            allow="camera; microphone; clipboard-read; clipboard-write; fullscreen"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
}
