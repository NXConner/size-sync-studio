import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { loadPose } from '@/lib/pose/mediapipeLoader';
import { scorePose, Landmarks, Point } from '@/lib/pose/match';
import { PoseTemplate, SexPosition, BodyJoint } from '../types';

interface LivePoseMatchProps {
  open: boolean;
  onClose: () => void;
  position: SexPosition;
}

const mpToBody: Record<number, BodyJoint> = {
  0: 'nose',
  11: 'leftShoulder', 12: 'rightShoulder',
  13: 'leftElbow', 14: 'rightElbow',
  15: 'leftWrist', 16: 'rightWrist',
  23: 'leftHip', 24: 'rightHip',
  25: 'leftKnee', 26: 'rightKnee',
  27: 'leftAnkle', 28: 'rightAnkle',
};

export const LivePoseMatch: React.FC<LivePoseMatchProps> = ({ open, onClose, position }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    if (!open) return;
    let stopper: (() => void) | null = null;

    (async () => {
      const api = await loadPose();
      await api.start(videoRef.current!, (res) => {
        if (!position.poseTemplate) return;
        const lm: Landmarks = {};
        res.landmarks.forEach((p, i) => {
          const key = mpToBody[i];
          if (!key) return;
          lm[key] = { x: p.x, y: p.y } as Point;
        });
        const s = scorePose(lm, position.poseTemplate as PoseTemplate);
        setScore(Number(s.score.toFixed(2)));
      });
      stopper = api.stop;
    })();

    return () => {
      try { stopper?.(); } catch {}
    };
  }, [open, position.poseTemplate]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Live Pose Match — {position.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          </div>
          <div className="text-sm text-muted-foreground">Match score: <span className="font-semibold">{(score * 100).toFixed(0)}%</span></div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
