'use client';

import { useState } from 'react';
import { Copy, Check, Users, Video } from 'lucide-react';
import { buildShareLink } from '@/lib/sync-utils';
import { ParticipantInfo } from '@/hooks/use-camera-session';

interface SessionInfoProps {
  sessionId: string | null;
  participants: ParticipantInfo[];
}

export function SessionInfo({ sessionId, participants }: SessionInfoProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!sessionId) return;

    const link = buildShareLink(sessionId);
    
    try {
      await navigator?.clipboard?.writeText?.(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const onlineCount = participants?.filter?.((p) => p?.connected)?.length ?? 0;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
            <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Session ID</div>
            <div className="font-mono text-sm font-medium">{sessionId?.slice(0, 8)}...</div>
          </div>
        </div>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Link
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-gray-600 dark:text-gray-400">
          {onlineCount} {onlineCount === 1 ? 'device' : 'devices'} connected
        </span>
      </div>

      {(participants?.length ?? 0) > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Connected Devices</div>
          <div className="space-y-1">
            {participants?.map?.((participant) => (
              <div
                key={participant?.id}
                className="flex items-center gap-2 text-sm"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    participant?.connected ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
                <span className="font-medium">
                  {participant?.label} {participant?.isSelf ? '(You)' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
